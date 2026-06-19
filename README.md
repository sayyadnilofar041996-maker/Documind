# DocuMind 🧠 — AI-Powered Document Intelligence

DocuMind is a high-performance **Retrieval-Augmented Generation (RAG)** platform that enables users to interact with their documents using state-of-the-art AI. By combining **FastAPI**, **PostgreSQL (pgvector)**, and **Groq**, DocuMind provides near-instant semantic search and grounded AI responses.

## 🚀 Key Features
- **Intelligent Parsing**: Native support for PDF, DOCX, Markdown, and source code (Python, JS, TS, Java, C++, etc.).
- **Semantic Search**: Powered by **pgvector** with HNSW indexing for high-speed vector retrieval.
- **Ultra-Fast Inference**: Integrated with **Groq API** (Llama 3.3/70B) for sub-second chat responses.
- **Asynchronous Pipeline**: Background workers via **Celery & Redis** handle document chunking and vectorization.
- **Premium UI**: Responsive chat interface built with **React** and **Tailwind CSS**.
- **Agentic Ready**: Implements the **Model Context Protocol (MCP)** for standardized AI tool usage.

## 🛠️ The Tech Stack
- **Backend**: Python 3.12, FastAPI, SQLAlchemy, Celery.
- **Frontend**: React (Vite), Tailwind CSS, Lucide.
- **Database**: PostgreSQL 16 + pgvector.
- **Cache/Broker**: Redis 7.
- **Inference**: Groq (LLM), HuggingFace (Local CPU Embeddings).
- **Deployment**: Docker & Docker Compose (7-service orchestration).

## 📂 Project Structure
- `app/` — FastAPI core, API routes, and RAG logic.
- `frontend/` — React application and design system.
- `worker/` — Background task logic for indexing.
- `mcp/` — Model Context Protocol server implementation.
- `alembic/` — Database migrations and schema management.

## ⚓ Quick Start (Local Development)

### 1. Prerequisites
- Docker & Docker Compose installed.
- Groq API Key (from console.groq.com).

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/sayyadnilofar041996-maker/Documind.git
cd Documind

# Setup environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 3. Run with Docker
```bash
docker compose up -d
```
The app will be available at `http://localhost:5173`.

---
*Developed as part of the MCA Final Year Project.*