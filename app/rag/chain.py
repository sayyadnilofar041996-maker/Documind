"""
DocuMind - rag/chain.py
Purpose : RAG chain — assembles context + history + calls Groq
Phase   : 4 — RAG Pipeline & Q&A
"""

from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.models.session import QueryMessage
from app.rag.groq_client import generate_answer
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


from app.rag.prompts import RAG_SYSTEM_PROMPT

def format_context(chunks: list) -> str:
    """Format retrieved chunks into context string."""
    if not chunks:
        return "No relevant context found."
    parts = []
    for i, (chunk, document, score) in enumerate(chunks):
        parts.append(f"[Source {i+1}: {document.original_filename}, Page {chunk.page_number}]\n{chunk.text}")
    return "\n\n".join(parts)

def format_history(history: list) -> str:
    """Format conversation history into string."""
    if not history:
        return "No previous conversation."
    parts = []
    for msg in history:
        role = "User" if msg.role == "user" else "Assistant"
        parts.append(f"{role}: {msg.content}")
    return "\n".join(parts)

# ── RAG Chain ─────────────────────────────────────────────────
async def run_rag_chain(
    question: str,
    chunks: list[tuple[DocumentChunk, Document, float]],
    history: list[QueryMessage],
) -> dict:
    """
    Run the full RAG chain — assemble prompt and call Groq.
    
    Returns:
        dict with: answer, prompt_tokens, completion_tokens
    """
    # Step 1: Format context from retrieved chunks
    context = format_context(chunks)

    # Step 2: Format conversation history
    history_text = format_history(history)

    # Step 3: Fill system prompt template
    system_prompt = RAG_SYSTEM_PROMPT.format(
        context=context,
        history=history_text,
        filename="{filename}",  # kept as placeholder for inline citations
        page="{page}",          # kept as placeholder for inline citations
    )

    # Step 4: Build messages for Groq
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question},
    ]

    # Step 5: Call Groq
    answer_text, prompt_tokens, completion_tokens = generate_answer(messages)

    logger.info(
        "rag.chain_complete",
        question_length=len(question),
        chunks_used=len(chunks),
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
    )

    return {
        "answer": answer_text,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens
    }
