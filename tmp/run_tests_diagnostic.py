import os
import subprocess
import sys

# Set dummy env vars for tests BEFORE importing app code
os.environ["SECRET_KEY"] = "test-secret"
os.environ["POSTGRES_USER"] = "postgres"
os.environ["POSTGRES_PASSWORD"] = "1234"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres:1234@localhost:5432/documind_test"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["CELERY_BROKER_URL"] = "redis://localhost:6379/0"
os.environ["CELERY_RESULT_BACKEND"] = "redis://localhost:6379/0"
os.environ["GROQ_API_KEY"] = "gsk_test"
os.environ["MCP_API_KEY"] = "mcp_test"
os.environ["PYTHONPATH"] = "."

print("Running pytest...")
result = subprocess.run(
    [sys.executable, "-m", "pytest", "-v", "tests/test_documents.py"],
    capture_output=True,
    text=True
)

print("STDOUT:")
print(result.stdout)
print("\nSTDERR:")
print(result.stderr)
print(f"\nExit code: {result.returncode}")
