from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.pipeline.parsers import ParsedChunk

def chunk_pages(pages: list[ParsedChunk]) -> list[ParsedChunk]:
    """
    Chunks a list of parsed document pages into smaller segments.
    
    Args:
        pages (list[ParsedChunk]): List of pages from the document parsers.
        
    Returns:
        list[ParsedChunk]: A list of smaller text chunks, each attributing 
                          the original page number.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    all_chunks = []
    global_chunk_index = 0
    
    for page in pages:
        texts = splitter.split_text(page.text)
        for text in texts:
            all_chunks.append(ParsedChunk(
                text=text.strip(),
                page_number=page.page_number,
                chunk_index=global_chunk_index
            ))
            global_chunk_index += 1
            
    return all_chunks
