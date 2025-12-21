"""
RAG Service - Document storage and similarity search
Using pgvector for vector similarity search
"""

from uuid import UUID
from typing import Optional
from sqlalchemy import select, delete as sql_delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from models.rag_document import RAGDocument
from services.gemini_service import generate_embedding
from services.database import get_session_maker


# Valid categories for RAG documents
CATEGORIES = [
    "pitch_tips",      # Pitch yapma tavsiyeleri
    "fundraising",     # Para toplama stratejileri
    "market_analysis", # Pazar analizi ornekleri
    "competitors",     # Rakip analizi
    "financials",      # Finansal modelleme
    "team_building",   # Takim kurma
]


def chunk_text(text: str, max_chars: int = 1500, overlap: int = 200) -> list[str]:
    """
    Split text into chunks for embedding

    Args:
        text: Text to chunk
        max_chars: Maximum characters per chunk (~500 tokens)
        overlap: Character overlap between chunks

    Returns:
        List of text chunks
    """
    if len(text) <= max_chars:
        return [text.strip()]

    chunks = []
    start = 0

    while start < len(text):
        end = start + max_chars

        # Try to break at sentence boundary
        if end < len(text):
            # Look for sentence end within last 200 chars
            search_start = max(end - 200, start)
            last_period = text.rfind('. ', search_start, end)
            last_newline = text.rfind('\n', search_start, end)

            break_point = max(last_period, last_newline)
            if break_point > start:
                end = break_point + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Move start with overlap
        start = end - overlap if end < len(text) else len(text)

    return chunks


async def add_document(
    content: str,
    category: str,
    source: str,
    character: Optional[str] = None,
    session: Optional[AsyncSession] = None
) -> RAGDocument:
    """
    Add a document to the RAG database

    Args:
        content: Document text content
        category: Document category (from CATEGORIES)
        source: Document source URL or filename
        character: Optional character association
        session: Optional database session

    Returns:
        Created RAGDocument
    """
    if category not in CATEGORIES:
        raise ValueError(f"Invalid category: {category}. Must be one of {CATEGORIES}")

    # Generate embedding
    embedding = await generate_embedding(content)

    # Create document
    doc = RAGDocument(
        content=content,
        embedding=embedding,
        category=category,
        source=source,
        character=character
    )

    # Save to database
    if session:
        session.add(doc)
        await session.commit()
        await session.refresh(doc)
    else:
        session_maker = get_session_maker()
        async with session_maker() as sess:
            sess.add(doc)
            await sess.commit()
            await sess.refresh(doc)

    return doc


async def search_similar(
    query: str,
    top_k: int = 5,
    category: Optional[str] = None,
    character: Optional[str] = None,
    session: Optional[AsyncSession] = None
) -> list[dict]:
    """
    Search for similar documents using vector similarity

    Args:
        query: Search query text
        top_k: Number of results to return
        category: Optional category filter
        character: Optional character filter
        session: Optional database session

    Returns:
        List of dicts with document info and similarity score
    """
    # Generate query embedding
    query_embedding = await generate_embedding(query)

    # Build SQL query with pgvector cosine distance
    # <=> is cosine distance (lower = more similar)
    sql = """
        SELECT
            id, content, category, source, character,
            embedding <=> :query_vec AS distance
        FROM rag_documents
        WHERE 1=1
    """
    params = {"query_vec": str(query_embedding)}

    if category:
        sql += " AND category = :category"
        params["category"] = category

    if character:
        sql += " AND character = :character"
        params["character"] = character

    sql += " ORDER BY distance LIMIT :limit"
    params["limit"] = top_k

    # Execute query
    if session:
        result = await session.execute(text(sql), params)
    else:
        session_maker = get_session_maker()
        async with session_maker() as sess:
            result = await sess.execute(text(sql), params)

    # Format results
    results = []
    for row in result.fetchall():
        results.append({
            "id": str(row[0]),
            "content": row[1],
            "category": row[2],
            "source": row[3],
            "character": row[4],
            "distance": float(row[5]),
            "similarity": 1 - float(row[5])  # Convert distance to similarity
        })

    return results


async def batch_add_documents(
    documents: list[dict],
    session: Optional[AsyncSession] = None
) -> int:
    """
    Add multiple documents in batch

    Args:
        documents: List of dicts with keys: content, category, source, character (optional)
        session: Optional database session

    Returns:
        Number of documents added
    """
    count = 0

    for doc_data in documents:
        try:
            await add_document(
                content=doc_data["content"],
                category=doc_data["category"],
                source=doc_data["source"],
                character=doc_data.get("character"),
                session=session
            )
            count += 1
        except Exception as e:
            print(f"Error adding document: {e}")
            continue

    return count


async def get_document(
    doc_id: UUID,
    session: Optional[AsyncSession] = None
) -> Optional[RAGDocument]:
    """
    Get a document by ID

    Args:
        doc_id: Document UUID
        session: Optional database session

    Returns:
        RAGDocument or None
    """
    if session:
        result = await session.execute(
            select(RAGDocument).where(RAGDocument.id == doc_id)
        )
        return result.scalar_one_or_none()
    else:
        session_maker = get_session_maker()
        async with session_maker() as sess:
            result = await sess.execute(
                select(RAGDocument).where(RAGDocument.id == doc_id)
            )
            return result.scalar_one_or_none()


async def delete_document(
    doc_id: UUID,
    session: Optional[AsyncSession] = None
) -> bool:
    """
    Delete a document by ID

    Args:
        doc_id: Document UUID
        session: Optional database session

    Returns:
        True if deleted, False if not found
    """
    if session:
        result = await session.execute(
            sql_delete(RAGDocument).where(RAGDocument.id == doc_id)
        )
        await session.commit()
        return result.rowcount > 0
    else:
        session_maker = get_session_maker()
        async with session_maker() as sess:
            result = await sess.execute(
                sql_delete(RAGDocument).where(RAGDocument.id == doc_id)
            )
            await sess.commit()
            return result.rowcount > 0


async def get_document_count(
    category: Optional[str] = None,
    session: Optional[AsyncSession] = None
) -> int:
    """
    Get count of documents, optionally filtered by category

    Args:
        category: Optional category filter
        session: Optional database session

    Returns:
        Document count
    """
    sql = "SELECT COUNT(*) FROM rag_documents"
    params = {}

    if category:
        sql += " WHERE category = :category"
        params["category"] = category

    if session:
        result = await session.execute(text(sql), params)
    else:
        session_maker = get_session_maker()
        async with session_maker() as sess:
            result = await sess.execute(text(sql), params)

    return result.scalar()
