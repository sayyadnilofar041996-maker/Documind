from prometheus_client import Histogram

# ── Embedding Metrics ─────────────────────────────────────────
embedding_latency_seconds = Histogram(
    "embedding_latency_seconds",
    "Time spent generating document embeddings",
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)
