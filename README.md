# DocuMind 🧠
## AI-Powered Document Intelligence Platform

> **Status:** ✅ Complete — all core phases built and working

### What it does
DocuMind lets you upload documents and query them using natural language — it processes, embeds, and indexes your files, then uses retrieval-augmented generation (RAG) to answer questions grounded in your own documents.

### Stack
- FastAPI + Python 3.12
- PostgreSQL 16 + pgvector (HNSW)
- Celery + Redis (async processing)
- Groq API (llama3-8b-8192)
- HuggingFace all-MiniLM-L6-v2 (CPU embeddings)
- Docker Compose (7 services)

### Features
- [x] Foundation & architecture
- [x] Authentication
- [x] Document upload & storage
- [x] Embeddings pipeline
- [x] RAG pipeline (retrieval + generation)
- [x] Async processing (Celery workers)
- [x] MCP server integration
- [x] Tests + polish

### Quick Start
\`\`\`bash
cp .env.example .env
docker compose up
\`\`\`

Once running, [add the actual next step — e.g. "visit http://localhost:8000/docs for the API, or http://localhost:3000 for the frontend"].

### Why I built this
Built as my MCA capstone project — [add one line: what problem it solves / what motivated it].
