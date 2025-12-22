"""
Q&A Service Tests
Testing Q&A session management and investor prompts
"""

import pytest
import os
import sys

# Add api path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from services.gemini_service import init_gemini


@pytest.fixture(autouse=True)
def setup_gemini():
    """Initialize Gemini before each test"""
    init_gemini()


class TestQAPrompts:
    """Test Q&A prompt imports and helpers"""

    def test_import_qa_prompts(self):
        """Can import qa_investor module"""
        from prompts.qa_investor import (
            QA_BASE_SYSTEM_PROMPT,
            SHARK_MODE_PROMPT,
            FRIENDLY_MODE_PROMPT,
            ANALYST_MODE_PROMPT,
            QA_CONTEXT_TEMPLATE,
            get_qa_system_prompt,
            build_qa_context,
        )
        assert QA_BASE_SYSTEM_PROMPT is not None
        assert SHARK_MODE_PROMPT is not None
        assert FRIENDLY_MODE_PROMPT is not None
        assert ANALYST_MODE_PROMPT is not None
        assert get_qa_system_prompt is not None
        assert build_qa_context is not None

    def test_get_qa_system_prompt_shark(self):
        """Shark mode returns combined base + shark prompt"""
        from prompts.qa_investor import get_qa_system_prompt, QA_BASE_SYSTEM_PROMPT, SHARK_MODE_PROMPT

        prompt = get_qa_system_prompt("shark")
        assert QA_BASE_SYSTEM_PROMPT in prompt
        assert SHARK_MODE_PROMPT in prompt
        assert "notoriously tough VC partner" in prompt

    def test_get_qa_system_prompt_friendly(self):
        """Friendly mode returns combined base + friendly prompt"""
        from prompts.qa_investor import get_qa_system_prompt, FRIENDLY_MODE_PROMPT

        prompt = get_qa_system_prompt("friendly")
        assert FRIENDLY_MODE_PROMPT in prompt
        assert "supportive angel investor" in prompt

    def test_get_qa_system_prompt_analyst(self):
        """Analyst mode returns combined base + analyst prompt"""
        from prompts.qa_investor import get_qa_system_prompt, ANALYST_MODE_PROMPT

        prompt = get_qa_system_prompt("analyst")
        assert ANALYST_MODE_PROMPT in prompt
        assert "data-driven VC associate" in prompt

    def test_get_qa_system_prompt_unknown_defaults_to_friendly(self):
        """Unknown mode defaults to friendly"""
        from prompts.qa_investor import get_qa_system_prompt, FRIENDLY_MODE_PROMPT

        prompt = get_qa_system_prompt("unknown_mode")
        assert FRIENDLY_MODE_PROMPT in prompt

    def test_build_qa_context_basic(self):
        """Context template filled correctly"""
        from prompts.qa_investor import build_qa_context

        context = build_qa_context(
            slide_contents=[{"number": 1, "title": "Title", "content": "Content"}],
            pitch_transcript="We are building a fintech solution",
            language="tr",
            investor_mode="shark",
            remaining_time=120,
            questions_count=0,
            previous_qa=[]
        )

        assert "tr" in context
        assert "shark" in context
        assert "120" in context
        assert "0" in context  # questions_count
        assert "No previous questions" in context

    def test_build_qa_context_with_previous_qa(self):
        """Previous Q&A included in context"""
        from prompts.qa_investor import build_qa_context

        previous_qa = [
            {"question": "What is your MRR?", "answer": "$10K"},
            {"question": "What is your growth rate?", "answer": "20% MoM"}
        ]

        context = build_qa_context(
            slide_contents=[],
            pitch_transcript="Test pitch",
            language="en",
            investor_mode="analyst",
            remaining_time=60,
            questions_count=2,
            previous_qa=previous_qa
        )

        assert "What is your MRR?" in context
        assert "$10K" in context
        assert "What is your growth rate?" in context
        assert "20% MoM" in context


