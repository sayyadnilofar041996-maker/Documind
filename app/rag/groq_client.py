"""
DocuMind - rag/groq_client.py
Purpose : Groq LLM API client with retry and Prometheus metrics
Phase   : 4 — RAG Pipeline & Q&A
"""

import time
from groq import Groq, RateLimitError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
import structlog

from app.config import get_settings
from app.core.metrics import (
    groq_requests_total,
    groq_latency_seconds,
    groq_tokens_total,
)

settings = get_settings()
logger = structlog.get_logger()

# ── Groq Client ───────────────────────────────────────────────
client = Groq(api_key=settings.groq_api_key)


# ── LLM Generation ────────────────────────────────────────────
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(RateLimitError),
    reraise=True,
)
def generate_answer(messages: list[dict]) -> tuple[str, int, int]:
    """
    Call Groq API to generate an answer.

    Args:
      messages: list of {role, content} dicts

    Returns:
      tuple of (answer_text, prompt_tokens, completion_tokens)
    """
    start_time = time.time()

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            max_tokens=settings.groq_max_tokens,
            temperature=settings.groq_temperature,
        )

        answer_text = response.choices[0].message.content
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens

        elapsed = time.time() - start_time
        groq_requests_total.labels(status="success").inc()
        groq_latency_seconds.observe(elapsed)
        groq_tokens_total.inc(prompt_tokens + completion_tokens)

        logger.info(
            "groq.answer_generated",
            model=settings.groq_model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            latency_ms=round(elapsed * 1000),
        )

        return answer_text, prompt_tokens, completion_tokens

    except RateLimitError as e:
        logger.warning(
            "groq.rate_limit_hit",
            error=str(e),
            model=settings.groq_model,
        )
        groq_requests_total.labels(status="rate_limit").inc()
        raise

    except Exception as e:
        elapsed = time.time() - start_time
        groq_requests_total.labels(status="error").inc()
        groq_latency_seconds.observe(elapsed)

        logger.error(
            "groq.error",
            error=str(e),
            model=settings.groq_model,
            latency_ms=round(elapsed * 1000),
        )
        raise
