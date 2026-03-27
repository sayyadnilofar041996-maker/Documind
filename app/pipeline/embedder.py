"""
DocuMind - pipeline/embedder.py
Purpose : fastembed embedding (CPU only)
Phase   : 3 — Embeddings & Vector Search
"""

import time
from functools import lru_cache
from fastembed import TextEmbedding
from app.config import get_settings
from app.core import metrics
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
        model=settings.embedding_model,
        cache_dir=settings.embedding_cache_dir,
    )

    # fastembed supports 'sentence-transformers/all-MiniLM-L6-v2' natively
    model = TextEmbedding(
        model_name=settings.embedding_model,
        cache_dir=settings.embedding_cache_dir
    )

    logger.info(
        "embedder.loaded",
        model=settings.embedding_model,
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

    start_time = time.perf_counter()
    model = get_embedder()
    
    # fastembed.embed returns a generator of numpy arrays
    embeddings = list(model.embed(
        texts, 
        batch_size=settings.embedding_batch_size
    ))
    
    duration = time.perf_counter() - start_time
    metrics.embedding_latency_seconds.observe(duration)
    
    return [e.tolist() for e in embeddings]


# ── Single Embedding ──────────────────────────────────────────
def embed_single(text: str) -> list[float]:
    """
    Embed a single text string.
    Returns: 384-dimensional float vector as Python list
    """
    start_time = time.perf_counter()
    model = get_embedder()
    
    embeddings = list(model.embed([text]))
    
    duration = time.perf_counter() - start_time
    metrics.embedding_latency_seconds.observe(duration)
    
    return embeddings[0].tolist()


# ── Dimension Check ───────────────────────────────────────────
def get_embedding_dim() -> int:
    """
    Returns the embedding dimension (default 384).
    """
    return settings.embedding_dim
