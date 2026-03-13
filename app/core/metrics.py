<<<<<<< HEAD
"""
DocuMind - core/metrics.py
Purpose : Prometheus metrics definitions
"""

from prometheus_client import Counter, Histogram

# ── Groq Metrics ──────────────────────────────────────────────
groq_requests_total = Counter(
    "documind_groq_requests_total",
    "Total Groq LLM requests",
    ["status"]
)

groq_latency_seconds = Histogram(
    "documind_groq_latency_seconds",
    "Groq LLM response latency in seconds"
)

groq_tokens_total = Counter(
    "documind_groq_tokens_total",
    "Total tokens used (prompt + completion)"
)

# ── Pipeline Metrics ──────────────────────────────────────────
# Added for future use by other components
embedding_latency_seconds = Histogram(
    "documind_embedding_latency_seconds",
    "Embedding generation latency in seconds"
)

documents_processed_total = Counter(
    "documind_documents_processed_total",
    "Total documents processed",
    ["status", "file_type"]
=======
from prometheus_client import Histogram

# ── Embedding Metrics ─────────────────────────────────────────
embedding_latency_seconds = Histogram(
    "embedding_latency_seconds",
    "Time spent generating document embeddings",
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
>>>>>>> 754678717323925d38d304f7c7368267e3345eaa
)
