import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.rag.retriever import Retriever

# Mock Database Session to intercept SQLAlchemy execute calls safely
class MockAsyncSession:
    def __init__(self, rows_to_return=None):
        self.rows_to_return = rows_to_return or []
        self.execute_calls = []

    async def execute(self, query, params=None):
        self.execute_calls.append((query, params))
        mock_result = MagicMock()
        mock_result.fetchall.return_value = self.rows_to_return
        return mock_result

# Mock PostgreSQL Row representation
class MockRow:
    def __init__(self, chunk_hash, document_id, text, page_start, page_end, section_heading, sequence_number, char_count, distance):
        self.chunk_hash = chunk_hash
        self.document_id = document_id
        self.text = text
        self.page_start = page_start
        self.page_end = page_end
        self.section_heading = section_heading
        self.sequence_number = sequence_number
        self.char_count = char_count
        self.distance = distance

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_successful_retrieval():
    mock_rows = [
        MockRow("hash1", "doc1", "text1", 1, 1, "Section 1", 1, 100, 0.12),
        MockRow("hash2", "doc1", "text2", 1, 2, "Section 2", 2, 200, 0.25)
    ]
    db = MockAsyncSession(rows_to_return=mock_rows)
    retriever = Retriever(db)
    
    # Mock Gemini embedding output safely
    retriever.embedding_client.embed_batch = AsyncMock(return_value=[[0.1] * 768])
    
    results = await retriever.retrieve("compliance rules", "doc1", top_k=2)
    
    # Verify return parsing
    assert len(results) == 2
    assert results[0].chunk_id == "hash1"
    assert results[0].distance == 0.12
    assert results[0].section_heading == "Section 1"
    
    # Verify strict parameterization injection
    query_called, params_called = db.execute_calls[0]
    assert params_called["document_id"] == "doc1"
    assert params_called["top_k"] == 2
    assert "query_embedding" in params_called
    assert "ORDER BY distance ASC LIMIT :top_k" in str(query_called)

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_empty_query():
    db = MockAsyncSession()
    retriever = Retriever(db)
    results = await retriever.retrieve("   ", "doc1")
    # Must immediately return empty list without database or API calls
    assert results == []
    assert len(db.execute_calls) == 0

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_invalid_top_k():
    db = MockAsyncSession()
    retriever = Retriever(db)
    with pytest.raises(ValueError, match="strictly positive"):
        await retriever.retrieve("query", "doc1", top_k=0)

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_distance_threshold():
    db = MockAsyncSession()
    retriever = Retriever(db)
    retriever.embedding_client.embed_batch = AsyncMock(return_value=[[0.1] * 768])
    
    await retriever.retrieve("test", "doc1", max_distance=0.3)
    
    query_called, params_called = db.execute_calls[0]
    assert "max_distance" in params_called
    assert params_called["max_distance"] == 0.3
    # Check that threshold clause was cleanly appended
    assert "<= :max_distance" in str(query_called)