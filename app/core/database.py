"""
DocuMind - core/database.py
Purpose : Async SQLAlchemy engine, session factory, Base, init_db()
Phase   : 1 — Foundation
"""
<<<<<<< HEAD
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

=======

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
>>>>>>> 57860ade3eb8243d303fd64b397edcf7730ce2d9
from app.config import get_settings

settings = get_settings()

# ── Async Engine ──────────────────────────────────────────────
# pool_size=5        → max 5 permanent DB connections
# max_overflow=10    → allow 10 extra connections under heavy load
# pool_pre_ping=True → test connection before using (auto-reconnect)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

# ── Session Factory ───────────────────────────────────────────
# expire_on_commit=False → objects stay usable after commit
# (important for async — avoids lazy loading errors)
<<<<<<< HEAD
AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
=======
AsyncSessionLocal = async_sessionmaker(
>>>>>>> 57860ade3eb8243d303fd64b397edcf7730ce2d9
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ── Declarative Base ──────────────────────────────────────────
# All SQLAlchemy models inherit from this Base
# Base.metadata.create_all() creates all tables at startup
class Base(DeclarativeBase):
<<<<<<< HEAD
    """Shared DeclarativeBase for all ORM models."""
=======
>>>>>>> 57860ade3eb8243d303fd64b397edcf7730ce2d9
    pass


# ── Database Initialization ───────────────────────────────────
async def init_db() -> None:
    """
    Called once at application startup (in main.py lifespan).
<<<<<<< HEAD
    1. Creates pgvector extension (needed for Vector columns)
    2. Creates all tables defined in models/

=======
    1. Creates pgvector extension (needed for Vector(384) columns)
    2. Creates all tables defined in models/
    
>>>>>>> 57860ade3eb8243d303fd64b397edcf7730ce2d9
    NOTE: In production use Alembic migrations instead.
    This is a convenience function for development startup.
    """
    async with engine.begin() as conn:
        # Step 1: Enable pgvector extension
        # Must run BEFORE create_all — Vector columns need this extension
<<<<<<< HEAD
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

        # Step 2: Create all tables from SQLAlchemy models
        # Import models here to ensure they are registered with Base
        from app.models import user, token  # noqa: F401
=======
        await conn.execute(
            text("CREATE EXTENSION IF NOT EXISTS vector")
        )
        
        # Step 2: Create all tables from SQLAlchemy models
        # ImportModels here to ensure they are registered with Base
        from app.models import user, document, chunk, session, token  # noqa: F401
>>>>>>> 57860ade3eb8243d303fd64b397edcf7730ce2d9
        await conn.run_sync(Base.metadata.create_all)
