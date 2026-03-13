import os
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

sys.path.append(".")

print("--- DIAGNOSING ENUMS AND MODELS ---")
try:
    from app.models.document import FileType, DocumentStatus
    print(f"FileType members: {[m.name for m in FileType]}")
    print(f"DocumentStatus members: {[m.name for m in DocumentStatus]}")
    
    from app.services.document_service import DocumentService, EXT_MAPPING, MIME_MAPPING
    print("\nEXT_MAPPING usage:")
    for k, v in EXT_MAPPING.items():
        print(f"  {k} -> {v.name}")
        
    print("\nMIME_MAPPING usage:")
    for k, v in MIME_MAPPING.items():
        print(f"  {k} -> {v.name}")

except Exception:
    import traceback
    traceback.print_exc()

print("\n--- RUNNING PYTEST TRACE ---")
import subprocess
result = subprocess.run(
    [sys.executable, "-m", "pytest", "-v", "tests/test_documents.py"],
    capture_output=True,
    text=True
)
print(result.stdout)
print(result.stderr)
