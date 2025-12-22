"""
Q&A Service - PitchDrill
Manages Q&A phase between AI investor and founder
Uses Gemini Live for real-time voice conversation
"""

from typing import Dict, Optional, List, Callable, Any
from services.live_audio_service import (
    get_or_create_session as get_or_create_live_session,
    close_session as close_live_session,
    LiveAudioSession
)
from services.gemini_service import generate_text_flash
from prompts.qa_investor import (
    get_qa_system_prompt,
    build_qa_context
)
import json
import asyncio


class QASession:
    """Manages a single Q&A session"""

    def __init__(
        self,
        session_id: str,
        slide_contents: List[Dict],
        pitch_transcript: str,
        investor_mode: str = "friendly",
        language: str = "tr",
        founder_response_time: int = 120,  # 2 minutes
        on_question: Optional[Callable] = None,
        on_answer: Optional[Callable] = None
    ):
        self.session_id = session_id
        self.slide_contents = slide_contents
        self.pitch_transcript = pitch_transcript
        self.investor_mode = investor_mode
        self.language = language
        self.founder_response_time = founder_response_time
        self.on_question = on_question
        self.on_answer = on_answer

        # State
        self.live_session: Optional[LiveAudioSession] = None
        self.qa_transcript: List[Dict] = []
        self.questions_asked = 0
        self.founder_time_used = 0
        self.is_active = False
        self.current_question: Optional[Dict] = None

    async def start(self):
        """Start Q&A session with Gemini Live"""
        # Build Q&A system prompt
        system_prompt = get_qa_system_prompt(self.investor_mode)

        # Build context
        context = build_qa_context(
            slide_contents=self.slide_contents,
            pitch_transcript=self.pitch_transcript,
            language=self.language,
            investor_mode=self.investor_mode,
            remaining_time=self.founder_response_time,
            questions_count=0,
            previous_qa=[]
        )

        # Combine prompt and context
        full_prompt = f"{system_prompt}\n\n{context}"

        # Start Gemini Live session
        self.live_session = await get_or_create_live_session(
            session_id=f"{self.session_id}_qa",
            system_instruction=full_prompt
        )

        self.is_active = True

        # Generate and ask first question
        await self._ask_next_question()

    async def _ask_next_question(self):
        """Generate and ask next question"""
        if not self.is_active:
            return

        # Check if we've used all founder time
        if self.founder_time_used >= self.founder_response_time:
            await self.end()
            return

        # Check if we've asked too many questions (max 5)
        if self.questions_asked >= 5:
            await self.end()
            return

        # Build context for question generation
        context = build_qa_context(
            slide_contents=self.slide_contents,
            pitch_transcript=self.pitch_transcript,
            language=self.language,
            investor_mode=self.investor_mode,
            remaining_time=self.founder_response_time - self.founder_time_used,
            questions_count=self.questions_asked,
            previous_qa=self.qa_transcript
        )

        # Generate question using Gemini Flash (fast)
        try:
            question_prompt = f"""Based on the context, generate your next question as a JSON object:

{{
  "question": "<your question text>",
  "intent": "<what you're probing for>",
  "topic": "<category: traction|market|team|product|financials|competition|other>",
  "is_followup": false | true
}}

Context:
{context}

Generate the question now. Return ONLY valid JSON, no markdown, no explanations."""

            question_json = await generate_text_flash(
                prompt=question_prompt,
                system_instruction=get_qa_system_prompt(self.investor_mode)
            )

            # Parse JSON response
            try:
                # Remove markdown code blocks if present
                question_json = question_json.strip()
                if question_json.startswith("```"):
                    # Extract JSON from code block
                    lines = question_json.split("\n")
                    question_json = "\n".join(lines[1:-1]) if len(lines) > 2 else question_json

                question_data = json.loads(question_json)
                self.current_question = question_data
                self.questions_asked += 1

                # Send question via Gemini Live (TTS)
                question_text = question_data.get("question", "")
                if question_text:
                    await self.live_session.send_text(question_text)

                    # Notify callback
                    if self.on_question:
                        await self.on_question({
                            "question": question_text,
                            "intent": question_data.get("intent", ""),
                            "topic": question_data.get("topic", ""),
                            "is_followup": question_data.get("is_followup", False),
                            "question_number": self.questions_asked
                        })

            except json.JSONDecodeError as e:
                print(f"[QA] Error parsing question JSON: {e}")
                print(f"[QA] Response was: {question_json}")
                # Fallback: use the text directly as question
                if question_json:
                    self.current_question = {
                        "question": question_json,
                        "intent": "general_inquiry",
                        "topic": "other",
                        "is_followup": False
                    }
                    await self.live_session.send_text(question_json)

        except Exception as e:
            print(f"[QA] Error generating question: {e}")
            await self.end()

    async def receive_answer(self, answer_text: str, answer_duration: int):
        """
        Process founder's answer

        Args:
            answer_text: Transcribed answer text
            answer_duration: Duration of answer in seconds
        """
        if not self.is_active or not self.current_question:
            return

        # Update time used
        self.founder_time_used += answer_duration

        # Save Q&A exchange
        qa_exchange = {
            "question": self.current_question.get("question", ""),
            "answer": answer_text,
            "intent": self.current_question.get("intent", ""),
            "topic": self.current_question.get("topic", ""),
            "is_followup": self.current_question.get("is_followup", False),
            "answer_duration": answer_duration,
            "timestamp": self.founder_time_used
        }

        self.qa_transcript.append(qa_exchange)

        # Notify callback
        if self.on_answer:
            await self.on_answer(qa_exchange)

        # Clear current question
        self.current_question = None

        # Ask next question if time remains
        if self.founder_time_used < self.founder_response_time and self.questions_asked < 5:
            await asyncio.sleep(1)  # Brief pause before next question
            await self._ask_next_question()
        else:
            await self.end()

    async def end(self):
        """End Q&A session"""
        if not self.is_active:
            return

        self.is_active = False

        # Close Gemini Live session
        if self.live_session:
            await close_live_session(f"{self.session_id}_qa")

        # Send end notification
        if self.on_question:  # Reuse callback for end event
            await self.on_question({
                "event": "qa_complete",
                "questions_asked": self.questions_asked,
                "founder_time_used": self.founder_time_used,
                "qa_transcript": self.qa_transcript
            })

    def get_transcript(self) -> List[Dict]:
        """Get Q&A transcript"""
        return self.qa_transcript.copy()

    def get_summary(self) -> Dict:
        """Get Q&A session summary"""
        return {
            "questions_asked": self.questions_asked,
            "founder_time_used": self.founder_time_used,
            "topics_covered": list(set([qa.get("topic", "other") for qa in self.qa_transcript])),
            "qa_transcript": self.qa_transcript
        }


