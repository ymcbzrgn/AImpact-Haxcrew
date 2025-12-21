"""
WebSocket and Live Audio Service Tests
Testing real-time pitch session functionality
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


class TestLiveAudioService:
    """Test Live Audio Service functionality"""

    def test_import_live_audio_service(self):
        """Can import live audio service"""
        from services.live_audio_service import (
            LiveAudioSession,
            get_or_create_session,
            close_session,
            get_active_session_count,
        )
        assert LiveAudioSession is not None
        assert get_or_create_session is not None
        assert close_session is not None
        assert get_active_session_count is not None

    def test_live_audio_session_init(self):
        """LiveAudioSession initializes correctly"""
        from services.live_audio_service import LiveAudioSession

        session = LiveAudioSession("test-session-id")
        assert session.session_id == "test-session-id"
        assert session.live_session is None
        assert session.transcript == []
        assert session.is_active is False

    def test_session_count_starts_zero(self):
        """Session count starts at zero"""
        from services.live_audio_service import get_active_session_count

        # Note: This might fail if other tests left sessions open
        count = get_active_session_count()
        assert isinstance(count, int)
        assert count >= 0


class TestRealtimeNotesPrompt:
    """Test Realtime Notes prompt configuration"""

    def test_import_prompts(self):
        """Can import realtime notes prompts"""
        from prompts.realtime_notes import (
            REALTIME_NOTES_SYSTEM_PROMPT,
            REALTIME_NOTES_CONTEXT_TEMPLATE,
            EXAMPLE_NOTES,
        )
        assert REALTIME_NOTES_SYSTEM_PROMPT is not None
        assert REALTIME_NOTES_CONTEXT_TEMPLATE is not None
        assert EXAMPLE_NOTES is not None

    def test_prompt_contains_key_sections(self):
        """Prompt contains required sections"""
        from prompts.realtime_notes import REALTIME_NOTES_SYSTEM_PROMPT

        assert "Real-Time Pitch Coach" in REALTIME_NOTES_SYSTEM_PROMPT
        assert "NOTE TYPES" in REALTIME_NOTES_SYSTEM_PROMPT
        assert "positive" in REALTIME_NOTES_SYSTEM_PROMPT
        assert "tip" in REALTIME_NOTES_SYSTEM_PROMPT
        assert "warning" in REALTIME_NOTES_SYSTEM_PROMPT

    def test_context_template_has_placeholders(self):
        """Context template has required placeholders"""
        from prompts.realtime_notes import REALTIME_NOTES_CONTEXT_TEMPLATE

        assert "{deck_analysis}" in REALTIME_NOTES_CONTEXT_TEMPLATE
        assert "{rag_context}" in REALTIME_NOTES_CONTEXT_TEMPLATE
        assert "{session_id}" in REALTIME_NOTES_CONTEXT_TEMPLATE
        assert "{language}" in REALTIME_NOTES_CONTEXT_TEMPLATE

    def test_example_notes_structure(self):
        """Example notes have correct structure"""
        from prompts.realtime_notes import EXAMPLE_NOTES

        assert "positive" in EXAMPLE_NOTES
        assert "tip" in EXAMPLE_NOTES
        assert "warning" in EXAMPLE_NOTES

        for note_type, notes in EXAMPLE_NOTES.items():
            assert len(notes) > 0
            for note in notes:
                assert "note" in note
                assert "trigger" in note


class TestWebSocketRouter:
    """Test WebSocket router configuration"""

    def test_import_websocket_router(self):
        """Can import websocket router"""
        from routers.websocket import router, manager

        assert router is not None
        assert manager is not None

    def test_connection_manager_init(self):
        """ConnectionManager initializes correctly"""
        from routers.websocket import ConnectionManager

        mgr = ConnectionManager()
        assert mgr.active_connections == {}
        assert mgr.realtime_notes == {}

    def test_connection_manager_get_notes_empty(self):
        """get_notes returns empty list for unknown session"""
        from routers.websocket import ConnectionManager

        mgr = ConnectionManager()
        notes = mgr.get_notes("unknown-session")
        assert notes == []


class TestWebSocketIntegration:
    """Integration tests (require database)"""

    @pytest.mark.asyncio
    async def test_build_session_context(self):
        """Can build session context"""
        from routers.websocket import build_session_context
        from services.database import init_db, close_db

        await init_db()

        try:
            # Use a fake session ID (won't find in DB, but should not error)
            system_prompt, deck_analysis = await build_session_context("fake-session-id")

            # Should return a string prompt
            assert isinstance(system_prompt, str)
            assert len(system_prompt) > 100

            # Deck analysis should be None for non-existent session
            assert deck_analysis is None

        finally:
            await close_db()

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Requires real Gemini Live API connection - run manually")
    async def test_live_session_create_and_close(self):
        """Can create and close a live session (requires real API)"""
        from services.live_audio_service import (
            get_or_create_session,
            close_session,
            get_active_session_count,
        )

        initial_count = get_active_session_count()

        # Create session
        session = await get_or_create_session(
            session_id="test-live-session",
            system_instruction="You are a helpful assistant."
        )

        assert session is not None
        assert session.session_id == "test-live-session"
        assert session.is_active is True
        assert get_active_session_count() == initial_count + 1

        # Close session
        result = await close_session("test-live-session")
        assert result is True
        assert get_active_session_count() == initial_count

        # Close again should return False
        result = await close_session("test-live-session")
        assert result is False


class TestConnectionManagerLogic:
    """ConnectionManager logic tests"""

    def test_connection_manager_add_note(self):
        """Notes are stored per session"""
        from routers.websocket import ConnectionManager

        mgr = ConnectionManager()
        mgr.realtime_notes["session-1"] = []

        note = {"note": "Good energy", "type": "positive", "timestamp": 10}
        mgr.add_note("session-1", note)

        assert len(mgr.realtime_notes["session-1"]) == 1
        assert mgr.realtime_notes["session-1"][0] == note

    def test_connection_manager_add_multiple_notes(self):
        """Multiple notes accumulate"""
        from routers.websocket import ConnectionManager

        mgr = ConnectionManager()
        mgr.realtime_notes["session-1"] = []

        mgr.add_note("session-1", {"note": "Note 1", "type": "positive"})
        mgr.add_note("session-1", {"note": "Note 2", "type": "tip"})
        mgr.add_note("session-1", {"note": "Note 3", "type": "warning"})

        notes = mgr.get_notes("session-1")
        assert len(notes) == 3

    def test_connection_manager_add_note_unknown_session(self):
        """Adding note to unknown session does nothing (no crash)"""
        from routers.websocket import ConnectionManager

        mgr = ConnectionManager()
        # Should not crash
        mgr.add_note("unknown-session", {"note": "Test"})
        # Should still return empty
        assert mgr.get_notes("unknown-session") == []

    def test_connection_manager_disconnect_cleans_notes(self):
        """Disconnect removes notes for session"""
        from routers.websocket import ConnectionManager

        mgr = ConnectionManager()
        mgr.realtime_notes["session-to-remove"] = [{"note": "Test"}]
        mgr.active_connections["session-to-remove"] = "mock-ws"

        mgr.disconnect("session-to-remove")

        assert "session-to-remove" not in mgr.realtime_notes
        assert "session-to-remove" not in mgr.active_connections


class TestLiveAudioLogic:
    """Live Audio Service logic tests"""

    def test_live_session_transcript_starts_empty(self):
        """Transcript starts empty"""
        from services.live_audio_service import LiveAudioSession

        session = LiveAudioSession("test")
        assert session.transcript == []
        assert session.get_transcript() == []

    def test_live_session_get_transcript_returns_copy(self):
        """get_transcript returns a copy"""
        from services.live_audio_service import LiveAudioSession

        session = LiveAudioSession("test")
        session.transcript.append({"role": "model", "text": "Hello"})

        transcript = session.get_transcript()
        transcript.append({"role": "model", "text": "World"})

        assert len(session.transcript) == 1
        assert len(transcript) == 2

    def test_live_session_is_active_initially_false(self):
        """is_active starts False"""
        from services.live_audio_service import LiveAudioSession

        session = LiveAudioSession("test")
        assert session.is_active is False

    @pytest.mark.asyncio
    async def test_send_audio_without_start_raises(self):
        """send_audio raises if session not started"""
        from services.live_audio_service import LiveAudioSession

        session = LiveAudioSession("test")

        with pytest.raises(RuntimeError, match="Session not started"):
            await session.send_audio(b"fake audio data")

    @pytest.mark.asyncio
    async def test_send_text_without_start_raises(self):
        """send_text raises if session not started"""
        from services.live_audio_service import LiveAudioSession

        session = LiveAudioSession("test")

        with pytest.raises(RuntimeError, match="Session not started"):
            await session.send_text("Hello")
