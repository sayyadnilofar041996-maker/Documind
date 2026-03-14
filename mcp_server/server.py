import asyncio
import os
import httpx
from typing import Optional, List, Dict, Any
from mcp.server.stdio import stdio_server
from mcp.server import Server
from mcp.types import Tool, TextContent

# Read environment variables
DOCUMIND_API_URL = os.getenv("DOCUMIND_API_URL", "http://localhost:8000")
DOCUMIND_API_TOKEN = os.getenv("DOCUMIND_API_TOKEN")

# Initialize Server
app = Server("DocuMind")

def _get_headers() -> Dict[str, str]:
    """Helper to generate required API headers."""
    if not DOCUMIND_API_TOKEN:
        raise ValueError("DOCUMIND_API_TOKEN environment variable is not set")
    return {
        "Authorization": f"Bearer {DOCUMIND_API_TOKEN}",
        "Content-Type": "application/json"
    }

@app.list_tools()
async def list_tools() -> list[Tool]:
    """Provide the LLM agent with the available tools."""
    return [
        Tool(
            name="search_documents",
            description="Search across uploaded documents using DocuMind's RAG system.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The natural language question to ask about the documents."
                    },
                    "document_id": {
                        "type": "string",
                        "description": "Optional specific document UUID to restrict the search to.",
                        "nullable": True
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="list_documents",
            description="List all documents available in the DocuMind system and their current processing status.",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle the execution of a requested tool."""
    if name == "search_documents":
        query = arguments.get("query")
        if not query:
            return [TextContent(type="text", text="Error: Missing 'query' parameter")]
            
        doc_id = arguments.get("document_id")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {"question": query}
                if doc_id:
                    payload["document_id"] = doc_id
                    
                response = await client.post(
                    f"{DOCUMIND_API_URL}/api/v1/query/ask",
                    headers=_get_headers(),
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                # Format response for the LLM
                answer = data.get("answer", "No answer generated.")
                sources = data.get("sources", [])
                
                result = f"Answer: {answer}\n\nSources:\n"
                for s in sources:
                    result += f"- {s.get('document_name')} (Page {s.get('page_number')}): {s.get('text')[:200]}...\n"
                    
                return [TextContent(type="text", text=result)]
                
        except Exception as e:
            return [TextContent(type="text", text=f"Error running search: {str(e)}")]
            
    elif name == "list_documents":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{DOCUMIND_API_URL}/api/v1/documents/",
                    headers=_get_headers()
                )
                response.raise_for_status()
                documents = response.json()
                
                result = "Available Documents:\n"
                for doc in documents:
                    result += f"- ID: {doc.get('id')}, Name: {doc.get('filename')}, Status: {doc.get('status')}\n"
                    
                return [TextContent(type="text", text=result)]
                
        except Exception as e:
            return [TextContent(type="text", text=f"Error listing documents: {str(e)}")]
            
    else:
        raise ValueError(f"Unknown tool: {name}")

async def main():
    """Run the MCP stdio server."""
    # Start the server using stdio for Claude/Cursor communication
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
