import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_db():
    engine = create_async_engine("postgresql+asyncpg://documind_user:09f18bf28ed7145c7d9e2d9b9474cfb22a57a99a3ecf3dfcd4fc7c06512f3700@localhost:5432/documind")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT count(*) FROM documents"))
            doc_count = result.scalar()
            print(f"Documents: {doc_count}")
            
            result = await conn.execute(text("SELECT count(*) FROM document_chunks"))
            chunk_count = result.scalar()
            print(f"Chunks: {chunk_count}")
            
            result = await conn.execute(text("SELECT count(*) FROM query_sessions"))
            session_count = result.scalar()
            print(f"Sessions: {session_count}")
            
            result = await conn.execute(text("SELECT count(*) FROM query_messages"))
            msg_count = result.scalar()
            print(f"Messages: {msg_count}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db())
