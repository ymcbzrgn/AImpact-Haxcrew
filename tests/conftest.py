"""
Pytest configuration and fixtures for E2E tests
"""

import sys
import os

# Add apps/api to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

# Set test mode to disable background tasks
os.environ["TESTING"] = "true"

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Initialize Gemini before importing app
from services.gemini_service import init_gemini
try:
    init_gemini()
except Exception:
    pass

from main import app
from services.database import get_engine, close_db


@pytest_asyncio.fixture
async def client():
    """Async HTTP client for testing FastAPI endpoints"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture(scope="session", autouse=True)
def cleanup_database():
    """Cleanup database connections after all tests"""
    yield
    # Cleanup is handled by the event loop, but we ensure engine is disposed
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if not loop.is_closed():
            loop.run_until_complete(close_db())
    except Exception:
        pass
