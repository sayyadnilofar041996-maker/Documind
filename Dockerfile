# ============================================================
# DocuMind — API + MCP Server
# Base: python:3.12-slim
# Serves: FastAPI on :8000 and MCP on :8001
# ============================================================

FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Prevent Python from buffering stdout/stderr
# (so logs appear immediately in docker compose logs)
ENV PYTHONUNBUFFERED=1

# Install system dependencies
# gcc, g++   → needed to compile some Python packages
# libpq-dev  → needed for asyncpg (PostgreSQL driver)
# curl       → needed for health check in docker-compose
# libmagic1  → needed for python-magic (file type validation)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker layer cache optimization)
# If requirements.txt hasn't changed → skip pip install on rebuild
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy entire project code into container
COPY . .

# Create directories the app needs at runtime
RUN mkdir -p /app/uploads /app/.cache/huggingface

# Expose both ports (API + MCP)
EXPOSE 8000 8001

# ============================================================
# NOTE: No CMD here — command is set in docker-compose.yml
# api service → uvicorn app.main:app --port 8000
# mcp service → uvicorn mcp.server:app --port 8001
# ============================================================