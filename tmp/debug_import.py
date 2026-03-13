import os
os.environ["SECRET_KEY"] = "test-secret"
os.environ["POSTGRES_USER"] = "postgres"
os.environ["POSTGRES_PASSWORD"] = "postgres"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres:postgres@localhost:5432/documind_test"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["CELERY_BROKER_URL"] = "redis://localhost:6379/0"
os.environ["CELERY_RESULT_BACKEND"] = "redis://localhost:6379/0"
os.environ["GROQ_API_KEY"] = "gsk_test"
os.environ["MCP_API_KEY"] = "mcp_test"

try:
    from app.core.database import engine
    print("Database engine imported successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
