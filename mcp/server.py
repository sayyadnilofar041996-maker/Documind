"""
DocuMind - mcp/server.py
Purpose : Model Context Protocol server — exposes AI agent tools on :8001
"""
import httpx
import structlog
from typing import Dict, Any, List
from fastapi import FastAPI, Request, Header, HTTPException, status
from pydantic import BaseModel

from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()

app = FastAPI(
    title="DocuMind MCP Server",
    description="Agentic tool interface for DocuMind RAG",
    version="1.0.0"
)

# ── internal config ───────────────────────────────────────────
MAIN_API_URL = "http://api:8000/api/v1"

# ── Models ────────────────────────────────────────────────────
class ToolResponse(BaseModel):
    tool: str
    success: bool
    result: Any
    error: str | None = None

# ── Auth Middleware ───────────────────────────────────────────
async def verify_mcp_key(x_mcp_key: str = Header(...)):
    if x_mcp_key != settings.mcp_api_key:
        logger.warning("mcp.auth_failed", key_provided=x_mcp_key[:4] + "***")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MCP API Key"
        )

# ── Tool Endpoints ────────────────────────────────────────────

@app.post("/tools/ask", response_model=ToolResponse)
async def tool_ask(payload: Dict[str, Any], x_mcp_key: str = Header(...)):
    """Ask a question about documents."""
    await verify_mcp_key(x_mcp_key)
    
    async with httpx.AsyncClient() as client:
        try:
            # We mock a system-level user or require a user_id in payload for true multi-tenancy
            # For this MCP implementation, we assume the agent provides context
            response = await client.post(
                f"{MAIN_API_URL}/query/ask",
                json=payload,
                headers={"Authorization": f"Bearer {settings.mcp_api_key}"} # Internal trust
            )
            return ToolResponse(
                tool="ask",
                success=response.status_code == 200,
                result=response.json() if response.status_code == 200 else response.text,
                error=None if response.status_code == 200 else f"Upstream error: {response.status_code}"
            )
        except Exception as e:
            logger.error("mcp.tool_ask_failed", error=str(e))
            return ToolResponse(tool="ask", success=False, result=None, error=str(e))

@app.post("/tools/list", response_model=ToolResponse)
async def tool_list(x_mcp_key: str = Header(...)):
    """List all available documents."""
    await verify_mcp_key(x_mcp_key)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{MAIN_API_URL}/documents/",
                headers={"Authorization": f"Bearer {settings.mcp_api_key}"}
            )
            return ToolResponse(
                tool="list",
                success=response.status_code == 200,
                result=response.json() if response.status_code == 200 else response.text,
                error=None if response.status_code == 200 else f"Upstream error: {response.status_code}"
            )
        except Exception as e:
            logger.error("mcp.tool_list_failed", error=str(e))
            return ToolResponse(tool="list", success=False, result=None, error=str(e))

@app.post("/tools/status", response_model=ToolResponse)
async def tool_status(document_id: str, x_mcp_key: str = Header(...)):
    """Check processing status of a document."""
    await verify_mcp_key(x_mcp_key)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{MAIN_API_URL}/documents/{document_id}/status",
                headers={"Authorization": f"Bearer {settings.mcp_api_key}"}
            )
            return ToolResponse(
                tool="status",
                success=response.status_code == 200,
                result=response.json() if response.status_code == 200 else response.text,
                error=None if response.status_code == 200 else f"Upstream error: {response.status_code}"
            )
        except Exception as e:
            logger.error("mcp.tool_status_failed", error=str(e))
            return ToolResponse(tool="status", success=False, result=None, error=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "service": "mcp-server"}
