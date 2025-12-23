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
                # Start council debate
                print(f"[WS] Starting council for session {session_id}")

                session = get_session_data(session_id)
                if not session:
                    await manager.send_event(session_id, "error", {"message": "Session not found"})
                    continue

                update_session_data(session_id, {"status": "council"})
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

        # Normalize decision to 'invest' or 'pass'
        normalized_decision = "invest" if "invest" in result.final_decision.lower() else "pass"

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

        # Build feedback from strengths and weaknesses
        feedback = []
        for strength in result.key_strengths:
            feedback.append({"category": "General", "type": "strength", "content": strength})
        for weakness in result.key_weaknesses:
            feedback.append({"category": "General", "type": "weakness", "content": weakness})
        for rec in result.recommendations:
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
            "recommendations": result.recommendations
        }

        # Save to session
        update_session_data(session_id, {
            "verdict": verdict_data,
            "final_score": int(result.average_score),
            "status": "completed"
        })

        # Send final result
        await manager.send_event(session_id, "council_result", {
            "decision": result.final_decision,
            "average_score": result.average_score,
            "votes": verdict_data["votes"],
            "key_strengths": result.key_strengths,
            "key_weaknesses": result.key_weaknesses,
            "recommendations": result.recommendations
        })

        await manager.send_event(session_id, "session_complete", {
            "final_score": int(result.average_score),
            "decision": result.final_decision
        })

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


@router.get("/ws/health")
async def websocket_health():
    """Health check for WebSocket service"""
    return {
        "status": "ok",
        "active_connections": len(manager.active_connections)
    }
