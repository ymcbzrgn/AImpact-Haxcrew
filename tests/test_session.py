"""
Session endpoint tests
"""

import pytest


@pytest.mark.asyncio
async def test_create_session_default_mode(client):
    """Test creating a session with default investor mode"""
    response = await client.post("/api/session", json={})
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert "session_id" in data["data"]
    assert data["data"]["status"] == "created"
    assert data["data"]["investor_mode"] == "friendly"


@pytest.mark.asyncio
async def test_create_session_shark_mode(client):
    """Test creating a session with shark investor mode"""
    response = await client.post("/api/session", json={"investor_mode": "shark"})
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["data"]["investor_mode"] == "shark"


@pytest.mark.asyncio
async def test_get_session(client):
    """Test getting a session by ID"""
    # Create session first
    create_resp = await client.post("/api/session", json={})
    session_id = create_resp.json()["data"]["session_id"]

    # Get session
    response = await client.get(f"/api/session/{session_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["data"]["session_id"] == session_id


@pytest.mark.asyncio
async def test_get_session_not_found(client):
    """Test getting a non-existent session"""
    response = await client.get("/api/session/nonexistent-session-id")
    assert response.status_code == 200  # API returns 200 with error in body

    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "SESSION_NOT_FOUND"


@pytest.mark.asyncio
async def test_start_pitch_without_upload(client):
    """Test starting pitch without uploading deck first"""
    # Create session
    create_resp = await client.post("/api/session", json={})
    session_id = create_resp.json()["data"]["session_id"]

    # Try to start pitch
    response = await client.post(f"/api/session/{session_id}/start")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_STATE"


@pytest.mark.asyncio
async def test_get_verdict_empty(client):
    """Test getting verdict for new session"""
    # Create session
    create_resp = await client.post("/api/session", json={})
    session_id = create_resp.json()["data"]["session_id"]

    # Get verdict
    response = await client.get(f"/api/session/{session_id}/verdict")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["data"]["verdict"] is None
