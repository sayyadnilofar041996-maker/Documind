"""
DocuMind - pipeline/parsers/code_parser.py
Purpose : Code and Markdown document parser with syntax-aware splitting.
"""
import ast
import re
from typing import List
from app.pipeline.parsers import ParsedChunk


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
            # This captures comments/imports before the definition
            start_line = node.lineno - 1
            if start_line > last_index:
                # If there's substantial content between blocks, we could chunk it
                # For now, we'll keep it with the following block or as a prefix
                pass
            
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
        # Fallback to simple blank line splitting if code is invalid or snippet
        return [c.strip() for c in re.split(r'\n\s*\n', content) if c.strip()]


def _split_js_ts(content: str) -> List[str]:
    """Splits JS/TS by blank lines between top-level blocks."""
    # Split by double newline or more to preserve logical blocks
    return [c.strip() for c in re.split(r'\n\s*\n', content) if c.strip()]


def _split_markdown(content: str) -> List[str]:
    """Splits Markdown by ## headings."""
    # Split by any level-2 heading (##)
    # We use a lookahead to keep the delimiter in the result
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
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    file_type = file_type.lower().lstrip('.')
    
    if file_type == 'py':
        raw_chunks = _split_python(content)
    elif file_type in ['js', 'ts']:
        raw_chunks = _split_js_ts(content)
    elif file_type == 'md':
        raw_chunks = _split_markdown(content)
    else:
        # Fallback for unknown types - generic block splitting
        raw_chunks = [c.strip() for c in re.split(r'\n\s*\n', content) if c.strip()]

    parsed_chunks = []
    for i, text in enumerate(raw_chunks):
        parsed_chunks.append(ParsedChunk(
            text=text,
            page_number=1,  # No real pages in code
            chunk_index=i
        ))
        
    return parsed_chunks
