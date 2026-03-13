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

sys.path.append(".")

print("Testing imports...")

try:
    print("Importing app.core.database...")
    from app.core.database import Base
    print("SUCCESS")
except Exception:
    import traceback
    traceback.print_exc()

try:
    print("Importing app.models.user...")
    from app.models.user import User
    print("SUCCESS")
except Exception:
    import traceback
    traceback.print_exc()

try:
    print("Importing app.models.document...")
    from app.models.document import Document
    print("SUCCESS")
except Exception:
    import traceback
    traceback.print_exc()

try:
    print("Importing app.models.chunk...")
    from app.models.chunk import DocumentChunk
    print("SUCCESS")
except Exception:
    import traceback
    traceback.print_exc()

try:
    print("Importing app.models.session...")
    from app.models.session import QuerySession
    print("SUCCESS")
except Exception:
    import traceback
    traceback.print_exc()

try:
    print("Importing app.models.token...")
    from app.models.token import RefreshToken
    print("SUCCESS")
except Exception:
    import traceback
    traceback.print_exc()
