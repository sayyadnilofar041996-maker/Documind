"""
DocuMind - pipeline/embedder.py
Purpose : SentenceTransformer embedding (CPU only)
Phase   : 3 — Embeddings & Vector Search
"""

import time
from functools import lru_cache
from sentence_transformers import SentenceTransformer
from app.config import get_settings
from app.core import metrics
import structlog

settings = get_settings()
logger = structlog.get_logger()


# ── Model Loading ─────────────────────────────────────────────
@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    """
    Load and cache the SentenceTransformer embedding model.
    """
    logger.info(
        "embedder.loading",
        model=settings.embedding_model,
        cache_dir=settings.embedding_cache_dir,
    )

    # Initializing SentenceTransformer
    # device='cpu' is forced to ensure stability in container/local environments
    model = SentenceTransformer(
        model_name_or_path=settings.embedding_model,
        cache_folder=settings.embedding_cache_dir,
        device=settings.embedding_device
    )

    logger.info(
        "embedder.loaded",
        model=settings.embedding_model,
    )

    return model


# ── Batch Embedding ───────────────────────────────────────────
def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of texts in batches using SentenceTransformer.
    Returns: list of 384-dimensional float vectors (Python lists)
    """
    if not texts:
        return []

    start_time = time.perf_counter()
    model = get_embedder()
    
    # encode returns numpy arrays by default
    embeddings = model.encode(
        texts, 
        batch_size=settings.embedding_batch_size,
        show_progress_bar=False,
        convert_to_numpy=True
    )
    
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
    
    embedding = model.encode(
        text, 
        show_progress_bar=False,
        convert_to_numpy=True
    )
    
    duration = time.perf_counter() - start_time
    metrics.embedding_latency_seconds.observe(duration)
    
    return embedding.tolist()


# ── Dimension Check ───────────────────────────────────────────
def get_embedding_dim() -> int:
    """
    Returns the embedding dimension (default 384).
    """
    return settings.embedding_dim
