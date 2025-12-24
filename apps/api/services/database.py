"""
Database connection module using SQLAlchemy async.
Connects to PostgreSQL with pgvector extension.
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

DATABASE_URL = os.getenv("DATABASE_URL")


class Base(DeclarativeBase):
    pass


engine = None
async_session_maker = None


def get_engine():
    global engine
    if engine is None:
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL not configured")
        engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10
        )
    return engine


def get_session_maker():
    global async_session_maker
    if async_session_maker is None:
        async_session_maker = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False
        )
    return async_session_maker


async def get_db() -> AsyncSession:
    """Dependency for FastAPI endpoints"""
    session_maker = get_session_maker()
    async with session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database connection and verify it works"""
    engine = get_engine()
    async with engine.begin() as conn:
        # Test connection
        result = await conn.execute(text("SELECT 1"))
        result.fetchone()

        # Check extensions
        result = await conn.execute(text("SELECT extname FROM pg_extension"))
        extensions = [row[0] for row in result.fetchall()]

        print(f"[OK] Database connected successfully")
        print(f"   Extensions: {', '.join(extensions)}")

        return True


async def close_db():
    """Close database connection"""
    global engine, async_session_maker
    if engine:
        try:
            # Use close=True to force immediate close without waiting
            await engine.dispose(close=True)
        except Exception:
            pass  # Ignore cleanup errors
        engine = None
        async_session_maker = None
        print("[OK] Database connection closed")
