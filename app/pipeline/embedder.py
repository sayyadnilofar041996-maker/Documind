import torch
from sentence_transformers import SentenceTransformer
from functools import lru_cache
import structlog

logger = structlog.get_logger()

@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    """
    Returns a cached instance of the sentence-transformer model.
    Forces CPU usage as per environment constraints.
    """
    logger.info("embedder.loading_model", model="all-MiniLM-L6-v2")
    # Force CPU for sentence-transformers
    device = "cpu"
    model = SentenceTransformer("all-MiniLM-L6-v2", device=device)
    return model

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generates 384-dimensional embeddings for a list of strings.
    
    Args:
        texts (list[str]): List of text segments to embed.
        
    Returns:
        list[list[float]]: List of embedding vectors.
    """
    if not texts:
        return []

    model = get_embedder()
    # Use recommended parameters: normalize to unit length for cosine similarity
    embeddings = model.encode(
        texts, 
        batch_size=32, 
        normalize_embeddings=True,
        convert_to_list=True
    )
    return embeddings