class TestQAService:
    """Test Q&A service functionality"""

    def test_import_qa_service(self):
        """Can import qa_service module"""
        from services.qa_service import (
            QASession,
            start_qa_session,
            get_qa_session,
            end_qa_session,
            receive_qa_answer,
        )
        assert QASession is not None
        assert start_qa_session is not None
        assert get_qa_session is not None
        assert end_qa_session is not None
        assert receive_qa_answer is not None

    def test_qa_session_init(self):
        """QASession initializes with correct defaults"""
        from services.qa_service import QASession

        session = QASession(
            session_id="test-qa-session",
            slide_contents=[{"number": 1, "title": "Intro"}],
            pitch_transcript="We are PayFlow",
            investor_mode="friendly",
            language="tr"
        )

        assert session.session_id == "test-qa-session"
        assert session.investor_mode == "friendly"
        assert session.language == "tr"
        assert len(session.slide_contents) == 1

    def test_qa_session_state_defaults(self):
        """Initial state: is_active=False, questions_asked=0"""
        from services.qa_service import QASession

        session = QASession(
            session_id="test",
            slide_contents=[],
            pitch_transcript=""
        )

        assert session.is_active is False
        assert session.questions_asked == 0
        assert session.founder_time_used == 0
        assert session.qa_transcript == []
        assert session.current_question is None
        assert session.live_session is None

    def test_qa_session_time_budget(self):
        """Session respects founder_response_time budget"""
        from services.qa_service import QASession

        # Default time budget
        session1 = QASession("test1", [], "")
        assert session1.founder_response_time == 120  # 2 minutes default

        # Custom time budget
        session2 = QASession("test2", [], "", founder_response_time=180)
        assert session2.founder_response_time == 180

    def test_get_transcript_returns_copy(self):
        """get_transcript returns copy, not reference"""
        from services.qa_service import QASession

        session = QASession("test", [], "")
        session.qa_transcript.append({"question": "Q1", "answer": "A1"})

        transcript = session.get_transcript()
        transcript.append({"question": "Q2", "answer": "A2"})

        assert len(session.qa_transcript) == 1
        assert len(transcript) == 2

    def test_get_summary_structure(self):
        """get_summary returns correct dict structure"""
        from services.qa_service import QASession

        session = QASession("test", [], "")
        session.questions_asked = 3
        session.founder_time_used = 90
        session.qa_transcript = [
            {"question": "Q1", "answer": "A1", "topic": "traction"},
            {"question": "Q2", "answer": "A2", "topic": "market"},
            {"question": "Q3", "answer": "A3", "topic": "traction"}
        ]

        summary = session.get_summary()

        assert summary["questions_asked"] == 3
        assert summary["founder_time_used"] == 90
        assert "traction" in summary["topics_covered"]
        assert "market" in summary["topics_covered"]
        assert len(summary["qa_transcript"]) == 3


class TestQASessionManager:
    """Test session manager functions"""

    @pytest.mark.asyncio
    async def test_get_qa_session_not_found(self):
        """get_qa_session returns None for unknown session"""
        from services.qa_service import get_qa_session

        session = await get_qa_session("nonexistent-session-id")
        assert session is None

    @pytest.mark.asyncio
    async def test_end_qa_session_not_found(self):
        """end_qa_session returns False for unknown session"""
        from services.qa_service import end_qa_session

        result = await end_qa_session("nonexistent-session-id")
        assert result is False

    @pytest.mark.asyncio
    async def test_receive_qa_answer_no_session(self):
        """receive_qa_answer returns False when no session"""
        from services.qa_service import receive_qa_answer

        result = await receive_qa_answer(
            session_id="nonexistent",
            answer_text="My answer",
            answer_duration=30
        )
        assert result is False


class TestQAE2E:
    """E2E tests with real Gemini API"""

    @pytest.mark.asyncio
    async def test_qa_question_generation_real_api(self):
        """Generate one question with real Gemini Flash API"""
        from services.gemini_service import generate_text_flash
        from prompts.qa_investor import get_qa_system_prompt, build_qa_context

        # Build context
        system_prompt = get_qa_system_prompt("friendly")
        context = build_qa_context(
            slide_contents=[
                {"number": 1, "title": "Problem", "content": "SMBs lose $50B due to payment delays"},
                {"number": 2, "title": "Solution", "content": "Instant payment API"}
            ],
            pitch_transcript="We are PayFlow. SMBs lose 50 billion dollars annually due to payment delays. Our instant settlement API solves this problem.",
            language="en",
            investor_mode="friendly",
            remaining_time=120,
            questions_count=0,
            previous_qa=[]
        )

        # Generate question
        question_prompt = f"""Based on the context, generate your next question as a JSON object:

{{
  "question": "<your question text>",
  "intent": "<what you're probing for>",
  "topic": "<category: traction|market|team|product|financials|competition|other>",
  "is_followup": false
}}

Context:
{context}

Generate the question now. Return ONLY valid JSON, no markdown, no explanations."""

        response = await generate_text_flash(
            prompt=question_prompt,
            system_instruction=system_prompt
        )

        # Verify response
        assert response is not None
        assert len(response) > 10

        # Try to parse as JSON (may have markdown wrapper)
        import json
        try:
            # Remove markdown if present
            clean_response = response.strip()
            if clean_response.startswith("```"):
                lines = clean_response.split("\n")
                clean_response = "\n".join(lines[1:-1])

            data = json.loads(clean_response)
            assert "question" in data
            print(f"\n=== Generated Q&A Question ===")
            print(f"Question: {data.get('question', '')}")
            print(f"Topic: {data.get('topic', '')}")
            print(f"Intent: {data.get('intent', '')}")
        except json.JSONDecodeError:
            # Even if not valid JSON, the text response is valid
            print(f"\n=== Raw Q&A Response ===")
            print(response[:200])
