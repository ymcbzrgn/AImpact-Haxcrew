"""
Session model - pitch session lifecycle
"""

from sqlalchemy import String, Text, Integer, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from uuid import uuid4
from datetime import datetime
from typing import Optional

from services.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    status: Mapped[str] = mapped_column(String(20), default="created")
    deck_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    deck_format: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    deck_analysis: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    slide_contents: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    pitch_transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    qa_transcript: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    realtime_notes: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    council_dialog: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    final_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    verdict: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    investor_mode: Mapped[str] = mapped_column(String(20), default="friendly")
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    def __repr__(self):
        return f"<Session {self.id} status={self.status}>"
