"""
DocuMind - rag/retriever.py
Purpose : pgvector similarity search — retrieves relevant chunks
Phase   : 3 — Embeddings & Vector Search
"""

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Float, func
from sqlalchemy.orm import joinedload
from fastembed.rerank.cross_encoder import TextCrossEncoder as Reranker
from functools import lru_cache
import sqlalchemy as sa
import structlog
import time

from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


@lru_cache(maxsize=1)
def get_reranker() -> Reranker:
    """Load and cache the fastembed reranker model."""
    logger.info("reranker.loading", model=settings.rerank_model)
    model = Reranker(model_name=settings.rerank_model, cache_dir=settings.embedding_cache_dir)
    logger.info("reranker.loaded", model=settings.rerank_model)
    return model


async def retrieve_chunks(
    query: str,  # required for keyword search
    query_embedding: list[float],
    db: AsyncSession,
    user_id: UUID,
    document_id: UUID | None = None,
    top_k: int | None = None,
    threshold: float | None = None,
) -> list[tuple[DocumentChunk, Document, float]]:
    """
    Retrieve most relevant chunks using Hybrid Search (Semantic + Keyword).
    
    Flow:
      1. Vector Similarity Search (Top 50)
      2. Keyword-based Search (Top 50)
      3. Reciprocal Rank Fusion (RRF) to merge ranks
      4. Return top-K fused results
    """
    if top_k is None:
        top_k = settings.top_k_chunks
    if threshold is None:
        threshold = settings.similarity_threshold

    # ── 1. Semantic Search (Vector) ───────────────────────────
    # We fetch a larger pool for RRF
    RRF_POOL_SIZE = 50
    cosine_distance = DocumentChunk.embedding.cosine_distance(query_embedding)
    vector_stmt = (
        select(DocumentChunk, (1 - cosine_distance).label("score"))
        .where(DocumentChunk.user_id == user_id)
        .where(DocumentChunk.embedding.is_not(None))
        .order_by(cosine_distance.asc())
        .limit(RRF_POOL_SIZE)
    )
    if document_id:
        vector_stmt = vector_stmt.where(DocumentChunk.document_id == document_id)
    
    vector_results = (await db.execute(vector_stmt)).all()

    # ── 2. Keyword Search (FTS) ──────────────────────────────
    # Uses PostgreSQL plainto_tsquery for natural language keywords
    fts_stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.user_id == user_id)
        .where(
            DocumentChunk.search_vector.bool_op("@@")(
                sa.func.plainto_tsquery("english", query)
            )
        )
        .order_by(sa.func.ts_rank(DocumentChunk.search_vector, sa.func.plainto_tsquery("english", query)).desc())
        .limit(RRF_POOL_SIZE)
    )
    if document_id:
        fts_stmt = fts_stmt.where(DocumentChunk.document_id == document_id)
    
    fts_results = (await db.execute(fts_stmt)).scalars().all()

    # ── 3. Reciprocal Rank Fusion (RRF) ──────────────────────
    # score = sum(1 / (rank + k))
    k = 60
    scores = {}  # {chunk_id: fused_score}
    chunks_map = {}  # {chunk_id: chunk_object}

    # Rank Semantic Results
    for rank, (chunk, score) in enumerate(vector_results, 1):
        scores[chunk.id] = 1 / (rank + k)
        chunks_map[chunk.id] = chunk

    # Rank FTS Results (Update Scores)
    for rank, chunk in enumerate(fts_results, 1):
        scores[chunk.id] = scores.get(chunk.id, 0) + (1 / (rank + k))
        chunks_map[chunk.id] = chunk

    # ── 4. Final Ranking & Context Retrieval ──────────────────
    # Sort by fused score descending
    sorted_fused = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:settings.rerank_top_k if settings.use_reranker else top_k]
    
    # Batch fetch documents for the final chunks
    final_ids = [cid for cid, _ in sorted_fused]
    if not final_ids:
        return []

    # Fetch document data
    doc_stmt = (
        select(DocumentChunk, Document)
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(DocumentChunk.id.in_(final_ids))
    )
    doc_results = (await db.execute(doc_stmt)).all()
    chunk_to_doc = {row.DocumentChunk.id: row.Document for row in doc_results}

    # ── 5. Reranking (Cross-Encoder) ──────────────────────────
    if settings.use_reranker and final_ids:
        start_rerank = time.perf_counter()
        reranker = get_reranker()
        
        # Prepare list for reranker
        passages = [chunks_map[cid].text for cid in final_ids]
        
        # fastembed.Reranker.rerank returns an iterator of results
        # We need to sort final_ids based on reranker scores
        # Note: rerank iterates through all provided documents
        rerank_results = list(reranker.rerank(query, passages))
        
        # results are (score, index)
        # Sort indices by score descending
        reranked_indices = sorted(range(len(rerank_results)), key=lambda i: rerank_results[i].score, reverse=True)
        
        # Re-order the chunk IDs according to reranker
        final_ids = [final_ids[i] for i in reranked_indices[:top_k]]
        
        duration = time.perf_counter() - start_rerank
        logger.info(
            "retriever.rerank_complete",
            query=query[:50] + "...",
            candidates=len(passages),
            top_k=top_k,
            latency_ms=round(duration * 1000)
        )

    # ── 6. Assemble Final Results ─────────────────────────────
    results = []
    for cid in final_ids:
        chunk = chunks_map[cid]
        doc = chunk_to_doc.get(cid)
        if doc:
            # We use a dummy similarity score for now, or the fused score
            # if we wanted to show it in the UI.
            results.append((chunk, doc, 1.0))

    logger.info(
        "retriever.hybrid_search_complete",
        user_id=str(user_id),
        query=query[:50] + "...",
        vector_results=len(vector_results),
        fts_results=len(fts_results),
        rerank_active=settings.use_reranker,
        final_results=len(results),
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
            "document_id": str(doc.id),
            "document_name": doc.original_filename,
            "page_number": chunk.page_number,
            "text": chunk.text,
            "score": round(score, 4),
        }
        for chunk, doc, score in results
    ]
