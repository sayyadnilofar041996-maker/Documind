import os
import sys
from unittest.mock import MagicMock
import sqlalchemy
from sqlalchemy import JSON, PickleType

# Force testing database URL before any imports
# Using shared memory allows different connections (app vs fixtures) to see the same data
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///file:testdb?mode=memory&cache=shared"
os.environ["DOCUMIND_API_TOKEN"] = "test-token"

# ── Global Mocks ──────────────────────────────────────────────
# Mock heavy ML libraries to bypass Windows DLL loading errors
# Using MagicMock for the module and ensuring __spec__ is set to satisfy importlib
mock_torch = MagicMock()
mock_torch.__spec__ = MagicMock()
mock_torch.__version__ = "2.0.0"
sys.modules["torch"] = mock_torch

mock_st = MagicMock()
mock_st.__spec__ = MagicMock()
sys.modules["sentence_transformers"] = mock_st

# Mock PostgreSQL specific types for SQLite compat in tests
pg_mock = MagicMock()
pg_mock.JSONB = JSON
sys.modules["sqlalchemy.dialects.postgresql"] = pg_mock

vector_mock = MagicMock()
vector_mock.Vector = lambda size: PickleType
sys.modules["pgvector.sqlalchemy"] = vector_mock

# Patch create_async_engine and create_engine to strip PG-only args in SQLite
from sqlalchemy.ext.asyncio import create_async_engine as real_create_async_engine
from sqlalchemy import create_engine as real_create_engine

def patched_create_async_engine(url, **kwargs):
    if "sqlite" in str(url):
        # Remove PG-only arguments
        kwargs.pop("pool_size", None)
        kwargs.pop("max_overflow", None)
        # Ensure SQLite works in async tests
        kwargs["connect_args"] = kwargs.get("connect_args", {})
        kwargs["connect_args"]["check_same_thread"] = False
    return real_create_async_engine(url, **kwargs)

def patched_create_engine(url, **kwargs):
    if "sqlite" in str(url):
        # Remove PG-only arguments
        kwargs.pop("pool_size", None)
        kwargs.pop("max_overflow", None)
    return real_create_engine(url, **kwargs)

import sqlalchemy.ext.asyncio
sqlalchemy.ext.asyncio.create_async_engine = patched_create_async_engine
sqlalchemy.create_engine = patched_create_engine

import pytest
import asyncio
from typing import AsyncGenerator, Dict, Any
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from unittest.mock import patch

from app.main import app
from app.core.database import Base
from app.dependencies import get_db

# ── Pytest Asyncio Configuration ──────────────────────────────
pytest_plugins = ('pytest_asyncio',)

# ── Test Database Configuration ───────────────────────────────
# Use in-memory SQLite for fast, isolated tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ── Fixtures ──────────────────────────────────────────────────

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Creates a fresh in-memory database instance for each test.
    Handles schema creation before the test and drops it after.
    """
    async with test_engine.begin() as conn:
        # Create all tables (models must be loaded)
        from app.models import user, document, chunk, session, token
        await conn.run_sync(Base.metadata.create_all)
        
    async with TestSessionLocal() as session:
        yield session
        
    async with test_engine.begin() as conn:
        # Drop all tables after the test to ensure a clean slate
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Test client that overrides the get_db dependency to use the test database.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    # We use ASGITransport to bypass the actual network 
    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://testserver"
    ) as ac:
        yield ac
        
    # Clean up the override after the test
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user_data() -> Dict[str, str]:
    """Returns valid test user data."""
    return {
        "email": "testuser@example.com",
        "username": "tester",
        "password": "SecurePassword123!"
    }

@pytest.fixture(scope="function")
async def auth_headers(client: AsyncClient, test_user_data: Dict[str, str]) -> Dict[str, str]:
    """
    Helper fixture that automatically registers a user, logs them in,
    and returns the Authorization header containing their access token.
    """
    # 1. Register the user
    reg_resp = await client.post("/api/v1/auth/register", json=test_user_data)
    if reg_resp.status_code not in [201, 409]:
        print(f"DEBUG: Registration failed with {reg_resp.status_code}: {reg_resp.text}")

    # 2. Log in the user
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200, "Fixture failed to authenticate test user"

    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}
