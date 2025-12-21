"""
Health endpoint tests
"""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test /health endpoint returns healthy status"""
    response = await client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "pitchdrill-api"
    assert data["version"] == "0.1.0"


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test / endpoint returns API info"""
    response = await client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["message"] == "PitchDrill API"
    assert data["docs"] == "/docs"
