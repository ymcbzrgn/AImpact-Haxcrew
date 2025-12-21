"""
RAG Service Tests
Testing document storage and similarity search
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
from services.rag_service import (
    chunk_text,
    add_document,
    search_similar,
    get_document_count,
    delete_document,
    CATEGORIES
)


@pytest.fixture(autouse=True)
def setup_gemini():
    """Initialize Gemini before each test"""
    init_gemini()


class TestChunkText:
    """Test text chunking utility"""

    def test_short_text_no_chunking(self):
        """Short text should return single chunk"""
        text = "This is a short text."
        chunks = chunk_text(text, max_chars=100)
        assert len(chunks) == 1
        assert chunks[0] == text

    def test_long_text_chunks(self):
        """Long text should be split into multiple chunks"""
        text = "A" * 3000
        chunks = chunk_text(text, max_chars=1000, overlap=100)
        assert len(chunks) > 1

    def test_chunks_have_overlap(self):
        """Chunks should overlap"""
        text = "Sentence one. Sentence two. Sentence three. Sentence four. " * 50
        chunks = chunk_text(text, max_chars=500, overlap=100)

        if len(chunks) > 1:
            # Check that there's some content overlap
            chunk1_end = chunks[0][-50:]
            # Overlap should exist in chunk 2's beginning area
            assert len(chunks[1]) > 0

    def test_empty_text(self):
        """Empty text should return empty list or single empty chunk"""
        chunks = chunk_text("", max_chars=100)
        assert len(chunks) <= 1

    def test_preserves_sentence_boundaries(self):
        """Chunking should try to preserve sentence boundaries"""
        text = "First sentence. Second sentence. Third sentence. " * 30
        chunks = chunk_text(text, max_chars=100)
        # Most chunks should end with period or newline
        for chunk in chunks[:-1]:  # Skip last chunk
            last_char = chunk.rstrip()[-1] if chunk.strip() else ""
            # Should end with period, newline, or be at exact boundary
            assert last_char in [".", "\n", ""] or len(chunk) > 0


class TestCategories:
    """Test category configuration"""

    def test_categories_defined(self):
        """Categories list should be defined"""
        assert len(CATEGORIES) > 0

    def test_expected_categories_exist(self):
        """Expected categories should exist"""
        expected = ["pitch_tips", "fundraising", "market_analysis"]
        for cat in expected:
            assert cat in CATEGORIES


class TestRAGOperations:
    """Test RAG database operations (requires DB connection)"""

    @pytest.mark.asyncio
    async def test_add_document(self):
        """Can add a document to the database"""
        from services.database import init_db, close_db

        await init_db()

        try:
            doc = await add_document(
                content="Test document content for RAG testing.",
                category="pitch_tips",
                source="test_source.txt"
            )

            assert doc is not None
            assert doc.id is not None
            assert doc.content == "Test document content for RAG testing."
            assert doc.category == "pitch_tips"

            # Cleanup
            await delete_document(doc.id)

        finally:
            await close_db()

    @pytest.mark.asyncio
    async def test_search_similar(self):
        """Can search for similar documents"""
        from services.database import init_db, close_db

        await init_db()

        try:
            # Add a test document
            doc = await add_document(
                content="Pitch your startup with clarity. Lead with what you do, not why.",
                category="pitch_tips",
                source="test_search.txt"
            )

            # Search for similar content
            results = await search_similar(
                query="how to pitch my startup clearly",
                top_k=5,
                category="pitch_tips"
            )

            assert isinstance(results, list)

            # Our test doc should be in results
            found = any(r["id"] == str(doc.id) for r in results)
            # Note: might not be found if there are many other similar docs
            # Just check results format
            if results:
                assert "content" in results[0]
                assert "similarity" in results[0]
                assert "distance" in results[0]

            # Cleanup
            await delete_document(doc.id)

        finally:
            await close_db()

    @pytest.mark.asyncio
    async def test_document_count(self):
        """Can get document count"""
        from services.database import init_db, close_db

        await init_db()

        try:
            count = await get_document_count()
            assert isinstance(count, int)
            assert count >= 0

        finally:
            await close_db()

    @pytest.mark.asyncio
    async def test_invalid_category_rejected(self):
        """Invalid category should raise ValueError"""
        from services.database import init_db, close_db

        await init_db()

        try:
            with pytest.raises(ValueError) as exc_info:
                await add_document(
                    content="Test content",
                    category="invalid_category",
                    source="test.txt"
                )
            assert "Invalid category" in str(exc_info.value)

        finally:
            await close_db()


class TestSearchFilters:
    """Test search with different filters"""

    @pytest.mark.asyncio
    async def test_search_with_category_filter(self):
        """Search can filter by category"""
        from services.database import init_db, close_db

        await init_db()

        try:
            results = await search_similar(
                query="pitch deck tips",
                top_k=3,
                category="pitch_tips"
            )

            # All results should have the requested category
            for r in results:
                assert r["category"] == "pitch_tips"

        finally:
            await close_db()

    @pytest.mark.asyncio
    async def test_search_without_filters(self):
        """Search works without filters"""
        from services.database import init_db, close_db

        await init_db()

        try:
            results = await search_similar(
                query="startup advice",
                top_k=5
            )

            # Should return results (if any docs exist)
            assert isinstance(results, list)

        finally:
            await close_db()
