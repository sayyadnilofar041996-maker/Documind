"""
DocuMind - config.py
Purpose : Pydantic-settings BaseSettings — all environment variable definitions
Phase   : 1 — Foundation
"""
from functools import lru_cache
import os
from pydantic import BaseModel, Field

class Settings(BaseModel):
    # Application fields omitted for brevity, keeping all the ones from before
    app_name: str = "DocuMind"
    app_version: str = "1.0.0"
    debug: bool = False
    secret_key: str = "change-me-in-production-use-64-char-hex"

    # Database
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_db: str = "documind"
    postgres_user: str = "documind_user"
    postgres_password: str = "password"
    database_url: str = "postgresql+asyncpg://documind_user:password@postgres:5432/documind"
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # Redis/Celery
    redis_url: str = "redis://redis:6379/0"
    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/1"

    # Groq
    groq_api_key: str = ""
    groq_model: str = "llama3-8b-8192"
    groq_max_tokens: int = 1024
    groq_temperature: float = 0.1

    # Embeddings
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_device: str = "cpu"
    embedding_batch_size: int = 32
    embedding_cache_dir: str = "/app/.cache/huggingface"
    embedding_dim: int = 384

    # JWT
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    # File Upload
    upload_dir: str = "/app/uploads"
    max_file_size_mb: int = 50
    allowed_extensions: list[str] = Field(default=["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "py", "js", "jsx", "ts", "tsx", "md", "txt", "css", "html", "java", "c", "cpp", "h", "hpp", "rb", "go", "rs", "php", "swift", "kt"])

    # RAG Pipeline
    chunk_size: int = 512
    chunk_overlap: int = 50
    chunk_separators: list[str] = Field(default=["\n\n", "\n", ". ", " ", ""])
    top_k_chunks: int = 5
    similarity_threshold: float = 0.4
    rerank_model: str = "BAAI/bge-reranker-base"
    rerank_top_k: int = 20
    use_reranker: bool = True
    conversation_history_pairs: int = 6
    docx_page_word_limit: int = 500

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    # Celery
    celery_worker_concurrency: int = 2
    celery_task_soft_time_limit: int = 300
    celery_task_time_limit: int = 600

    # MCP
    mcp_api_key: str = "change-me"


@lru_cache
def get_settings() -> Settings:
    """
    Load settings from .env and os.environ.
    Manual implementation to avoid pydantic-settings 2.x environment issues.
    """
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
    
    data = {}
    
    # Simple manual mapping with type conversion hints
    for name, field in Settings.model_fields.items():
        env_val = os.getenv(name.upper())
        if env_val is not None:
            # Handle bool
            if field.annotation is bool:
                data[name] = env_val.lower() in ("true", "1", "yes")
            # Handle list (simple comma split if it looks like one)
            elif name in ("allowed_extensions", "chunk_separators"):
                if env_val.startswith("["):
                    import json
                    try:
                        data[name] = json.loads(env_val.replace("'", "\""))
                    except:
                        data[name] = [s.strip() for s in env_val.strip("[]").split(",")]
                else:
                    data[name] = [s.strip() for s in env_val.split(",")]
            # Handle int/float
            elif field.annotation is int:
                data[name] = int(env_val)
            elif field.annotation is float:
                data[name] = float(env_val)
            else:
                data[name] = env_val

    return Settings(**data)
