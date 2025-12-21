"""
AI Connection Tests - Gemini API bağlantısı ve model erişimi
Using new google.genai SDK
"""

import pytest
import os

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from services.gemini_service import (
    init_gemini,
    get_client,
    MODELS
)


class TestGeminiConnection:
    """Test Gemini API connection and model access"""

    def test_api_key_exists(self):
        """API key environment variable mevcut mu?"""
        api_key = os.getenv("GEMINI_API_KEY")
        assert api_key is not None, "GEMINI_API_KEY not found in environment"
        assert len(api_key) > 0, "GEMINI_API_KEY is empty"
        assert api_key.startswith("AIza"), "GEMINI_API_KEY format looks invalid"

    def test_init_gemini_success(self):
        """Gemini client başarıyla başlatılabiliyor mu?"""
        try:
            init_gemini()
        except ValueError as e:
            pytest.fail(f"init_gemini() failed: {e}")

    def test_client_accessible(self):
        """Client erişilebilir mi?"""
        init_gemini()
        client = get_client()
        assert client is not None

    def test_models_dict_has_required_keys(self):
        """MODELS dict gerekli key'lere sahip mi?"""
        required_keys = ["pro", "flash", "vision", "embedding", "live", "tts"]
        for key in required_keys:
            assert key in MODELS, f"MODELS missing key: {key}"

    def test_embedding_model_name(self):
        """Embedding model adı doğru mu?"""
        assert MODELS["embedding"] == "text-embedding-004"

    def test_live_model_name(self):
        """Live model adı doğru mu?"""
        assert MODELS["live"] == "gemini-2.5-flash-native-audio-latest"

    def test_tts_model_name(self):
        """TTS model adı doğru mu?"""
        assert MODELS["tts"] == "gemini-2.5-flash-preview-tts"
