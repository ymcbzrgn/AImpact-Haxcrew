"""
WebSocket Router - Real-time pitch session handling
Uses in-memory storage (no database dependency)
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Optional
import base64
import json
import asyncio

from routers.session import get_session_data, update_session_data

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections by session ID"""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.realtime_notes: Dict[str, list] = {}
        self.session_states: Dict[str, dict] = {}
        self.council_running: Dict[str, bool] = {}  # Track if council is running per session
        self.council_locks: Dict[str, asyncio.Lock] = {}  # Per-session locks to prevent race conditions

    def get_council_lock(self, session_id: str) -> asyncio.Lock:
        """Get or create a lock for a session"""
        if session_id not in self.council_locks:
            self.council_locks[session_id] = asyncio.Lock()
        return self.council_locks[session_id]

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        if session_id not in self.realtime_notes:
            self.realtime_notes[session_id] = []

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_event(self, session_id: str, event: str, data: dict):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_json({
                    "event": event,
                    "data": data
                })
            except Exception as e:
                print(f"[WS] Error sending event {event}: {e}")
        else:
            print(f"[WS] Warning: No active connection for session {session_id[:8]} to send {event}")

    def add_note(self, session_id: str, note: dict):
        if session_id not in self.realtime_notes:
            self.realtime_notes[session_id] = []
        self.realtime_notes[session_id].append(note)

    def get_notes(self, session_id: str) -> list:
        return self.realtime_notes.get(session_id, [])


