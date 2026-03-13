import pytest
from unittest.mock import MagicMock, patch
from app.pipeline.embedder import embed_texts, get_embedder

def test_embed_texts_empty():
    assert embed_texts([]) == []

@patch("app.pipeline.embedder.SentenceTransformer")
def test_embedder_caching(mock_st):
    # Reset cache for test predictability
    get_embedder.cache_clear()
    
    get_embedder()
    get_embedder()
    
    # Should only be called once due to lru_cache
    assert mock_st.call_count == 1

@patch("app.pipeline.embedder.get_embedder")
def test_embed_texts_logic(mock_get_embedder):
    mock_model = MagicMock()
    # Mocking a 384-dimensional vector
    mock_model.encode.return_value = [[0.1] * 384]
    mock_get_embedder.return_value = mock_model
    
    res = embed_texts(["hello"])
    assert len(res) == 1
    assert len(res[0]) == 384
    mock_model.encode.assert_called_once()
