"""
Session router - handles pitch session lifecycle
Now with PostgreSQL persistence and deck analysis trigger
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os
import aiofiles

from services.database import get_db
from models.session import Session

router = APIRouter()


class SessionCreate(BaseModel):
    investor_mode: Optional[str] = "friendly"


class SessionResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None


async def _run_deck_analysis(session_id: str, file_bytes: bytes, file_ext: str):
    """Background task to analyze deck after upload"""
    try:
        from services.deck_analyzer import extract_slides, analyze_deck
        from services.database import get_session_maker

        session_maker = get_session_maker()
        async with session_maker() as db:
            try:
                # Get session
                result = await db.execute(
                    select(Session).where(Session.id == uuid.UUID(session_id))
                )
                session = result.scalar_one_or_none()
                if not session:
                    return

                # Update status to processing
                session.status = "processing"
                await db.commit()

                # Extract slides
                slides = await extract_slides(file_bytes, file_ext)

                # Save slide contents
                session.slide_contents = slides
                session.deck_format = file_ext.lstrip(".")
                await db.commit()

                # Run analysis
                analysis = await analyze_deck(slides, feedback_tone="constructive")

                if analysis.get("success"):
                    session.deck_analysis = analysis.get("data")
                    session.status = "ready"
                else:
                    # Store error for debugging
                    session.deck_analysis = {
                        "error": analysis.get("error"),
                        "raw_response": analysis.get("raw_response")
                    }
                    session.status = "analysis_failed"

                await db.commit()

            except Exception as e:
                try:
                    session.status = "error"
                    session.deck_analysis = {"error": str(e)}
                    await db.commit()
                except Exception:
                    pass  # Silently fail if DB is unavailable

    except Exception:
        # Silently handle any errors (event loop closed, etc.)
        pass


@router.post("/session")
async def create_session(
    body: SessionCreate = None,
    db: AsyncSession = Depends(get_db)
):
    """Create a new pitch session"""
    mode = body.investor_mode if body else "friendly"

    # Create session in database
    session = Session(
        investor_mode=mode,
        status="created"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return SessionResponse(
        success=True,
        data={
            "session_id": str(session.id),
            "status": session.status,
            "investor_mode": session.investor_mode
        }
    )


@router.post("/session/{session_id}/upload")
async def upload_deck(
    session_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload pitch deck to session and trigger analysis"""

    # Check session exists
    try:
        result = await db.execute(
            select(Session).where(Session.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()
    except Exception:
        session = None

    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "image/png",
        "image/jpeg"
    ]
    if file.content_type not in allowed_types:
        return SessionResponse(
            success=False,
            error={
                "code": "INVALID_FILE_TYPE",
                "message": f"File type {file.content_type} not supported"
            }
        )

    # Read and validate file size (50MB limit)
    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        return SessionResponse(
            success=False,
            error={"code": "FILE_TOO_LARGE", "message": "File exceeds 50MB limit"}
        )

    # Save file to disk
    upload_dir = os.getenv("UPLOAD_DIR", "./data/uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Generate safe filename
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{session_id}{ext}"
    file_path = os.path.join(upload_dir, safe_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    # Update session
    session.deck_path = file_path
    session.status = "uploaded"
    await db.commit()

    # Trigger background analysis (skip in test mode for async stability)
    if not os.getenv("TESTING"):
        background_tasks.add_task(_run_deck_analysis, session_id, contents, ext)

    return SessionResponse(
        success=True,
        data={
            "session_id": session_id,
            "status": "uploaded",
            "filename": file.filename,
            "size": len(contents),
            "message": "Deck analysis started in background"
        }
    )


@router.get("/session/{session_id}")
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get session status and data"""

    try:
        result = await db.execute(
            select(Session).where(Session.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()
    except Exception:
        session = None

    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    return SessionResponse(
        success=True,
        data={
            "session_id": str(session.id),
            "status": session.status,
            "investor_mode": session.investor_mode,
            "deck_path": session.deck_path,
            "deck_format": session.deck_format,
            "deck_analysis": session.deck_analysis,
            "slide_contents": session.slide_contents,
            "created_at": session.created_at.isoformat() if session.created_at else None
        }
    )


@router.post("/session/{session_id}/start")
async def start_pitch(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Start the pitch session"""

    try:
        result = await db.execute(
            select(Session).where(Session.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()
    except Exception:
        session = None

    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    if session.status not in ["uploaded", "ready"]:
        return SessionResponse(
            success=False,
            error={"code": "INVALID_STATE", "message": "Upload a deck first"}
        )

    session.status = "pitching"
    await db.commit()

    return SessionResponse(
        success=True,
        data={
            "session_id": str(session.id),
            "status": "pitching",
            "message": "Connect to WebSocket to start"
        }
    )


@router.get("/session/{session_id}/verdict")
async def get_verdict(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get final verdict and feedback"""

    try:
        result = await db.execute(
            select(Session).where(Session.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()
    except Exception:
        session = None

    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    return SessionResponse(
        success=True,
        data={
            "session_id": str(session.id),
            "status": session.status,
            "verdict": session.verdict,
            "deck_analysis": session.deck_analysis,
            "final_score": session.final_score
        }
    )


@router.get("/session/{session_id}/analysis")
async def get_analysis(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get deck analysis result (with polling support)"""

    try:
        result = await db.execute(
            select(Session).where(Session.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()
    except Exception:
        session = None

    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    # Check if analysis is still processing
    if session.status == "processing":
        return SessionResponse(
            success=True,
            data={
                "session_id": str(session.id),
                "status": "processing",
                "message": "Analysis in progress, please poll again"
            }
        )

    return SessionResponse(
        success=True,
        data={
            "session_id": str(session.id),
            "status": session.status,
            "deck_analysis": session.deck_analysis,
            "slide_contents": session.slide_contents
        }
    )
