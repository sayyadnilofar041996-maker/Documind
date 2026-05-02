import ast
import re
import structlog
from typing import List
from app.pipeline.parsers import ParsedChunk

logger = structlog.get_logger()


def _split_python(content: str) -> List[str]:
    """Splits Python code by top-level classes and functions using AST."""
    try:
        tree = ast.parse(content)
        lines = content.splitlines()
        chunks = []
        last_index = 0

        # Identify top-level definitions
        nodes = [node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.AsyncFunctionDef))]
        
        if not nodes:
            return [content] if content.strip() else []

        for node in nodes:
            # Get everything from last_index up to the start of this node
            start_line = node.lineno - 1
            
            # Find the end of this node (inclusive)
            end_line = getattr(node, "end_lineno", start_line + 1)
            
            # Extract block
            block = "\n".join(lines[last_index:end_line])
            if block.strip():
                chunks.append(block)
            last_index = end_line

        # Capture remaining lines
        remaining = "\n".join(lines[last_index:])
        if remaining.strip():
            if chunks:
                chunks[-1] += "\n" + remaining
            else:
                chunks.append(remaining)
                
        return chunks
    except SyntaxError:
        # Fallback to simple blank line splitting
        logger.warning("parser.code_syntax_error", msg="Falling back to simple splitting")
        return [c.strip() for c in re.split(r'\n\s*\n', content) if c.strip()]


def _split_js_ts(content: str) -> List[str]:
    """Splits JS/TS by blank lines between top-level blocks."""
    return [c.strip() for c in re.split(r'\n\s*\n', content) if c.strip()]


def _split_markdown(content: str) -> List[str]:
    """Splits Markdown by ## headings."""
    chunks = re.split(r'(?=\n##\s+|^##\s+)', content)
    return [c.strip() for c in chunks if c.strip()]


def parse_code(file_path: str, file_type: str) -> List[ParsedChunk]:
    """
    Parses source code or markdown files into logical chunks.
    
    Args:
        file_path (str): Path to the source file.
        file_type (str): Extension/type (py, js, ts, md).
        
    Returns:
        List[ParsedChunk]: List of extracted chunks.
    """
    logger.info("parser.code_started", path=file_path, type=file_type)
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        logger.error("parser.code_read_failed", path=file_path, error=str(e))
        raise

    file_type = file_type.lower().lstrip('.')
    
    if file_type == 'py':
        raw_chunks = _split_python(content)
    elif file_type in ['js', 'ts', 'jsx', 'tsx']:
        raw_chunks = _split_js_ts(content)
    elif file_type in ['c', 'cpp', 'h', 'hpp', 'java', 'go', 'rs']:
        # For now, use the robust blank-line splitting for these languages
        raw_chunks = [c.strip() for c in re.split(r'\n\s*\n', content) if c.strip()]
    elif file_type == 'md':
        raw_chunks = _split_markdown(content)
    else:
        raw_chunks = [c.strip() for c in re.split(r'\n\s*\n', content) if c.strip()]

    parsed_chunks = []
    for i, text in enumerate(raw_chunks):
        parsed_chunks.append(ParsedChunk(
            text=text,
            page_number=1,
            chunk_index=i
        ))
        
    logger.info("parser.code_finished", path=file_path, chunks=len(parsed_chunks))
    return parsed_chunks
