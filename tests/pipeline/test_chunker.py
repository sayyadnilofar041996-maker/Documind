import pytest
from app.pipeline.parsers import ParsedChunk
from app.pipeline.chunker import chunk_pages

def test_chunk_pages_basic():
    pages = [
        ParsedChunk(text="This is page 1. It has some text.", page_number=1, chunk_index=0),
        ParsedChunk(text="This is page 2. More text here.", page_number=2, chunk_index=1)
    ]
    
    chunks = chunk_pages(pages)
    
    assert len(chunks) >= 2
    assert chunks[0].page_number == 1
    assert chunks[-1].page_number == 2
    assert all(isinstance(c, ParsedChunk) for c in chunks)

def test_chunk_pages_splitting():
    # Long text that should be split
    # 'Word ' is 5 chars. 200 * 5 = 1000 chars. 
    # With chunk_size=512, this should split into 2-3 chunks.
    long_text = "Word " * 200 
    pages = [ParsedChunk(text=long_text, page_number=1, chunk_index=0)]
    
    chunks = chunk_pages(pages)
    assert len(chunks) > 1
    assert all(c.page_number == 1 for c in chunks)
    # Check global indexing
    for i, chunk in enumerate(chunks):
        assert chunk.chunk_index == i
