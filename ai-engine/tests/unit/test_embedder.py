import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.embeddings.tender_embedder import TenderEmbedder
from app.embeddings.embedding_client import EmbeddingClient

# Mock DB Session
class MockAsyncSession:
    def __init__(self, existing_hashes=None):
        self.existing_hashes = existing_hashes or []
        self.execute_calls = []
        self.commit_called = False
        self.rollback_called = False

    async def execute(self, query, params=None):
        self.execute_calls.append((query, params))
        mock_result = MagicMock()
        mock_result.fetchall.return_value = [(h,) for h in self.existing_hashes]
        return mock_result

    async def commit(self):
        self.commit_called = True

    async def rollback(self):
        self.rollback_called = True

@pytest.fixture
def mock_pages():
    return [{"page_number": 1, "text": "Requirement 1. Requirement 2."}]

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_successful_batch_embedding(mock_pages):
    db = MockAsyncSession()
    embedder = TenderEmbedder(db)
    
    # Mock the external embedding API
    embedder.embedding_client.embeddings.aembed_documents = AsyncMock(
        return_value=[[0.1] * 768] # Returns exactly 1 mock vector of 768 dimensions
    )

    persisted = await embedder.process_and_store_document("doc_1", mock_pages)
    
    assert persisted == 1
    assert db.commit_called is True
    assert len(db.execute_calls) == 2 # 1 for Select, 1 for Insert

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_idempotent_skips_existing():
    # Provide the exact chunk_id that SemanticChunker will deterministically generate
    # For testing, we mock the chunker output to predictably match the existing hash
    db = MockAsyncSession(existing_hashes=["hash_123"])
    embedder = TenderEmbedder(db)
    
    embedder.chunker.chunk_document = MagicMock(return_value=[{
        "chunk_id": "hash_123",
        "document_id": "doc_1",
        "sequence": 1,
        "text": "test",
        "page_start": 1, "page_end": 1, "section": "1", "char_count": 4
    }])

    persisted = await embedder.process_and_store_document("doc_1", [{"page_number": 1, "text": "test"}])
    
    # Should short-circuit and return 0 because hash_123 already exists
    assert persisted == 0
    assert db.commit_called is False

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_dimension_mismatch_fails(mock_pages):
    db = MockAsyncSession()
    embedder = TenderEmbedder(db)
    
    # Mock an API returning the wrong dimension (e.g., 512 instead of 768)
    embedder.embedding_client.embeddings.aembed_documents = AsyncMock(
        return_value=[[0.1] * 512] 
    )

    with pytest.raises(ValueError, match="Dimension mismatch"):
        await embedder.process_and_store_document("doc_1", mock_pages)

def test_missing_api_key():
    with patch.dict('os.environ', clear=True):
        with pytest.raises(ValueError, match="GOOGLE_API_KEY is missing"):
            EmbeddingClient()