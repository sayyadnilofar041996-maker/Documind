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


# ── System Prompt Template ────────────────────────────────────
SYSTEM_PROMPT_TEMPLATE = """You are DocuMind, a precise document assistant.
Answer ONLY using the provided document context.
If the answer is not in the context, say exactly:
"I could not find this information in your documents."

Never hallucinate. Never make up information.
Always cite inline as [Source: {filename} | Page {page}].

Document Context:
{context}

Conversation History:
{history}"""


# ── Context Formatter ─────────────────────────────────────────
def format_context(
    chunks: list[tuple[DocumentChunk, Document, float]]
) -> str:
    """
    Format retrieved chunks into a context block for the prompt.

    Each chunk formatted as:
      [Source: filename.pdf | Page 3]
      chunk text here...
      ---

    Args:
      chunks: list of (DocumentChunk, Document, score) tuples
              from retrieve_chunks()

    Returns:
      formatted context string to inject into system prompt
    """
    if not chunks:
        return "No relevant context found."

    context_blocks = []
    for chunk, doc, score in chunks:
        block = (
            f"[Source: {doc.original_filename} | Page {chunk.page_number}]\n"
            f"{chunk.text}\n"
            f"---"
        )
        context_blocks.append(block)

    return "\n".join(context_blocks)


# ── History Formatter ─────────────────────────────────────────
def format_history(messages: list[QueryMessage]) -> str:
    """
    Format conversation history for the prompt.

    Takes last N*2 messages (N user + N assistant pairs).
    N = settings.conversation_history_pairs (default 6)

    Args:
      messages: list of QueryMessage from current session

    Returns:
      formatted history string or empty string if no history
    """
    if not messages:
        return "No previous conversation."

    # Take last N pairs (N user + N assistant = N*2 messages)
    max_messages = settings.conversation_history_pairs * 2
    recent_messages = messages[-max_messages:]

    history_lines = []
    for msg in recent_messages:
        role = "User" if msg.role == "user" else "Assistant"
        history_lines.append(f"{role}: {msg.content}")

    return "\n".join(history_lines)


# ── RAG Chain ─────────────────────────────────────────────────
async def run_rag_chain(
    question: str,
    chunks: list[tuple[DocumentChunk, Document, float]],
    history: list[QueryMessage],
    db: AsyncSession,
) -> tuple[str, int]:
    """
    Run the full RAG chain — assemble prompt and call Groq.

    Flow:
      1. Format retrieved chunks into context block
      2. Format conversation history
      3. Fill system prompt template
      4. Build messages list for Groq
      5. Call generate_answer() (sync, runs in thread)
      6. Return answer + prompt_tokens

    Args:
      question : user's question string
      chunks   : retrieved chunks from pgvector
      history  : previous messages in session
      db       : async db session (for future use)

    Returns:
      tuple of (answer_text, prompt_tokens)
    """
    # Step 1: Format context from retrieved chunks
    context = format_context(chunks)

    # Step 2: Format conversation history
    history_text = format_history(history)

    # Step 3: Fill system prompt template
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
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

    # Step 5: Call Groq (sync function — runs normally)
    answer_text, prompt_tokens, completion_tokens = generate_answer(messages)

    logger.info(
        "rag.chain_complete",
        question_length=len(question),
        chunks_used=len(chunks),
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
    )

    # Step 6: Return answer and token count
    return answer_text, prompt_tokens
