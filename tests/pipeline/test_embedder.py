import pytest
import numpy as np
from unittest.mock import MagicMock, patch
from app.pipeline.embedder import embed_texts, get_embedder

def test_embed_texts_empty():
    assert embed_texts([]) == []

@patch("app.pipeline.embedder.SentenceTransformer")
@patch("app.pipeline.embedder.settings")
def test_embedder_caching(mock_settings, mock_st):
    # Setup mock settings
    mock_settings.embedding_model = "test-model"
    mock_settings.embedding_device = "cpu"
    mock_settings.embedding_cache_dir = "/tmp/cache"

    # Reset cache for test predictability
    get_embedder.cache_clear()
    
    get_embedder()
    get_embedder()
    
    # Should only be called once due to lru_cache
    assert mock_st.call_count == 1

@patch("app.pipeline.embedder.get_embedder")
def test_embed_texts_logic(mock_get_embedder):
    mock_model = MagicMock()
    # Mocking a 384-dimensional vector as a numpy array
    mock_model.encode.return_value = np.array([[0.1] * 384])
    mock_get_embedder.return_value = mock_model
    
    res = embed_texts(["hello"])
    assert len(res) == 1
    assert len(res[0]) == 384
    assert isinstance(res, list)
    assert isinstance(res[0], list)
    mock_model.encode.assert_called_once()
