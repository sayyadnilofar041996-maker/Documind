# DocuMind 🧠
## AI-Powered Document Intelligence Platform

> **Status:** 🚧 Under Construction

### Stack
- FastAPI + Python 3.12
- PostgreSQL 16 + pgvector (HNSW)
- Celery + Redis
- Groq API (llama3-8b-8192)
- HuggingFace all-MiniLM-L6-v2 (CPU)
- Docker Compose (7 services)

### Phases
- [ ] Phase 1 — Foundation
- [ ] Phase 2 — Auth
- [ ] Phase 3 — Document Upload
- [ ] Phase 4 — Embeddings
- [ ] Phase 5 — RAG Pipeline
- [ ] Phase 6 — Async Processing
- [ ] Phase 7 — MCP Server
- [ ] Phase 8 — Tests + Polish

### Quick Start
```bash
# Coming in Phase 1
cp .env.example .env
docker compose up
```