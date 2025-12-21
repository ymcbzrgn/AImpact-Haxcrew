"""
AI Embedding Tests - Gemini embedding generation
"""

import pytest
import os

# Load env before imports
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))

from services.gemini_service import init_gemini, generate_embedding


@pytest.fixture(autouse=True)
def setup_gemini():
    """Her test öncesi Gemini'yi başlat"""
    init_gemini()


class TestEmbeddingGeneration:
    """Test Gemini embedding generation"""

    @pytest.mark.asyncio
    async def test_embedding_returns_list(self):
        """Embedding bir liste döndürüyor mu?"""
        embedding = await generate_embedding("Hello world")
        assert embedding is not None
        assert isinstance(embedding, list)

    @pytest.mark.asyncio
    async def test_embedding_dimension_768(self):
        """Embedding boyutu 768 mi? (text-embedding-004)"""
        embedding = await generate_embedding("Test text for embedding")
        assert len(embedding) == 768, f"Expected 768 dimensions, got {len(embedding)}"

    @pytest.mark.asyncio
    async def test_embedding_values_are_floats(self):
        """Embedding değerleri float mı?"""
        embedding = await generate_embedding("Sample text")
        assert all(isinstance(v, float) for v in embedding)

    @pytest.mark.asyncio
    async def test_embedding_normalized(self):
        """Embedding değerleri makul aralıkta mı?"""
        embedding = await generate_embedding("Normalized embedding test")
        # Embeddings are typically normalized between -1 and 1
        assert all(-2 <= v <= 2 for v in embedding), "Embedding values out of expected range"

    @pytest.mark.asyncio
    async def test_different_texts_different_embeddings(self):
        """Farklı textler farklı embedding üretiyor mu?"""
        emb1 = await generate_embedding("Apple is a fruit")
        emb2 = await generate_embedding("Python is a programming language")

        # Calculate simple difference
        diff = sum(abs(a - b) for a, b in zip(emb1, emb2))
        assert diff > 1.0, "Different texts should produce different embeddings"

    @pytest.mark.asyncio
    async def test_turkish_text_embedding(self):
        """Türkçe text embedding çalışıyor mu?"""
        embedding = await generate_embedding("Bu bir Türkçe cümledir.")
        assert len(embedding) == 768
        assert all(isinstance(v, float) for v in embedding)
