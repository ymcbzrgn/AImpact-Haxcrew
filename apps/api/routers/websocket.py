"""
WebSocket Router - Real-time pitch session handling
Integrates Gemini Live Audio for coaching
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Optional
from uuid import UUID
import base64
import json
import asyncio

from services.live_audio_service import (
    get_or_create_session as get_or_create_live_session,
    close_session as close_live_session,
)
from services.qa_service import (
    start_qa_session,
    receive_qa_answer,
    end_qa_session,
    get_qa_session
)
from services.term_sheet_service import (
    generate_term_sheet,
    extract_session_metadata
)
from services.rag_service import search_similar
from services.database import get_session_maker
from models.session import Session
from prompts.realtime_notes import (
    REALTIME_NOTES_SYSTEM_PROMPT,
    REALTIME_NOTES_CONTEXT_TEMPLATE,
)

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections by session ID"""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.realtime_notes: Dict[str, list] = {}  # Track notes per session
        self.session_states: Dict[str, dict] = {}  # Track session state for reconnection

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        if session_id not in self.realtime_notes:
            self.realtime_notes[session_id] = []

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        # Keep notes and session state for potential reconnection

    async def reconnect(self, session_id: str, websocket: WebSocket) -> dict:
        """Handle reconnection to existing session"""
        await websocket.accept()
        self.active_connections[session_id] = websocket

        # Return current session state for client to catch up
        state = self.session_states.get(session_id, {})
        notes = self.realtime_notes.get(session_id, [])

        return {
            "session_id": session_id,
            "status": "reconnected",
            "notes": notes,
            "phase": state.get("phase", "pitch"),
            "elapsed_seconds": state.get("elapsed_seconds", 0)
        }

    async def send_event(self, session_id: str, event: str, data: dict):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_json({
                    "event": event,
                    "data": data
                })
            except Exception as e:
                print(f"[WS] Error sending event {event}: {e}")
                # Client might have disconnected, but don't remove yet

    def add_note(self, session_id: str, note: dict):
        if session_id not in self.realtime_notes:
            self.realtime_notes[session_id] = []
        self.realtime_notes[session_id].append(note)

    def get_notes(self, session_id: str) -> list:
        return self.realtime_notes.get(session_id, [])

    def update_session_state(self, session_id: str, state: dict):
        """Update session state for reconnection handling"""
        self.session_states[session_id] = state

    def get_session_state(self, session_id: str) -> dict:
        return self.session_states.get(session_id, {})


manager = ConnectionManager()


async def build_session_context(session_id: str) -> tuple[str, Optional[dict]]:
    """
    Build context for Gemini Live from session data and RAG

    Returns:
        Tuple of (system_prompt, deck_analysis)
    """
    deck_analysis = None
    deck_summary = ""
    language = "tr"

    # Get session from database
    try:
        session_maker = get_session_maker()
        async with session_maker() as db:
            session = await db.get(Session, UUID(session_id))
            if session and session.deck_analysis:
                deck_analysis = session.deck_analysis
                deck_summary = json.dumps(deck_analysis, ensure_ascii=False, indent=2)
                # Detect language from deck
                if "language" in deck_analysis:
                    language = deck_analysis.get("language", "tr")
    except Exception as e:
        print(f"[WS] Error loading session: {e}")

    # Get RAG context for pitch coaching tips
    rag_context = ""
    try:
        rag_results = await search_similar(
            query="pitch coaching tips presentation advice",
            top_k=3,
            category="pitch_tips"
        )
        rag_context = "\n\n".join([r["content"] for r in rag_results])
    except Exception as e:
        print(f"[WS] Error loading RAG context: {e}")

    # Build full system prompt
    context = REALTIME_NOTES_CONTEXT_TEMPLATE.format(
        deck_analysis=deck_summary or "No deck analysis available",
        rag_context=rag_context or "No coaching tips available",
        session_id=session_id,
        language=language
    )

    full_prompt = REALTIME_NOTES_SYSTEM_PROMPT + "\n\n" + context

    return full_prompt, deck_analysis


