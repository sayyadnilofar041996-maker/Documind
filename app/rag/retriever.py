"""
DocuMind - rag/retriever.py
Purpose : pgvector similarity search — retrieves relevant chunks
Phase   : 3 — Embeddings & Vector Search
"""

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Float
from sqlalchemy.orm import joinedload
import structlog

from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


async def retrieve_chunks(
    query_embedding: list[float],
    db: AsyncSession,
    user_id: UUID,
    document_id: UUID | None = None,
    top_k: int | None = None,
    threshold: float | None = None,
) -> list[tuple[DocumentChunk, Document, float]]:
    """
    Retrieve most relevant chunks for a query using cosine similarity.

    Flow:
      1. Embed query vector (done before calling this function)
      2. Compute cosine distance between query and all chunk embeddings
      3. Convert distance to similarity (1 - distance)
      4. Filter by user_id (users only see their own documents)
      5. Optionally filter by document_id
      6. Filter below similarity threshold
      7. Order by similarity descending
      8. Return top_k results

    Args:
      query_embedding : 384-dim vector from embed_single()
      db              : async database session
      user_id         : current user (enforces data isolation)
      document_id     : optional — search within one document only
      top_k           : number of results (default from settings)
      threshold       : minimum similarity score (default from settings)

    Returns:
      list of (DocumentChunk, Document, similarity_score) tuples
      sorted by similarity descending
    """
    if top_k is None:
        top_k = settings.top_k_chunks
    if threshold is None:
        threshold = settings.similarity_threshold

    # ── Cosine Similarity Calculation ────────────────────────
    # pgvector <=> operator returns COSINE DISTANCE (0 to 2)
    # similarity = 1 - distance (1 = identical, 0 = opposite)
    cosine_distance = DocumentChunk.embedding.cosine_distance(query_embedding)
    similarity = (1 - cosine_distance).cast(Float)

    # ── Build Query ───────────────────────────────────────────
    stmt = (
        select(DocumentChunk, Document, similarity.label("score"))
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(DocumentChunk.user_id == user_id)
        .where(DocumentChunk.embedding.is_not(None))
        .where(similarity >= threshold)
        .order_by(cosine_distance.asc())  # ascending distance = descending similarity
        .limit(top_k)
    )

    # ── Optional Document Filter ──────────────────────────────
    if document_id is not None:
        stmt = stmt.where(DocumentChunk.document_id == document_id)

    # ── Execute Query ─────────────────────────────────────────
    result = await db.execute(stmt)
    rows = result.all()

    # ── Build Result Tuples ───────────────────────────────────
    results = [
        (row.DocumentChunk, row.Document, float(row.score))
        for row in rows
    ]

    logger.info(
        "retriever.search_complete",
        user_id=str(user_id),
        document_id=str(document_id) if document_id else None,
        top_k=top_k,
        threshold=threshold,
        results_found=len(results),
    )

    return results


# ── Helper ────────────────────────────────────────────────────
def format_sources(
    results: list[tuple[DocumentChunk, Document, float]]
) -> list[dict]:
    """
    Format retriever results into source citations.
    Used by RAG chain to build context for Groq.

    Returns list of dicts with:
      chunk_id, document_name, page_number, text, score
    """
    return [
        {
            "chunk_id": str(chunk.id),
            "document_name": doc.original_filename,
            "page_number": chunk.page_number,
            "text": chunk.text,
            "score": round(score, 4),
        }
        for chunk, doc, score in results
    ]
