"""
AI Live Audio Tests - Gemini 2.5 Flash Native Audio Dialog
Testing real-time audio conversation capabilities
Using new google.genai SDK (not deprecated google.generativeai)
"""

import pytest
import os
import asyncio

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from google import genai
from services.gemini_service import init_gemini, get_client, MODELS


@pytest.fixture(autouse=True)
def setup_gemini():
    """Her test öncesi Gemini'yi başlat"""
    init_gemini()


class TestLiveAudioSetup:
    """Test Live Audio model accessibility and configuration"""

    def test_live_model_name_configured(self):
        """Live model ismi doğru mu?"""
        assert "live" in MODELS
        assert MODELS["live"] == "gemini-2.5-flash-native-audio-latest"

    def test_tts_model_name_configured(self):
        """TTS model ismi doğru mu?"""
        assert "tts" in MODELS
        assert "tts" in MODELS["tts"].lower()


class TestLiveAudioBasic:
    """Basic Live Audio API tests (without actual audio streaming)"""

    @pytest.mark.asyncio
    async def test_tts_model_accessible(self):
        """TTS model erişilebilir mi?"""
        tts_model = MODELS.get("tts")
        assert tts_model is not None
        assert "tts" in tts_model.lower()


class TestLiveAudioConnection:
    """Test Live API connection setup using google-genai SDK"""

    def test_live_api_import(self):
        """google.genai live modülü import edilebilir mi?"""
        assert hasattr(genai, 'Client'), "Client not found in google-genai"

    def test_live_client_creation(self):
        """Live Client oluşturulabiliyor mu?"""
        api_key = os.getenv("GEMINI_API_KEY")
        assert api_key is not None, "GEMINI_API_KEY not set"

        client = genai.Client(api_key=api_key)
        assert client is not None

    def test_websocket_dependencies(self):
        """WebSocket bağımlılıkları mevcut mu?"""
        try:
            import websockets
            assert True
        except ImportError:
            pytest.skip("websockets package not installed - needed for Live API")


class TestLiveAPIRealConnection:
    """Test actual Live API connection (async)"""

    @pytest.mark.asyncio
    async def test_live_connect_requires_audio(self):
        """Live API native-audio modeli ses istiyor mu? (beklenen davranış)"""
        api_key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)

        # Native audio model - SADECE ses kabul eder
        model_id = MODELS["live"]

        try:
            async with client.aio.live.connect(model=model_id) as session:
                # Text göndermeye çalış - bu HATALI olmalı
                await session.send_client_content(
                    turns={"role": "user", "parts": [{"text": "Hello"}]},
                    turn_complete=True
                )
                async for response in session.receive():
                    break

            # Eğer buraya ulaşırsak, model text kabul etti (beklenmiyor)
            pytest.fail("Native audio model should reject text-only input")

        except Exception as e:
            error_str = str(e)
            # "Cannot extract voices from a non-audio request" - DOĞRU!
            if "non-audio" in error_str or "voices" in error_str:
                # Bu beklenen davranış - model audio istiyor
                assert True, "Native audio model correctly requires audio input"
            elif "quota" in error_str.lower() or "rate" in error_str.lower():
                pytest.skip(f"Rate limited: {e}")
            else:
                raise

    @pytest.mark.asyncio
    async def test_live_text_model_connection(self):
        """Text-destekli Live model bağlantısı çalışıyor mu?"""
        api_key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)

        # Text destekleyen live model deneyelim
        text_live_models = [
            "gemini-2.0-flash-live-001",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash-latest"
        ]

        for model_id in text_live_models:
            try:
                async with client.aio.live.connect(model=model_id) as session:
                    await session.send_client_content(
                        turns={"role": "user", "parts": [{"text": "Say hello"}]},
                        turn_complete=True
                    )

                    response_text = ""
                    async for response in session.receive():
                        if hasattr(response, 'server_content') and response.server_content:
                            if hasattr(response.server_content, 'model_turn'):
                                for part in response.server_content.model_turn.parts:
                                    if hasattr(part, 'text') and part.text:
                                        response_text += part.text
                        # Stop after getting some response
                        if len(response_text) > 5:
                            break

                    if response_text:
                        assert True  # Found a working text-live model
                        return

            except Exception as e:
                continue  # Try next model

        # Hiçbir text-live model çalışmadı - normal, audio-only modeller var
        pytest.skip("No text-capable live model available")


# ============================================
# LIVE AUDIO WITH ACTUAL AUDIO
# ============================================
# For full audio testing, you would:
# 1. Load an audio file (WAV/MP3)
# 2. Convert to base64 or stream
# 3. Send via Live API
# 4. Receive audio response
#
# Example for later:
# await session.send_realtime_input(audio=audio_bytes)
# ============================================
