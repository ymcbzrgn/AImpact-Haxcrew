"""
Session router - handles pitch session lifecycle
Now with in-memory storage fallback for development
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uuid
import os
import json
from datetime import datetime

router = APIRouter()

# In-memory session storage for development
_sessions: Dict[str, Dict[str, Any]] = {}


class SessionCreate(BaseModel):
    investor_mode: Optional[str] = "friendly"


class SessionResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None


def _get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Get session from in-memory storage"""
    return _sessions.get(session_id)


def _save_session(session_id: str, session_data: Dict[str, Any]):
    """Save session to in-memory storage"""
    _sessions[session_id] = session_data


async def _run_deck_analysis(session_id: str, file_bytes: bytes, file_ext: str):
    """Background task to analyze deck after upload"""
    print(f"[Analysis] Starting for session {session_id[:8]}...")
    try:
        from services.deck_analyzer import extract_slides, analyze_deck

        session = _get_session(session_id)
        if not session:
            print(f"[Analysis] Session {session_id[:8]} not found!")
            return

        # Update status to processing
        session["status"] = "processing"
        _save_session(session_id, session)
        print(f"[Analysis] Status set to processing")

        # Extract slides
        print(f"[Analysis] Extracting slides from {file_ext}...")
        slides = await extract_slides(file_bytes, file_ext)
        print(f"[Analysis] Extracted {len(slides)} slides, first has image: {bool(slides[0].get('image_base64')) if slides else 'N/A'}")

        # Save slide contents
        session["slide_contents"] = slides
        session["deck_format"] = file_ext.lstrip(".")
        _save_session(session_id, session)

        # Run analysis
        print(f"[Analysis] Running AI analysis...")
        analysis = await analyze_deck(slides, feedback_tone="constructive")
        print(f"[Analysis] AI analysis complete, success: {analysis.get('success')}")

        if analysis.get("success"):
            session["deck_analysis"] = analysis.get("data")
            session["status"] = "ready"
            print(f"[Analysis] Session {session_id[:8]} is READY with {len(slides)} slides")
        else:
            # Store error for debugging
            session["deck_analysis"] = {
                "error": analysis.get("error"),
                "raw_response": analysis.get("raw_response")
            }
            session["status"] = "analysis_failed"

        _save_session(session_id, session)

    except Exception as e:
        print(f"[ERROR] Deck analysis failed: {e}")
        session = _get_session(session_id)
        if session:
            session["status"] = "error"
            session["deck_analysis"] = {"error": str(e)}
            _save_session(session_id, session)


@router.post("/session")
async def create_session(body: SessionCreate = None):
    """Create a new pitch session"""
    mode = body.investor_mode if body else "friendly"
    session_id = str(uuid.uuid4())

    # Create session in memory
    session_data = {
        "id": session_id,
        "investor_mode": mode,
        "status": "created",
        "created_at": datetime.utcnow().isoformat(),
        "deck_path": None,
        "deck_format": None,
        "deck_analysis": None,
        "slide_contents": None,
        "pitch_transcript": None,
        "qa_transcript": [],
        "realtime_notes": [],
        "verdict": None,
        "final_score": None
    }
    _save_session(session_id, session_data)

    return SessionResponse(
        success=True,
        data={
            "session_id": session_id,
            "status": "created",
            "investor_mode": mode
        }
    )


@router.post("/session/{session_id}/upload")
async def upload_deck(
    session_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload pitch deck to session and trigger analysis"""

    session = _get_session(session_id)
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

    with open(file_path, "wb") as f:
        f.write(contents)

    # Update session
    session["deck_path"] = file_path
    session["status"] = "uploaded"
    _save_session(session_id, session)

    # Trigger background analysis
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
async def get_session(session_id: str):
    """Get session status and data"""

    session = _get_session(session_id)
    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    return SessionResponse(
        success=True,
        data={
            "session_id": session["id"],
            "status": session["status"],
            "investor_mode": session["investor_mode"],
            "deck_path": session["deck_path"],
            "deck_format": session["deck_format"],
            "deck_analysis": session["deck_analysis"],
            "slide_contents": session["slide_contents"],
            "created_at": session["created_at"]
        }
    )


@router.post("/session/{session_id}/start")
async def start_pitch(session_id: str):
    """Start the pitch session"""

    session = _get_session(session_id)
    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    if session["status"] not in ["uploaded", "ready", "processing"]:
        return SessionResponse(
            success=False,
            error={"code": "INVALID_STATE", "message": "Upload a deck first"}
        )

    session["status"] = "pitching"
    _save_session(session_id, session)

    return SessionResponse(
        success=True,
        data={
            "session_id": session_id,
            "status": "pitching",
            "message": "Connect to WebSocket to start"
        }
    )


@router.get("/session/{session_id}/verdict")
async def get_verdict(session_id: str):
    """Get final verdict and feedback"""

    session = _get_session(session_id)
    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    verdict = session.get("verdict")
    print(f"[Verdict API] Session {session_id[:8]}: verdict exists = {verdict is not None}")
    if verdict:
        print(f"[Verdict API] Verdict keys: {list(verdict.keys()) if isinstance(verdict, dict) else 'not a dict'}")
        print(f"[Verdict API] Feedback count: {len(verdict.get('feedback', []))}")

    return SessionResponse(
        success=True,
        data={
            "session_id": session["id"],
            "status": session["status"],
            "verdict": session["verdict"],
            "deck_analysis": session["deck_analysis"],
            "final_score": session["final_score"]
        }
    )


@router.get("/session/{session_id}/transcript")
async def get_transcript(session_id: str):
    """Get pitch transcript, Q&A transcript, and realtime notes"""

    session = _get_session(session_id)
    if not session:
        return SessionResponse(
            success=False,
            error={"code": "SESSION_NOT_FOUND", "message": "Session not found"}
        )

    # Parse transcripts
    pitch_transcript = []
    try:
        if session.get("pitch_transcript"):
            pitch_transcript = json.loads(session["pitch_transcript"])
    except json.JSONDecodeError:
        pitch_transcript = []

    return SessionResponse(
        success=True,
        data={
            "session_id": session["id"],
            "status": session["status"],
            "pitch_transcript": pitch_transcript,
            "qa_transcript": session.get("qa_transcript", []),
            "realtime_notes": session.get("realtime_notes", [])
        }
    )


# Helper to access sessions from other modules (e.g., websocket)
def get_session_data(session_id: str) -> Optional[Dict[str, Any]]:
    """Get session data for use in other modules"""
    return _get_session(session_id)


def update_session_data(session_id: str, updates: Dict[str, Any]):
    """Update session data from other modules"""
    session = _get_session(session_id)
    if session:
        session.update(updates)
        _save_session(session_id, session)
