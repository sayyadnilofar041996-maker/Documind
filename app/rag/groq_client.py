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
# Initialized once at module load
# API key loaded from settings (never hardcoded)
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
                [system prompt + user question]

    Returns:
      tuple of:
        answer_text       → LLM response string
        prompt_tokens     → tokens used in prompt
        completion_tokens → tokens used in response

    Retry behavior:
      RateLimitError → wait 2-10 seconds, retry up to 3 times
      Other errors   → log and reraise immediately

    Prometheus metrics recorded on every call:
      groq_requests_total  → success/error counter
      groq_latency_seconds → response time histogram
      groq_tokens_total    → total tokens used
    """
    start_time = time.time()

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,           # llama3-8b-8192
            messages=messages,
            max_tokens=settings.groq_max_tokens, # 1024
            temperature=settings.groq_temperature, # 0.1
        )

        # Extract response content
        answer_text = response.choices[0].message.content
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens

        # Record success metrics
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
        # Log warning — tenacity will retry automatically
        logger.warning(
            "groq.rate_limit_hit",
            error=str(e),
            model=settings.groq_model,
        )
        groq_requests_total.labels(status="rate_limit").inc()
        raise  # tenacity catches this and retries

    except Exception as e:
        # Log error and record metrics
        elapsed = time.time() - start_time
        groq_requests_total.labels(status="error").inc()
        groq_latency_seconds.observe(elapsed)

        logger.error(
            "groq.error",
            error=str(e),
            model=settings.groq_model,
            latency_ms=round(elapsed * 1000),
        )
        raise  # reraise — caller handles this
