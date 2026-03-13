import os
import subprocess
import sys

os.environ["SECRET_KEY"] = "test-secret"
os.environ["POSTGRES_USER"] = "postgres"
os.environ["POSTGRES_PASSWORD"] = "postgres"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres:postgres@localhost:5432/documind_test"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["CELERY_BROKER_URL"] = "redis://localhost:6379/0"
os.environ["CELERY_RESULT_BACKEND"] = "redis://localhost:6379/0"
os.environ["GROQ_API_KEY"] = "gsk_test"
os.environ["MCP_API_KEY"] = "mcp_test"
os.environ["PYTHONPATH"] = "."

print("Running pytest with full traceback...")
result = subprocess.run(
    [sys.executable, "-m", "pytest", "-v", "--tb=long", "tests/test_documents.py"],
    capture_output=True,
    text=True
)

print(result.stdout)
print(result.stderr)
