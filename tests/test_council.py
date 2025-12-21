"""
Council Service Tests
Testing 5-character VC panel debate and voting
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


class TestCouncilCharacters:
    """Test council character prompts"""

    def test_import_council_characters(self):
        """Can import council characters module"""
        from prompts.council_characters import (
            CHARACTERS,
            get_character_prompt,
            get_character_display_name,
            get_character_firm,
            get_debate_context,
            VOTE_PROMPT,
        )
        assert CHARACTERS is not None
        assert get_character_prompt is not None
        assert VOTE_PROMPT is not None

    def test_all_characters_defined(self):
        """All 5 characters are defined"""
        from prompts.council_characters import CHARACTERS

        expected = ["orchestrator", "sarah_chen", "marcus_thompson", "elif_yilmaz", "david_park"]
        assert CHARACTERS == expected

    def test_all_characters_have_prompts(self):
        """Each character has a system prompt"""
        from prompts.council_characters import CHARACTERS, get_character_prompt

        for character in CHARACTERS:
            prompt = get_character_prompt(character)
            assert prompt is not None, f"Missing prompt for {character}"
            assert len(prompt) > 100, f"Prompt too short for {character}"

    def test_character_display_names(self):
        """Character display names are correct"""
        from prompts.council_characters import get_character_display_name

        assert get_character_display_name("orchestrator") == "Moderator"
        assert get_character_display_name("sarah_chen") == "Sarah Chen"
        assert get_character_display_name("elif_yilmaz") == "Elif Yilmaz"

    def test_character_firms(self):
        """Character firms are correct"""
        from prompts.council_characters import get_character_firm

        assert get_character_firm("sarah_chen") == "Y Combinator"
        assert get_character_firm("marcus_thompson") == "a16z"
        assert get_character_firm("david_park") == "Tiger Global"

    def test_character_weights(self):
        """Character scoring weights are defined"""
        from prompts.council_characters import CHARACTER_WEIGHTS

        assert "sarah_chen" in CHARACTER_WEIGHTS
        assert "pmf_signals" in CHARACTER_WEIGHTS["sarah_chen"]
        assert sum(CHARACTER_WEIGHTS["sarah_chen"].values()) == pytest.approx(1.0)

    def test_debate_context_builder(self):
        """Can build debate context"""
        from prompts.council_characters import get_debate_context

        context = get_debate_context(
            deck_analysis={"startup_name": "TestCo"},
            pitch_transcript="This is a test pitch",
            qa_transcript=[{"question": "Q1", "answer": "A1"}],
            realtime_notes=[{"note": "Good energy"}],
            language="tr",
            investor_mode="shark",
            overall_score=75
        )

        assert "TestCo" in context
        assert "test pitch" in context
        assert "tr" in context


class TestCouncilService:
    """Test council service functionality"""

    def test_import_council_service(self):
        """Can import council service"""
        from services.council_service import (
            CouncilSession,
            CouncilPhase,
            Decision,
            start_council_session,
            close_council_session,
            get_active_council_count,
        )
        assert CouncilSession is not None
        assert CouncilPhase is not None
        assert Decision is not None

    def test_council_phases(self):
        """Council phases are defined correctly"""
        from services.council_service import CouncilPhase

        phases = [p.value for p in CouncilPhase]
        assert "opening" in phases
        assert "debate" in phases
        assert "closing" in phases
        assert "voting" in phases
        assert "completed" in phases

    def test_decision_types(self):
        """Decision types are defined correctly"""
        from services.council_service import Decision

        decisions = [d.value for d in Decision]
        assert "INVESTOR_READY_POOL" in decisions
        assert "INVEST" in decisions
        assert "CONDITIONAL" in decisions
        assert "PASS" in decisions

    def test_council_session_init(self):
        """CouncilSession initializes correctly"""
        from services.council_service import CouncilSession, CouncilPhase

        session = CouncilSession(
            session_id="test-session",
            deck_analysis={"startup_name": "TestCo"},
            language="tr"
        )

        assert session.session_id == "test-session"
        assert session.phase == CouncilPhase.OPENING
        assert session.messages == []
        assert session.votes == {}
        assert session.language == "tr"

    def test_session_min_max_exchanges(self):
        """Session has min/max exchange limits"""
        from services.council_service import CouncilSession

        assert CouncilSession.MIN_EXCHANGES == 8
        assert CouncilSession.MAX_EXCHANGES == 15

    def test_session_panelists(self):
        """Session has correct panelists"""
        from services.council_service import CouncilSession

        panelists = CouncilSession.PANELISTS
        assert "sarah_chen" in panelists
        assert "marcus_thompson" in panelists
        assert "elif_yilmaz" in panelists
        assert "david_park" in panelists
        assert "orchestrator" not in panelists  # Orchestrator is moderator, not panelist

    def test_decision_thresholds(self):
        """Decision thresholds work correctly"""
        from services.council_service import CouncilSession, CouncilPhase, Decision, Vote

        session = CouncilSession("test")

        # Test INVESTOR_READY_POOL threshold (95+)
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 96, "Great"),
            "marcus_thompson": Vote("marcus_thompson", 95, "Good"),
            "elif_yilmaz": Vote("elif_yilmaz", 97, "Excellent"),
            "david_park": Vote("david_park", 95, "Strong"),
            "orchestrator": Vote("orchestrator", 96, "Approved")
        }
        result = session._calculate_result()
        assert result.decision == Decision.INVESTOR_READY_POOL
        assert result.investor_ready_pool is True

        # Test INVEST threshold (70-94)
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 80, "Good"),
            "marcus_thompson": Vote("marcus_thompson", 75, "Fair"),
            "elif_yilmaz": Vote("elif_yilmaz", 85, "Strong"),
            "david_park": Vote("david_park", 70, "OK"),
            "orchestrator": Vote("orchestrator", 78, "Decent")
        }
        result = session._calculate_result()
        assert result.decision == Decision.INVEST
        assert result.investor_ready_pool is False

        # Test CONDITIONAL threshold (50-69)
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 60, "Meh"),
            "marcus_thompson": Vote("marcus_thompson", 55, "Weak"),
            "elif_yilmaz": Vote("elif_yilmaz", 65, "OK"),
            "david_park": Vote("david_park", 50, "Low"),
            "orchestrator": Vote("orchestrator", 58, "Concerns")
        }
        result = session._calculate_result()
        assert result.decision == Decision.CONDITIONAL

        # Test PASS threshold (<50)
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 40, "No"),
            "marcus_thompson": Vote("marcus_thompson", 35, "Pass"),
            "elif_yilmaz": Vote("elif_yilmaz", 45, "Weak"),
            "david_park": Vote("david_park", 30, "Fail"),
            "orchestrator": Vote("orchestrator", 38, "No go")
        }
        result = session._calculate_result()
        assert result.decision == Decision.PASS

    def test_get_dialog_returns_copy(self):
        """get_dialog returns a copy of messages"""
        from services.council_service import CouncilSession

        session = CouncilSession("test")
        session.messages.append({"speaker": "test", "message": "Hello"})

        dialog = session.get_dialog()
        dialog.append({"speaker": "new", "message": "World"})

        assert len(session.messages) == 1
        assert len(dialog) == 2

    def test_active_count_starts_zero(self):
        """Active session count starts at zero"""
        from services.council_service import get_active_council_count

        count = get_active_council_count()
        assert isinstance(count, int)
        assert count >= 0


class TestCouncilIntegration:
    """Integration tests (require Gemini API)"""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires real Gemini API - run manually")
    async def test_generate_character_response(self):
        """Can generate response from a character"""
        from services.council_service import CouncilSession

        session = CouncilSession(
            session_id="test-integration",
            deck_analysis={"startup_name": "TestStartup", "language": "en"},
            pitch_transcript="We are building a fintech solution",
            language="en"
        )

        response = await session._generate_response(
            "sarah_chen",
            "Give a brief initial reaction"
        )

        assert "speaker" in response
        assert response["speaker"] == "sarah_chen"
        assert "message" in response

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires real Gemini API - run manually")
    async def test_full_council_flow(self):
        """Can run full council debate (expensive test)"""
        from services.council_service import (
            start_council_session,
            close_council_session,
            Decision
        )

        messages_received = []

        async def on_message(msg):
            messages_received.append(msg)

        session = await start_council_session(
            session_id="test-full-flow",
            deck_analysis={
                "startup_name": "TestCo",
                "overall_score": 70,
                "language": "en"
            },
            pitch_transcript="We are solving payments for SMBs",
            qa_transcript=[],
            realtime_notes=[],
            investor_mode="friendly",
            language="en",
            on_message=on_message
        )

        result = await session.run()

        # Verify we got messages
        assert len(messages_received) > 0

        # Verify result structure
        assert result.average_score >= 0
        assert result.average_score <= 100
        assert result.decision in Decision
        assert len(result.votes) == 5

        # Cleanup
        await close_council_session("test-full-flow")


class TestCouncilLogic:
    """Council logic tests without API calls"""

    def test_next_speaker_avoids_same_speaker(self):
        """Next speaker should not be the last speaker"""
        from services.council_service import CouncilSession

        session = CouncilSession("test")

        # Test each panelist
        for panelist in session.PANELISTS:
            session.last_speaker = panelist
            next_speaker = session._get_next_speaker()
            assert next_speaker != panelist, f"Same speaker returned: {panelist}"

    def test_next_speaker_sarah_triggers_marcus_or_david(self):
        """After Sarah, next should be Marcus or David"""
        from services.council_service import CouncilSession

        session = CouncilSession("test")
        session.last_speaker = "sarah_chen"

        # Run multiple times to check pattern
        results = set()
        for i in range(10):
            session.exchange_count = i
            results.add(session._get_next_speaker())

        # Should get Marcus or David
        assert "marcus_thompson" in results or "david_park" in results

    def test_calculate_result_exact_95_threshold(self):
        """Exactly 95 average = INVESTOR_READY_POOL"""
        from services.council_service import CouncilSession, Decision, Vote

        session = CouncilSession("test")
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 95, ""),
            "marcus_thompson": Vote("marcus_thompson", 95, ""),
            "elif_yilmaz": Vote("elif_yilmaz", 95, ""),
            "david_park": Vote("david_park", 95, ""),
            "orchestrator": Vote("orchestrator", 95, "")
        }
        result = session._calculate_result()
        assert result.average_score == 95.0
        assert result.decision == Decision.INVESTOR_READY_POOL

    def test_calculate_result_exact_70_threshold(self):
        """Exactly 70 average = INVEST"""
        from services.council_service import CouncilSession, Decision, Vote

        session = CouncilSession("test")
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 70, ""),
            "marcus_thompson": Vote("marcus_thompson", 70, ""),
            "elif_yilmaz": Vote("elif_yilmaz", 70, ""),
            "david_park": Vote("david_park", 70, ""),
            "orchestrator": Vote("orchestrator", 70, "")
        }
        result = session._calculate_result()
        assert result.average_score == 70.0
        assert result.decision == Decision.INVEST

    def test_calculate_result_exact_50_threshold(self):
        """Exactly 50 average = CONDITIONAL"""
        from services.council_service import CouncilSession, Decision, Vote

        session = CouncilSession("test")
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 50, ""),
            "marcus_thompson": Vote("marcus_thompson", 50, ""),
            "elif_yilmaz": Vote("elif_yilmaz", 50, ""),
            "david_park": Vote("david_park", 50, ""),
            "orchestrator": Vote("orchestrator", 50, "")
        }
        result = session._calculate_result()
        assert result.average_score == 50.0
        assert result.decision == Decision.CONDITIONAL

    def test_calculate_result_just_below_50(self):
        """Just below 50 average = PASS"""
        from services.council_service import CouncilSession, Decision, Vote

        session = CouncilSession("test")
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 49, ""),
            "marcus_thompson": Vote("marcus_thompson", 49, ""),
            "elif_yilmaz": Vote("elif_yilmaz", 49, ""),
            "david_park": Vote("david_park", 49, ""),
            "orchestrator": Vote("orchestrator", 49, "")
        }
        result = session._calculate_result()
        assert result.average_score == 49.0
        assert result.decision == Decision.PASS

    def test_get_verdict_contains_required_fields(self):
        """Verdict has decision, average_score, votes, etc."""
        from services.council_service import CouncilSession, Vote

        session = CouncilSession("test")
        session.votes = {
            "sarah_chen": Vote("sarah_chen", 75, "Good PMF"),
            "marcus_thompson": Vote("marcus_thompson", 70, "Market OK"),
            "elif_yilmaz": Vote("elif_yilmaz", 80, "Strong founder"),
            "david_park": Vote("david_park", 72, "Unit econ OK"),
            "orchestrator": Vote("orchestrator", 73, "Approved")
        }

        verdict = session.get_verdict()

        # Check required fields
        assert "decision" in verdict
        assert "average_score" in verdict
        assert "votes" in verdict
        assert "investor_ready_pool" in verdict
        assert "key_strengths" in verdict
        assert "key_concerns" in verdict

        # Check vote structure
        assert "sarah_chen" in verdict["votes"]
        assert "score" in verdict["votes"]["sarah_chen"]
        assert "rationale" in verdict["votes"]["sarah_chen"]

    def test_empty_votes_returns_pass(self):
        """Empty votes returns PASS with 0 score"""
        from services.council_service import CouncilSession, Decision

        session = CouncilSession("test")
        session.votes = {}

        result = session._calculate_result()
        assert result.average_score == 0
        assert result.decision == Decision.PASS


class TestCouncilE2E:
    """Real API E2E tests"""

    @pytest.mark.asyncio
    async def test_council_opening_phase_real_api(self):
        """Test opening phase with real Gemini API"""
        from services.council_service import CouncilSession, CouncilPhase

        messages_received = []

        async def on_message(msg):
            messages_received.append(msg)
            print(f"[{msg.get('speaker', 'unknown')}]: {msg.get('message', '')[:100]}...")

        session = CouncilSession(
            session_id="test-opening-e2e",
            deck_analysis={
                "startup_name": "PayFlow",
                "overall_score": 72,
                "problem": "SMB payment delays",
                "solution": "Instant payment processing",
                "language": "en"
            },
            pitch_transcript="We are PayFlow. SMBs lose $50B annually due to payment delays. Our instant settlement API solves this.",
            qa_transcript=[],
            realtime_notes=[{"note": "Good energy", "type": "positive"}],
            investor_mode="shark",
            language="en",
            on_message=on_message
        )

        # Run only opening phase
        await session._run_opening()

        # Verify
        assert session.phase == CouncilPhase.OPENING
        assert len(messages_received) >= 2  # Orchestrator + first panelist
        assert session.exchange_count >= 2

        # Check message structure
        for msg in messages_received:
            assert "speaker" in msg
            assert "message" in msg
            assert len(msg["message"]) > 10  # Not empty

        print(f"\n=== Opening Phase Complete ===")
        print(f"Messages received: {len(messages_received)}")
        print(f"Exchange count: {session.exchange_count}")
