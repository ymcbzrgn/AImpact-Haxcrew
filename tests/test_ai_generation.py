"""
AI Text Generation Tests - Gemini text generation fonksiyonları
"""

import pytest
import os

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from services.gemini_service import init_gemini, generate_text


@pytest.fixture(autouse=True)
def setup_gemini():
    """Her test öncesi Gemini'yi başlat"""
    init_gemini()


class TestTextGeneration:
    """Test Gemini text generation capabilities"""

    @pytest.mark.asyncio
    async def test_simple_prompt(self):
        """Basit bir prompt ile text generation"""
        response = await generate_text("Say 'Hello World' and nothing else.")
        assert response is not None
        assert len(response) > 0
        assert "hello" in response.lower() or "world" in response.lower()

    @pytest.mark.asyncio
    async def test_with_system_instruction(self):
        """System instruction ile generation"""
        system = "You are a helpful assistant. Always respond in exactly 3 words."
        response = await generate_text(
            "What is 2+2?",
            system_instruction=system
        )
        assert response is not None
        # Should be a short response due to system instruction
        assert len(response.split()) <= 10

    @pytest.mark.asyncio
    async def test_turkish_prompt(self):
        """Türkçe prompt desteği"""
        response = await generate_text(
            "Merhaba! Sadece 'Selam' kelimesini yaz, başka bir şey yazma."
        )
        assert response is not None
        # Should contain Turkish greeting
        assert any(word in response.lower() for word in ["selam", "merhaba"])

    @pytest.mark.asyncio
    async def test_json_output_request(self):
        """JSON formatında çıktı isteme"""
        system = "You are a JSON generator. Only output valid JSON, no markdown."
        response = await generate_text(
            'Return a JSON object with keys "name" and "score". Name should be "test", score should be 85.',
            system_instruction=system
        )
        assert response is not None
        # Should contain JSON-like structure
        assert "{" in response
        assert "}" in response
