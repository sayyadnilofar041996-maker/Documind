import os
import sys

# Set dummy env vars for tests BEFORE importing app code
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

sys.path.append(".")

print("Attempting to import models and services used in tests...")

try:
    from app.models.document import Document, DocumentStatus, FileType
    print(f"DocumentStatus: {list(DocumentStatus)}")
    print(f"FileType: {list(FileType)}")
    
    from app.services.document_service import DocumentService
    service = DocumentService()
    print("DocumentService initialized")
    
    from app.api.v1.documents import router as doc_router
    print("Document router imported")
    
except Exception:
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("SUCCESS")