async def process_gemini_response(
    session_id: str,
    response,
    elapsed_seconds: int = 0
):
    """
    Process response from Gemini Live and extract notes/audio

    Args:
        session_id: WebSocket session ID
        response: Gemini Live response object
        elapsed_seconds: Current pitch elapsed time
    """
    if not response.server_content:
        return

    # Check for model output
    if response.server_content.model_turn:
        for part in response.server_content.model_turn.parts:
            # Text response - could be a realtime note
            if hasattr(part, 'text') and part.text:
                text = part.text.strip()
                if text:
                    # Try to parse as JSON note
                    try:
                        note = json.loads(text)
                        if "note" in note and "type" in note:
                            # Valid realtime note
                            note["timestamp"] = elapsed_seconds
                            manager.add_note(session_id, note)
                            await manager.send_event(
                                session_id,
                                "realtime_note",
                                note
                            )
                    except json.JSONDecodeError:
                        # Not JSON, might be general response
                        pass

            # Audio response
            if hasattr(part, 'inline_data') and part.inline_data:
                audio_data = part.inline_data.data
                if audio_data:
                    await manager.send_event(
                        session_id,
                        "ai_speaking",
                        {
                            "audio": base64.b64encode(audio_data).decode(),
                            "mime_type": part.inline_data.mime_type
                        }
                    )


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    Main WebSocket endpoint for pitch sessions

    Events:
        Client -> Server:
            - audio_chunk: {audio: base64, timestamp: int}
            - end_pitch: {}
            - answer_complete: {answer: str}
            - reconnect: {} (for reconnection)

        Server -> Client:
            - connected: {session_id, status}
            - reconnected: {session_id, status, notes, phase, elapsed_seconds}
            - realtime_note: {note, type, timestamp}
            - ai_speaking: {audio: base64, mime_type}
            - phase_change: {phase: "qa" | "council" | "verdict"}
            - error: {message}
    """
    # Check if this is a reconnection
    is_reconnection = session_id in manager.active_connections

    if is_reconnection:
        # Handle reconnection
        reconnect_data = await manager.reconnect(session_id, websocket)
        await manager.send_event(session_id, "reconnected", reconnect_data)
    else:
        # New connection
        await manager.connect(session_id, websocket)

    live_session = None
    elapsed_seconds = 0

    try:
        # Build context and start Gemini Live session (only for new connections)
        if not is_reconnection:
            system_prompt, deck_analysis = await build_session_context(session_id)

            live_session = await get_or_create_live_session(
                session_id=session_id,
                system_instruction=system_prompt
            )

            # Send connection confirmation
            await manager.send_event(session_id, "connected", {
                "session_id": session_id,
                "status": "ready",
                "has_deck_analysis": deck_analysis is not None
            })

            # Start response listener task
            async def listen_for_responses():
                nonlocal elapsed_seconds
                try:
                    async for response in live_session.receive_responses():
                        await process_gemini_response(
                            session_id,
                            response,
                            elapsed_seconds
                        )
                except Exception as e:
                    print(f"[WS] Response listener error: {e}")

            response_task = asyncio.create_task(listen_for_responses())
        else:
            # For reconnection, get current state
            current_state = manager.get_session_state(session_id)
            elapsed_seconds = current_state.get("elapsed_seconds", 0)
            response_task = None  # Will be handled by existing session

        # Main event loop
        while True:
            data = await websocket.receive_json()
            event = data.get("event")
            payload = data.get("data", {})

            if event == "reconnect":
                # Client explicitly requesting reconnection state
                reconnect_data = await manager.reconnect(session_id, websocket)
                await manager.send_event(session_id, "reconnected", reconnect_data)
                continue

            elif event == "audio_chunk":
                # Decode and send audio to Gemini Live
                audio_b64 = payload.get("audio", "")
                if audio_b64:
                    audio_bytes = base64.b64decode(audio_b64)
                    await live_session.send_audio(audio_bytes)

                # Update elapsed time
                elapsed_seconds = payload.get("timestamp", elapsed_seconds)

                # Update session state
                manager.update_session_state(session_id, {
                    "phase": "pitch",
                    "elapsed_seconds": elapsed_seconds
                })

            elif event == "end_pitch":
                # Cancel response listener (if exists)
                if response_task:
                    response_task.cancel()

                # Get transcript from live session
                transcript = live_session.get_transcript()
                notes = manager.get_notes(session_id)

                # Save to database
                try:
                    session_maker = get_session_maker()
                    async with session_maker() as db:
                        session = await db.get(Session, UUID(session_id))
                        if session:
                            session.pitch_transcript = json.dumps(
                                transcript,
                                ensure_ascii=False
                            )
                            session.realtime_notes = notes
                            session.status = "qa"
                            await db.commit()
                except Exception as e:
                    print(f"[WS] Error saving transcript: {e}")

                # Notify client
                await manager.send_event(session_id, "phase_change", {
                    "phase": "qa",
                    "notes_count": len(notes)
                })

            elif event == "start_qa":
                # Start Q&A phase
                try:
                    session_maker = get_session_maker()
                    async with session_maker() as db:
                        session = await db.get(Session, UUID(session_id))
                        if not session:
                            await manager.send_event(session_id, "error", {
                                "message": "Session not found"
                            })
                            continue

                        # Get required data
                        slide_contents = session.slide_contents or []
                        pitch_transcript = session.pitch_transcript or ""
                        investor_mode = session.investor_mode or "friendly"
                        
                        # Detect language
                        language = "tr"
                        if session.deck_analysis:
                            language = session.deck_analysis.get("language", "tr")

                        # Callbacks for Q&A events
                        async def on_qa_question(qa_data: dict):
                            """Handle when AI asks a question"""
                            if qa_data.get("event") == "qa_complete":
                                # Q&A completed
                                await manager.send_event(session_id, "qa_complete", {
                                    "questions_asked": qa_data.get("questions_asked", 0),
                                    "founder_time_used": qa_data.get("founder_time_used", 0),
                                    "qa_transcript": qa_data.get("qa_transcript", [])
                                })
                                
                                # Update session status
                                async with session_maker() as db2:
                                    sess = await db2.get(Session, UUID(session_id))
                                    if sess:
                                        sess.qa_transcript = qa_data.get("qa_transcript", [])
                                        sess.status = "council"
                                        await db2.commit()
                                
                                await manager.send_event(session_id, "phase_change", {
                                    "phase": "council"
                                })
                            else:
                                # Question asked
                                await manager.send_event(session_id, "qa_question", qa_data)

                        async def on_qa_answer(qa_data: dict):
                            """Handle when founder answers"""
                            # Answer received, save to DB
                            try:
                                async with session_maker() as db2:
                                    sess = await db2.get(Session, UUID(session_id))
                                    if sess:
                                        qa_list = sess.qa_transcript or []
                                        qa_list.append(qa_data)
                                        sess.qa_transcript = qa_list
                                        await db2.commit()
                            except Exception as e:
                                print(f"[WS] Error saving Q&A answer: {e}")

                        # Start Q&A session
                        qa_session = await start_qa_session(
                            session_id=session_id,
                            slide_contents=slide_contents,
                            pitch_transcript=pitch_transcript,
                            investor_mode=investor_mode,
                            language=language,
                            founder_response_time=120,  # 2 minutes
                            on_question=on_qa_question,
                            on_answer=on_qa_answer
                        )

                        # Update session status
                        session.status = "qa"
                        await db.commit()

                        # Notify client
                        await manager.send_event(session_id, "phase_change", {
                            "phase": "qa",
                            "investor_mode": investor_mode
                        })

                except Exception as e:
                    print(f"[WS] Error starting Q&A: {e}")
                    await manager.send_event(session_id, "error", {
                        "message": f"Q&A error: {str(e)}"
                    })

            elif event == "answer_complete":
                # Q&A answer received from founder
                answer_text = payload.get("answer", "")
                answer_duration = payload.get("duration", 0)  # Duration in seconds

                if answer_text:
                    # Process answer through Q&A service
                    processed = await receive_qa_answer(
                        session_id=session_id,
                        answer_text=answer_text,
                        answer_duration=answer_duration
                    )

                    if not processed:
                        # Fallback: save directly if Q&A session not active
                        try:
                            session_maker = get_session_maker()
                            async with session_maker() as db:
                                session = await db.get(Session, UUID(session_id))
                                if session:
                                    qa_list = session.qa_transcript or []
                                    qa_list.append({
                                        "answer": answer_text,
                                        "duration": answer_duration
                                    })
                                    session.qa_transcript = qa_list
                                    await db.commit()
                        except Exception as e:
                            print(f"[WS] Error saving Q&A answer (fallback): {e}")

            elif event == "end_qa":
                # Manually end Q&A session
                await end_qa_session(session_id)
                
                # Update session status
                try:
                    session_maker = get_session_maker()
                    async with session_maker() as db:
                        session = await db.get(Session, UUID(session_id))
                        if session:
                            session.status = "council"
                            await db.commit()
                    
                    await manager.send_event(session_id, "phase_change", {
                        "phase": "council"
                    })
                except Exception as e:
                    print(f"[WS] Error ending Q&A: {e}")

            elif event == "start_council":
                # Start council debate with 5 VC panelists
                from services.council_service import (
                    start_council_session,
                    close_council_session
                )

                try:
                    session_maker = get_session_maker()
                    async with session_maker() as db:
                        session = await db.get(Session, UUID(session_id))
                        if session:
                            session.status = "council"
                            await db.commit()

                            # Callback for real-time council messages
                            async def on_council_message(msg):
                                await manager.send_event(
                                    session_id,
                                    "council_message",
                                    msg
                                )

                            # Detect language from deck
                            language = "tr"
                            if session.deck_analysis:
                                language = session.deck_analysis.get("language", "tr")

                            # Start council session
                            council = await start_council_session(
                                session_id=session_id,
                                deck_analysis=session.deck_analysis,
                                pitch_transcript=session.pitch_transcript,
                                qa_transcript=session.qa_transcript,
                                realtime_notes=session.realtime_notes,
                                investor_mode=session.investor_mode or "shark",
                                language=language,
                                on_message=on_council_message
                            )

                            # Notify client that council is starting
                            await manager.send_event(session_id, "phase_change", {
                                "phase": "council"
                            })

                            # Run council in background task
                            async def run_council_and_save():
                                try:
                                    result = await council.run()

                                    # Generate term sheet or feedback report
                                    term_sheet_data = None
                                    try:
                                        # Get session data for term sheet generation
                                        async with session_maker() as db_temp:
                                            sess_temp = await db_temp.get(Session, UUID(session_id))
                                            if sess_temp and sess_temp.deck_analysis:
                                                # Extract metadata
                                                metadata = extract_session_metadata(sess_temp.deck_analysis)
                                                
                                                # Build council result dict
                                                council_result_dict = {
                                                    "decision": result.decision.value,
                                                    "average_score": result.average_score,
                                                    "votes": {
                                                        k: {"score": v.score, "rationale": v.rationale}
                                                        for k, v in result.votes.items()
                                                    },
                                                    "key_strengths": result.key_strengths,
                                                    "key_concerns": result.key_concerns,
                                                    "investor_ready_pool": result.investor_ready_pool
                                                }
                                                
                                                # Detect language
                                                lang = "tr"
                                                if sess_temp.deck_analysis:
                                                    lang = sess_temp.deck_analysis.get("language", "tr")
                                                
                                                # Generate term sheet
                                                term_sheet_data = await generate_term_sheet(
                                                    council_result=council_result_dict,
                                                    deck_analysis=sess_temp.deck_analysis,
                                                    language=lang,
                                                    startup_name=metadata["startup_name"],
                                                    stage=metadata["stage"],
                                                    ask_amount=metadata["ask_amount"],
                                                    sector=metadata["sector"]
                                                )
                                    except Exception as e:
                                        print(f"[WS] Error generating term sheet: {e}")
                                        term_sheet_data = None

                                    # Build verdict with term sheet
                                    verdict_data = council.get_verdict()
                                    if term_sheet_data:
                                        verdict_data["term_sheet"] = term_sheet_data

                                    # Save to database
                                    async with session_maker() as db2:
                                        sess = await db2.get(Session, UUID(session_id))
                                        if sess:
                                            sess.council_dialog = council.get_dialog()
                                            sess.verdict = verdict_data
                                            sess.final_score = int(result.average_score)
                                            sess.status = "completed"
                                            await db2.commit()

                                    # Notify client of result
                                    await manager.send_event(
                                        session_id,
                                        "council_result",
                                        {
                                            "decision": result.decision.value,
                                            "average_score": result.average_score,
                                            "votes": {
                                                k: {"score": v.score, "rationale": v.rationale}
                                                for k, v in result.votes.items()
                                            },
                                            "investor_ready_pool": result.investor_ready_pool
                                        }
                                    )

                                    # Session complete
                                    await manager.send_event(
                                        session_id,
                                        "session_complete",
                                        {
                                            "final_score": int(result.average_score),
                                            "decision": result.decision.value,
                                            "verdict_url": f"/verdict/{session_id}",
                                            "has_term_sheet": term_sheet_data is not None
                                        }
                                    )

                                except Exception as e:
                                    print(f"[WS] Council error: {e}")
                                    await manager.send_event(session_id, "error", {
                                        "message": f"Council error: {str(e)}"
                                    })
                                finally:
                                    await close_council_session(session_id)

                            asyncio.create_task(run_council_and_save())

                except Exception as e:
                    print(f"[WS] Error starting council: {e}")
                    await manager.send_event(session_id, "error", {
                        "message": str(e)
                    })

            else:
                print(f"[WS] Unknown event: {event}")

    except WebSocketDisconnect:
        print(f"[WS] Client {session_id} disconnected")

    except Exception as e:
        print(f"[WS] Error: {e}")
        await manager.send_event(session_id, "error", {
            "message": str(e)
        })

    finally:
        # Cleanup
        await close_live_session(session_id)
        manager.disconnect(session_id)


@router.get("/ws/health")
async def websocket_health():
    """Health check for WebSocket service"""
    return {
        "status": "ok",
        "active_connections": len(manager.active_connections)
    }