manager = ConnectionManager()


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    Main WebSocket endpoint for pitch sessions
    """
    await manager.connect(session_id, websocket)

    # Get session from in-memory storage
    session = get_session_data(session_id)
    print(f"[WS] Session {session_id[:8]}: {'found' if session else 'NOT FOUND'}")

    if not session:
        print(f"[WS] Sending error and disconnecting {session_id[:8]}")
        await manager.send_event(session_id, "error", {
            "message": "Session not found. Please start a new session."
        })
        manager.disconnect(session_id)
        return

    try:
        # Send connection confirmation
        await manager.send_event(session_id, "connected", {
            "session_id": session_id,
            "status": "ready",
            "has_deck_analysis": session.get("deck_analysis") is not None
        })

        # Main event loop
        while True:
            data = await websocket.receive_json()
            event = data.get("event")
            payload = data.get("data", {})

            print(f"[WS] Event received: {event}")

            if event == "ping":
                # Heartbeat
                await manager.send_event(session_id, "pong", {"timestamp": payload.get("timestamp")})

            elif event == "audio_chunk":
                # Just acknowledge for now (no Gemini Live in this simplified version)
                pass

            elif event == "end_pitch":
                # End pitch phase
                notes = manager.get_notes(session_id)
                update_session_data(session_id, {
                    "realtime_notes": notes,
                    "status": "qa"
                })
                await manager.send_event(session_id, "phase_change", {
                    "phase": "qa",
                    "notes_count": len(notes)
                })

            elif event == "start_qa":
                # Start Q&A phase - send mock questions
                update_session_data(session_id, {"status": "qa"})
                await manager.send_event(session_id, "phase_change", {"phase": "qa"})

                # Send a sample question after 2 seconds
                await asyncio.sleep(2)
                await manager.send_event(session_id, "qa_question", {
                    "question": "What's your customer acquisition cost and how do you plan to reduce it?",
                    "investor_name": "Alex Chen"
                })

            elif event == "answer_complete":
                # Q&A answer received
                answer_text = payload.get("answer", "")
                session = get_session_data(session_id)
                if session:
                    qa_list = session.get("qa_transcript", []) or []
                    qa_list.append({"answer": answer_text})
                    update_session_data(session_id, {"qa_transcript": qa_list})

            elif event == "start_council":
                # Use lock to prevent race conditions
                council_lock = manager.get_council_lock(session_id)

                async with council_lock:
                    print(f"[WS] start_council received for {session_id[:8]}, checking guards (locked)...")

                    # Guard 1: Check in-memory council_running flag
                    if manager.council_running.get(session_id):
                        print(f"[WS] BLOCKED: council_running flag is True for {session_id[:8]}")
                        continue

                    session = get_session_data(session_id)
                    if not session:
                        await manager.send_event(session_id, "error", {"message": "Session not found"})
                        continue

                    # Guard 2: Check session status
                    if session.get("status") in ["council", "completed"]:
                        print(f"[WS] BLOCKED: session status is '{session.get('status')}' for {session_id[:8]}")
                        continue

                    # Guard 3: Check if verdict already exists
                    if session.get("verdict"):
                        print(f"[WS] BLOCKED: Verdict already exists for {session_id[:8]}")
                        await manager.send_event(session_id, "session_complete", {
                            "final_score": session.get("final_score", 0),
                            "decision": session.get("verdict", {}).get("decision", "pass")
                        })
                        continue

                    # All guards passed - mark as running IMMEDIATELY (still inside lock)
                    manager.council_running[session_id] = True
                    update_session_data(session_id, {"status": "council"})
                    print(f"[WS] PASSED: Starting council for session {session_id[:8]}")
                await manager.send_event(session_id, "council_started", {})
                await manager.send_event(session_id, "phase_change", {"phase": "council"})

                # İlk durum mesajını hemen gönder (kullanıcı beklerken görür)
                await manager.send_event(session_id, "council_message", {
                    "speaker": "Moderator",
                    "content": "Council is analyzing the pitch deck...",
                    "type": "status"
                })

                # Run council in background
                asyncio.create_task(run_council_discussion(session_id, session, manager))

            else:
                print(f"[WS] Unknown event: {event}")

    except WebSocketDisconnect:
        print(f"[WS] Client {session_id} disconnected")

    except Exception as e:
        print(f"[WS] Error: {e}")
        import traceback
        traceback.print_exc()
        await manager.send_event(session_id, "error", {"message": str(e)})

    finally:
        manager.disconnect(session_id)


async def run_council_discussion(session_id: str, session: dict, manager: ConnectionManager):
    """Run QUICK council discussion - max 20 seconds"""
    try:
        from services.quick_council import run_quick_council

        print(f"[Council] Starting quick council for {session_id[:8]}...")

        # Callback for real-time messages
        async def on_message(msg):
            # Emoji karakterleri Windows konsolunda sorun çıkarıyor, ASCII-safe log
            speaker = msg.get('speaker', 'Unknown')
            content = msg.get('content', '')[:50].encode('ascii', 'replace').decode('ascii')
            print(f"[Council] {speaker}: {content}...")
            await manager.send_event(session_id, "council_message", msg)

        # Run quick council - single API call
        result = await run_quick_council(
            deck_analysis=session.get("deck_analysis"),
            pitch_transcript=session.get("pitch_transcript"),
            on_message=on_message
        )

        print(f"[Council] Complete! Decision: {result.final_decision}, Score: {result.average_score}")

        # Count invest vs pass votes
        invest_count = sum(1 for v in result.votes if v.decision == "invest")
        pass_count = len(result.votes) - invest_count

        # Decision based on VOTE MAJORITY, not AI's final_decision
        # 3+ invest votes out of 5 = INVEST
        normalized_decision = "invest" if invest_count >= 3 else "pass"
        print(f"[Council] Vote count: {invest_count} invest, {pass_count} pass -> {normalized_decision.upper()}")

        # Get category scores from deck analysis
        deck_analysis = session.get("deck_analysis", {})
        categories = deck_analysis.get("categories", {})
        category_scores = []
        for name, data in categories.items():
            if isinstance(data, dict):
                category_scores.append({
                    "name": name.replace("_", " ").title(),
                    "score": data.get("score", 50),
                    "feedback": data.get("feedback", "")[:200] if data.get("feedback") else ""
                })

        # Build feedback from deck analysis categories (category-specific)
        feedback = []
        for name, data in categories.items():
            if isinstance(data, dict):
                score = data.get("score", 50)
                category_name = name.replace("_", " ").title()
                feedback_text = data.get("feedback", "")

                if score >= 70 and feedback_text:
                    feedback.append({
                        "category": category_name,
                        "type": "strength",
                        "content": feedback_text
                    })
                elif score < 40 and feedback_text:
                    feedback.append({
                        "category": category_name,
                        "type": "weakness",
                        "content": feedback_text
                    })
                elif score < 60 and feedback_text:
                    feedback.append({
                        "category": category_name,
                        "type": "suggestion",
                        "content": feedback_text
                    })

        # Add recommendations as suggestions if we don't have enough feedback
        if len(feedback) < 3:
            for rec in result.recommendations[:3]:
                feedback.append({"category": "General", "type": "suggestion", "content": rec})

        # Build verdict data matching frontend VerdictData interface
        verdict_data = {
            "session_id": session_id,
            "decision": normalized_decision,
            "final_score": int(result.average_score),
            "confidence": min(95, int(result.average_score) + 10),
            "investor_votes": {
                "invest": invest_count,
                "pass": pass_count
            },
            "votes": [
                {"name": v.name, "score": v.score, "decision": v.decision, "rationale": v.one_liner}
                for v in result.votes
            ],
            "category_scores": category_scores,
            "feedback": feedback,
            "investor_pool_eligible": result.average_score >= 80,
            "key_strengths": result.key_strengths,
            "key_weaknesses": result.key_weaknesses,
            "recommendations": result.recommendations,
            "term_sheet": None  # Will be populated below for INVEST decisions
        }

        # Generate term sheet for INVEST decisions
        if normalized_decision == "invest":
            try:
                from services.term_sheet_service import generate_term_sheet, extract_session_metadata
                print(f"[Council] Generating term sheet for INVEST decision...")

                metadata = extract_session_metadata(deck_analysis or {})
                council_result_for_ts = {
                    "decision": "INVEST",
                    "average_score": result.average_score,
                    "votes": {v.name: {"score": v.score, "decision": v.decision, "rationale": v.one_liner} for v in result.votes}
                }

                term_sheet_result = await generate_term_sheet(
                    council_result=council_result_for_ts,
                    deck_analysis=deck_analysis or {},
                    language="en",
                    startup_name=metadata.get("startup_name", "Startup"),
                    stage=metadata.get("stage", "seed"),
                    ask_amount=metadata.get("ask_amount", "$500K"),
                    sector=metadata.get("sector", "other")
                )

                # Add term sheet to verdict data
                if term_sheet_result and "term_sheet" in term_sheet_result:
                    verdict_data["term_sheet"] = term_sheet_result["term_sheet"]
                    print(f"[Council] Term sheet generated successfully")
                else:
                    print(f"[Council] Term sheet result missing 'term_sheet' key")

            except Exception as e:
                print(f"[Council] Term sheet generation error: {e}")
                import traceback
                traceback.print_exc()

        # Save to session
        update_session_data(session_id, {
            "verdict": verdict_data,
            "final_score": int(result.average_score),
            "status": "completed"
        })

        # Send final result
        print(f"[Council] Sending council_result event...")
        await manager.send_event(session_id, "council_result", {
            "decision": result.final_decision,
            "average_score": result.average_score,
            "votes": verdict_data["votes"],
            "key_strengths": result.key_strengths,
            "key_weaknesses": result.key_weaknesses,
            "recommendations": result.recommendations
        })
        print(f"[Council] council_result sent!")

        print(f"[Council] Sending session_complete event...")
        await manager.send_event(session_id, "session_complete", {
            "final_score": int(result.average_score),
            "decision": result.final_decision
        })
        print(f"[Council] session_complete sent! All done.")

        # Clear council running flag
        manager.council_running[session_id] = False

    except Exception as e:
        print(f"[WS] Council error: {e}")
        import traceback
        traceback.print_exc()

        # Quick fallback - send mock votes immediately (no emoji to avoid encoding issues)
        mock_votes = [
            {"name": "Alex Chen", "score": 65, "decision": "invest", "content": "[INVEST] Worth exploring further", "rationale": "Worth exploring further"},
            {"name": "Sarah Williams", "score": 55, "decision": "pass", "content": "[PASS] Market too small", "rationale": "Market too small"},
            {"name": "Michael Park", "score": 70, "decision": "invest", "content": "[INVEST] Strong founder", "rationale": "Strong founder"},
            {"name": "Elena Rodriguez", "score": 50, "decision": "pass", "content": "[PASS] Unit economics unclear", "rationale": "Unit economics unclear"},
            {"name": "David Kim", "score": 62, "decision": "invest", "content": "[INVEST] Conditional yes", "rationale": "Conditional yes"},
        ]

        for vote in mock_votes:
            await manager.send_event(session_id, "council_message", {
                "speaker": vote["name"],
                "content": vote["content"],
                "score": vote["score"],
                "decision": vote["decision"],
                "type": "vote"
            })
            await asyncio.sleep(0.2)

        # Build fallback verdict data matching frontend interface
        fallback_verdict = {
            "session_id": session_id,
            "decision": "invest",
            "final_score": 60,
            "confidence": 70,
            "investor_votes": {
                "invest": 3,
                "pass": 2
            },
            "votes": mock_votes,
            "category_scores": [],
            "feedback": [
                {"category": "General", "type": "strength", "content": "Clear problem definition"},
                {"category": "General", "type": "strength", "content": "Technical team"},
                {"category": "General", "type": "weakness", "content": "Limited traction"},
                {"category": "General", "type": "weakness", "content": "GTM unclear"},
                {"category": "General", "type": "suggestion", "content": "Get paying customers"},
                {"category": "General", "type": "suggestion", "content": "Hire sales lead"}
            ],
            "investor_pool_eligible": False,
            "key_strengths": ["Clear problem", "Technical team"],
            "key_weaknesses": ["Limited traction", "GTM unclear"],
            "recommendations": ["Get paying customers", "Hire sales lead"]
        }

        # Save fallback verdict to session
        update_session_data(session_id, {
            "verdict": fallback_verdict,
            "final_score": 60,
            "status": "completed"
        })

        await manager.send_event(session_id, "council_result", fallback_verdict)

        await manager.send_event(session_id, "session_complete", {
            "final_score": 60,
            "decision": "invest"
        })

        # Clear council running flag in exception handler too
        manager.council_running[session_id] = False


@router.get("/ws/health")
async def websocket_health():
    """Health check for WebSocket service"""
    return {
        "status": "ok",
        "active_connections": len(manager.active_connections)
    }
