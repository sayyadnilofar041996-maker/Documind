import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_sqlite_extension():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            print("SUCCESS: CREATE EXTENSION worked (unexpected?)")
        except Exception as e:
            print(f"EXPECTED FAILURE: {e}")

if __name__ == "__main__":
    asyncio.run(test_sqlite_extension())
