"""
DocuMind - core/metrics.py
Purpose : Prometheus metrics definitions for observability

Metrics Defined:
- http_requests_total: Tracks the total number of HTTP requests received, categorized by method, endpoint, and status_code. Useful for monitoring traffic volume and error rates.
- http_request_duration_seconds: Measures the latency of HTTP requests, categorized by method and endpoint. Useful for identifying slow operations and performance bottlenecks.
- groq_requests_total: Total Groq LLM requests, categorized by status (success/error/rate_limit).
- groq_latency_seconds: Groq LLM response latency in seconds.
- groq_tokens_total: Total tokens used (prompt + completion).
- documents_processed_total: Tracks the total number of documents processed by the ingestion pipeline, categorized by whether the processing was a success or a failed operation.
- rag_queries_total: Tracks the total number of RAG (Retrieval-Augmented Generation) queries made, categorized by their success or failed status.
- embedding_latency_seconds: Measures the time spent generating document and query embeddings. Important for monitoring the performance of the local embedding model.
"""

from prometheus_client import Counter, Histogram, Gauge

# ── HTTP Metrics ──────────────────────────────────────────────
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"]
)

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

# ── Application Metrics ─────────────────────────────────────────

documents_processed_total = Counter(
    "documents_processed_total",
    "Total documents processed",
    ["status"] # success or failed
)

rag_queries_total = Counter(
    "rag_queries_total",
    "Total RAG queries",
    ["status"] # success or failed
)

embedding_latency_seconds = Histogram(
    "embedding_latency_seconds",
    "Time spent generating document embeddings",
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)