# Session Manager - tracks all active Q&A sessions
_qa_sessions: Dict[str, QASession] = {}
_qa_lock = asyncio.Lock()


async def start_qa_session(
    session_id: str,
    slide_contents: List[Dict],
    pitch_transcript: str,
    investor_mode: str = "friendly",
    language: str = "tr",
    founder_response_time: int = 120,
    on_question: Optional[Callable] = None,
    on_answer: Optional[Callable] = None
) -> QASession:
    """
    Start a new Q&A session

    Args:
        session_id: Unique session identifier
        slide_contents: List of slide content dicts
        pitch_transcript: Full pitch transcript
        investor_mode: "shark" | "friendly" | "analyst"
        language: "tr" | "en"
        founder_response_time: Total time budget in seconds
        on_question: Callback when question is asked
        on_answer: Callback when answer is received

    Returns:
        QASession instance
    """
    async with _qa_lock:
        if session_id in _qa_sessions:
            # End existing session first
            await _qa_sessions[session_id].end()

        qa_session = QASession(
            session_id=session_id,
            slide_contents=slide_contents,
            pitch_transcript=pitch_transcript,
            investor_mode=investor_mode,
            language=language,
            founder_response_time=founder_response_time,
            on_question=on_question,
            on_answer=on_answer
        )

        await qa_session.start()
        _qa_sessions[session_id] = qa_session

        return qa_session


async def get_qa_session(session_id: str) -> Optional[QASession]:
    """Get existing Q&A session"""
    return _qa_sessions.get(session_id)


async def end_qa_session(session_id: str) -> bool:
    """
    End and remove Q&A session

    Returns:
        True if session was ended, False if not found
    """
    async with _qa_lock:
        if session_id in _qa_sessions:
            await _qa_sessions[session_id].end()
            del _qa_sessions[session_id]
            return True
        return False


async def receive_qa_answer(
    session_id: str,
    answer_text: str,
    answer_duration: int
) -> bool:
    """
    Process answer for Q&A session

    Returns:
        True if answer was processed, False if session not found
    """
    qa_session = await get_qa_session(session_id)
    if qa_session:
        await qa_session.receive_answer(answer_text, answer_duration)
        return True
    return False

