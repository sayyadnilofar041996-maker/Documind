"""
DocuMind - pipeline/embedder.py
Purpose : fastembed embedding (CPU only)
Phase   : 3 — Embeddings & Vector Search
"""

from functools import lru_cache
from fastembed import TextEmbedding
from app.config import get_settings
import structlog

settings = get_settings()
logger = structlog.get_logger()


# ── Model Loading ─────────────────────────────────────────────
@lru_cache(maxsize=1)
def get_embedder() -> TextEmbedding:
    """
    Load and cache the fastembed embedding model.
    """
    logger.info(
        "embedder.loading",
        model="sentence-transformers/all-MiniLM-L6-v2",
        cache_dir=settings.embedding_cache_dir,
    )

    model = TextEmbedding(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        cache_dir=settings.embedding_cache_dir,
    )

    logger.info(
        "embedder.loaded",
        model="sentence-transformers/all-MiniLM-L6-v2",
    )

    return model


# ── Batch Embedding ───────────────────────────────────────────
def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of texts in batches using fastembed.
    Returns: list of 384-dimensional float vectors (Python lists)
    """
    if not texts:
        return []

    model = get_embedder()
    # model.embed returns an iterator of numpy arrays
    embeddings = list(model.embed(texts))
    
    return [e.tolist() for e in embeddings]


# ── Single Embedding ──────────────────────────────────────────
def embed_single(text: str) -> list[float]:
    """
    Embed a single text string.
    Returns: 384-dimensional float vector as Python list
    """
    model = get_embedder()
    embeddings = list(model.embed([text]))
    return embeddings[0].tolist()


# ── Dimension Check ───────────────────────────────────────────
def get_embedding_dim() -> int:
    """
    Returns the embedding dimension (384 for all-MiniLM-L6-v2).
    """
    return 384
