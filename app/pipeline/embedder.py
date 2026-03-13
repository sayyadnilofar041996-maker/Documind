"""
DocuMind - pipeline/embedder.py
Purpose : HuggingFace sentence-transformers embedding (CPU only)
Phase   : 3 — Embeddings & Vector Search
"""

from functools import lru_cache
from sentence_transformers import SentenceTransformer
from app.config import get_settings
import structlog

settings = get_settings()
logger = structlog.get_logger()


# ── Model Loading ─────────────────────────────────────────────
@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    """
    Load and cache the HuggingFace embedding model.

    Called:
      - Once at startup (pre-warmed in main.py lifespan)
      - Returns same cached instance on every subsequent call

    Model: all-MiniLM-L6-v2
      - Size: ~80MB
      - Output: 384-dimensional vectors
      - Speed: ~150ms per batch of 32 on Ryzen 5 4500U (CPU)

    CRITICAL: device='cpu' — this machine has NO GPU
    NEVER change to device='cuda'
    """
    logger.info(
        "embedder.loading",
        model=settings.embedding_model,
        device=settings.embedding_device,
        cache_dir=settings.embedding_cache_dir,
    )

    model = SentenceTransformer(
        settings.embedding_model,
        device=settings.embedding_device,   # always 'cpu'
        cache_folder=settings.embedding_cache_dir,
    )

    logger.info(
        "embedder.loaded",
        model=settings.embedding_model,
        device=settings.embedding_device,
    )

    return model


# ── Batch Embedding ───────────────────────────────────────────
def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of texts in batches.

    Used by:
      - Celery embed_task (T-3.2) to embed all document chunks

    Args:
      texts: list of chunk texts to embed

    Returns:
      list of 384-dimensional float vectors (Python lists)

    Performance on Ryzen 5 4500U:
      ~150ms per batch of 32 chunks
      200 chunks = ~1 second total
    """
    if not texts:
        return []

    model = get_embedder()

    embeddings = model.encode(
        texts,
        batch_size=settings.embedding_batch_size,  # 32
        normalize_embeddings=True,   # unit vectors for cosine similarity
        show_progress_bar=False,     # no progress bar in production
        convert_to_numpy=True,       # numpy first then convert
    )

    # Convert numpy array to Python list of lists
    # pgvector expects Python lists not numpy arrays
    return embeddings.tolist()


# ── Single Embedding ──────────────────────────────────────────
def embed_single(text: str) -> list[float]:
    """
    Embed a single text string.

    Used by:
      - POST /query/ask (T-4.3) to embed user question at query time
      - MCP search tool (T-6.1)

    Must be fast — called on every user query.
    Expected: ~50ms for single string on CPU.

    Returns:
      384-dimensional float vector as Python list
    """
    model = get_embedder()

    embedding = model.encode(
        text,
        normalize_embeddings=True,
        show_progress_bar=False,
        convert_to_numpy=True,
    )

    return embedding.tolist()


# ── Dimension Check ───────────────────────────────────────────
def get_embedding_dim() -> int:
    """
    Returns the embedding dimension (384 for all-MiniLM-L6-v2).
    Used for validation — pgvector column is Vector(384).
    """
    return get_embedder().get_sentence_embedding_dimension()
