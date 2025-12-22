"""
Merge Fix Tests - Haysa + Sinem Integration
Tests for verifying the merge fixes work correctly

Fixes tested:
1. session.py - import json added
2. websocket.py - duplicate loop removed
3. websocket.py - response_task null check added
"""

import pytest
import os
import sys

# Add api path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))


class TestSessionTranscript:
    """Test transcript endpoint after json import fix"""

    @pytest.mark.asyncio
    async def test_get_transcript_empty_session(self, client):
        """New session returns empty transcripts without crashing"""
        # Create session
        create_resp = await client.post("/api/session", json={})
        assert create_resp.status_code == 200
        session_id = create_resp.json()["data"]["session_id"]

        # Get transcript
        response = await client.get(f"/api/session/{session_id}/transcript")
        assert response.status_code == 200

        data = response.json()
        assert data["success"] is True
        assert "pitch_transcript" in data["data"]
        assert "qa_transcript" in data["data"]
        assert "realtime_notes" in data["data"]

    @pytest.mark.asyncio
    async def test_get_transcript_returns_arrays(self, client):
        """Transcript endpoint returns array types"""
        # Create session
        create_resp = await client.post("/api/session", json={})
        assert create_resp.status_code == 200
        session_id = create_resp.json()["data"]["session_id"]

        # Get transcript
        response = await client.get(f"/api/session/{session_id}/transcript")
        assert response.status_code == 200
        data = response.json()

        # Verify success and array types
        if data["success"]:
            # All transcript fields should be lists
            assert isinstance(data["data"]["pitch_transcript"], list)
            assert isinstance(data["data"]["qa_transcript"], (list, type(None)))
            assert isinstance(data["data"]["realtime_notes"], (list, type(None)))

    @pytest.mark.asyncio
    async def test_get_transcript_not_found(self, client):
        """Invalid session returns SESSION_NOT_FOUND error"""
        response = await client.get("/api/session/invalid-uuid-here/transcript")
        assert response.status_code == 200  # API returns 200 with error in body

        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "SESSION_NOT_FOUND"


class TestWebSocketImports:
    """Test websocket imports work after merge"""

    def test_websocket_module_imports(self):
        """Can import websocket router without errors"""
        from routers.websocket import router, manager
        assert router is not None
        assert manager is not None

    def test_qa_service_imports_in_websocket(self):
        """Q&A service imports exist in websocket module"""
        from routers import websocket
        # These should not raise ImportError after merge
        assert hasattr(websocket, 'start_qa_session') or 'start_qa_session' in dir(websocket)

    def test_term_sheet_service_imports_in_websocket(self):
        """Term sheet service imports exist in websocket module"""
        from routers import websocket
        # Module should have access to term sheet functions
        assert hasattr(websocket, 'generate_term_sheet') or 'generate_term_sheet' in dir(websocket)


class TestConnectionManager:
    """Test ConnectionManager has all required methods after merge"""

    def test_connection_manager_has_session_states(self):
        """Haysa's session_states dict exists"""
        from routers.websocket import manager
        assert hasattr(manager, 'session_states')
        assert isinstance(manager.session_states, dict)

    def test_connection_manager_has_reconnect_method(self):
        """Haysa's reconnect method exists"""
        from routers.websocket import manager
        assert hasattr(manager, 'reconnect')
        assert callable(manager.reconnect)

    def test_connection_manager_has_update_session_state(self):
        """Haysa's update_session_state method exists"""
        from routers.websocket import manager
        assert hasattr(manager, 'update_session_state')
        assert callable(manager.update_session_state)

    def test_connection_manager_has_get_session_state(self):
        """Haysa's get_session_state method exists"""
        from routers.websocket import manager
        assert hasattr(manager, 'get_session_state')
        assert callable(manager.get_session_state)

    def test_connection_manager_session_state_operations(self):
        """Session state can be updated and retrieved"""
        from routers.websocket import manager

        test_session_id = "test-session-12345"
        test_state = {"phase": "pitch", "elapsed_seconds": 30}

        # Update state
        manager.update_session_state(test_session_id, test_state)

        # Retrieve state
        retrieved = manager.get_session_state(test_session_id)
        assert retrieved["phase"] == "pitch"
        assert retrieved["elapsed_seconds"] == 30

        # Cleanup
        if test_session_id in manager.session_states:
            del manager.session_states[test_session_id]


class TestWebSocketEventHandlers:
    """Test that event handlers are reachable (not blocked by duplicate loop)"""

    def test_websocket_endpoint_exists(self):
        """WebSocket endpoint function exists"""
        from routers.websocket import websocket_endpoint
        assert websocket_endpoint is not None
        assert callable(websocket_endpoint)

    def test_no_duplicate_while_loop(self):
        """Verify duplicate loop was removed by checking source"""
        import inspect
        from routers.websocket import websocket_endpoint

        source = inspect.getsource(websocket_endpoint)

        # Count "while True:" occurrences
        while_count = source.count("while True:")

        # Should only have ONE main event loop
        assert while_count == 1, f"Expected 1 while loop, found {while_count}"

    def test_reconnect_handler_in_main_loop(self):
        """reconnect event handler is in the main loop (not separate)"""
        import inspect
        from routers.websocket import websocket_endpoint

        source = inspect.getsource(websocket_endpoint)

        # Find the while loop
        while_index = source.find("while True:")
        assert while_index != -1

        # Find reconnect handler after while loop
        reconnect_index = source.find('event == "reconnect"')
        assert reconnect_index != -1
        assert reconnect_index > while_index, "reconnect handler should be inside while loop"

        # Find audio_chunk handler
        audio_index = source.find('event == "audio_chunk"')
        assert audio_index != -1

        # Both should be in same loop (reconnect before audio_chunk)
        assert reconnect_index < audio_index, "reconnect should come before audio_chunk"
