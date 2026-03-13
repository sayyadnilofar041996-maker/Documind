from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.pipeline.parsers import ParsedChunk

def chunk_pages(pages: list[ParsedChunk]) -> list[ParsedChunk]:
    """
    Splits larger parsed pages/chunks into smaller pieces suitable for embedding.
    
    Args:
        pages (list[ParsedChunk]): The results from the initial parsing stage.
        
    Returns:
        list[ParsedChunk]: A more granular list of chunks with page number attribution.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    final_chunks = []
    chunk_index = 0
    
    for page in pages:
        # Split each page's text into smaller chunks
        split_texts = splitter.split_text(page.text)
        
        for text in split_texts:
            final_chunks.append(ParsedChunk(
                text=text,
                page_number=page.page_number,
                chunk_index=chunk_index
            ))
            chunk_index += 1
            
    return final_chunks
