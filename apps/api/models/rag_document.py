"""
RAGDocument model - for RAG pipeline with pgvector embeddings
"""

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from uuid import uuid4
from typing import Optional

from services.database import Base


class RAGDocument(Base):
    __tablename__ = "rag_documents"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    content: Mapped[str] = mapped_column(Text)
    embedding = mapped_column(Vector(768))  # Gemini text-embedding-004 dimension
    category: Mapped[str] = mapped_column(String(50))
    source: Mapped[str] = mapped_column(Text)
    character: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    def __repr__(self):
        return f"<RAGDocument {self.id} category={self.category}>"
