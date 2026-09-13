import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.rag.rag_service import RagService, LlmStructuredOutput
from app.rag.retriever import ChunkResult

# Mock the database session entirely
class MockAsyncSession:
    pass

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_zero_retrieved_chunks():
    db = MockAsyncSession()
    rag_service = RagService(db)
    
    # Mock Retriever returning 0 chunks
    rag_service.retriever.retrieve = AsyncMock(return_value=[])
    
    # Spy on LLM chain to ensure it is NEVER called
    rag_service.structured_llm.ainvoke = AsyncMock()

    response = await rag_service.answer("What is the turnover?", "doc_1")
    
    # Verify short-circuit behavior
    assert response.insufficient_context is True
    assert response.grounded is False
    assert len(response.sources) == 0
    assert "do not contain enough information" in response.answer
    rag_service.structured_llm.ainvoke.assert_not_called()

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_successful_rag_generation():
    db = MockAsyncSession()
    rag_service = RagService(db)
    
    # 1. Mock Retriever returning valid chunks
    mock_chunks = [
        ChunkResult(
            chunk_id="hash1", document_id="doc_1", text="Min turnover is $5M.", 
            page_start=2, page_end=2, section_heading="Financials", 
            sequence_number=1, char_count=20, distance=0.1
        )
    ]
    rag_service.retriever.retrieve = AsyncMock(return_value=mock_chunks)
    
    # 2. Mock Gemini Structured Output
    mock_llm_response = LlmStructuredOutput(
        answer="The minimum turnover requirement is $5M.",
        is_grounded=True,
        insufficient_context=False
    )
    # The actual execution calls .ainvoke on the chained runnable
    # We patch ainvoke on structured_llm directly. In a real RunnableSequence we'd mock the sequence, 
    # but since we redefine `chain = prompt | self.structured_llm`, mocking `structured_llm.ainvoke` is sufficient here for the unit test abstraction if patched carefully, 
    # OR we can mock the exact chain invocation. We'll mock the internal call.
    with patch('langchain_core.runnables.RunnableSequence.ainvoke', new_callable=AsyncMock) as mock_chain_invoke:
        mock_chain_invoke.return_value = mock_llm_response
        
        response = await rag_service.answer("What is the turnover?", "doc_1")
        
        # 3. Verify mappings and logic
        assert response.answer == "The minimum turnover requirement is $5M."
        assert response.grounded is True
        assert response.insufficient_context is False
        assert len(response.sources) == 1
        assert response.sources[0].chunk_id == "hash1"
        assert response.sources[0].page_start == 2
        
        # Verify context assembly structure inside the call
        call_args = mock_chain_invoke.call_args[0][0]
        assert "Min turnover is $5M" in call_args["context"]
        assert "USER QUERY" in call_args["query"] or call_args["query"] == "What is the turnover?"

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_empty_query_validation():
    db = MockAsyncSession()
    rag_service = RagService(db)
    with pytest.raises(ValueError, match="Query cannot be empty"):
        await rag_service.answer("   ", "doc_1")