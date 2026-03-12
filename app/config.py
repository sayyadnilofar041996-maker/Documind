"""
DocuMind - config.py
Purpose : Pydantic BaseSettings — all environment variable definitions
Phase   : 1 — Foundation
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Application ───────────────────────────────────────
    app_name: str = "DocuMind"
    app_version: str = "1.0.0"
    debug: bool = False
    secret_key: str

    # ── PostgreSQL ────────────────────────────────────────
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_db: str = "documind"
    postgres_user: str
    postgres_password: str
    database_url: str

    # ── Redis ─────────────────────────────────────────────
    redis_url: str
    celery_broker_url: str
    celery_result_backend: str

    # ── Groq API ──────────────────────────────────────────
    groq_api_key: str
    groq_model: str = "llama3-8b-8192"
    groq_max_tokens: int = 1024
    groq_temperature: float = 0.1

    # ── Embeddings ────────────────────────────────────────
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_device: str = "cpu"
    embedding_batch_size: int = 32
    embedding_cache_dir: str = "/app/.cache/huggingface"

    # ── JWT ───────────────────────────────────────────────
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    # ── File Upload ───────────────────────────────────────
    upload_dir: str = "/app/uploads"
    max_file_size_mb: int = 50
    allowed_extensions: list[str] = ["pdf", "docx", "py", "js", "ts", "md"]

    # ── RAG Pipeline ──────────────────────────────────────
    chunk_size: int = 512
    chunk_overlap: int = 50
    top_k_chunks: int = 5
    similarity_threshold: float = 0.4
    conversation_history_pairs: int = 6

    # ── Rate Limiting ─────────────────────────────────────
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    # ── Celery ────────────────────────────────────────────
    celery_worker_concurrency: int = 2
    celery_task_soft_time_limit: int = 300
    celery_task_time_limit: int = 600

    # ── MCP Server ────────────────────────────────────────
    mcp_api_key: str


@lru_cache
def get_settings() -> Settings:
    """
    Load settings from .env file once and cache forever.
    Use this function everywhere instead of Settings() directly.
    Usage: settings = get_settings()
    """
    return Settings()
