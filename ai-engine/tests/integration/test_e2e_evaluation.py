import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.matching.match_service import MatchService, DocumentNotProcessedError
from app.matching.models import OrganizationCapabilities, EligibilityStatus

# Using local in-memory sqlite mock strictly to verify pipeline orchestration logic
# (pgvector SQL execution itself was tested in test_pgvector_retrieval.py in P0.5)

class MockDbSession:
    def __init__(self, doc_ready=True):
        self.doc_ready = doc_ready
        
    async def execute(self, query, params=None):
        mock_result = MagicMock()
        mock_result.scalar.return_value = 10 if self.doc_ready else 0
        return mock_result

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_e2e_document_not_processed():
    db = MockDbSession(doc_ready=False)
    service = MatchService(db)
    
    with pytest.raises(DocumentNotProcessedError, match="lacks embedded chunks"):
        await service.evaluate_tender_fit("doc_1", OrganizationCapabilities())

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_e2e_successful_pipeline():
    db = MockDbSession(doc_ready=True)
    service = MatchService(db)
    
    # Mocking Retriever to return valid chunks
    from app.rag.retriever import ChunkResult
    service.retriever.retrieve = AsyncMock(return_value=[
        ChunkResult(chunk_id="c1", document_id="doc_1", text="Turnover > 5Cr.", page_start=1, page_end=1, section_heading="Reqs", sequence_number=1, char_count=20, distance=0.1)
    ])
    
    # Mocking LLM extraction to return a structured requirement
    from app.matching.models import TenderRequirementsExtraction, ExtractedRequirement, RequirementType
    mock_extraction = TenderRequirementsExtraction(
        requirements=[
            ExtractedRequirement(type=RequirementType.MIN_TURNOVER, raw_text="Turnover > 5Cr", value_numeric=5.0, is_mandatory=True, source_chunk_ids=["c1"], exact_excerpt="Turnover > 5Cr.")
        ]
    )
    
    with patch('langchain_core.runnables.RunnableSequence.ainvoke', new_callable=AsyncMock) as mock_chain:
        mock_chain.return_value = mock_extraction
        
        # Pass a highly qualified org
        org = OrganizationCapabilities(turnover_cr=15.0)
        
        # Execute CANONICAL PIPELINE
        result = await service.evaluate_tender_fit("doc_1", org)
        
        # Verifications
        assert result.match_score == 100
        assert result.eligibility_status == EligibilityStatus.ELIGIBLE
        assert result.evidence_coverage_percent == 100.0
        assert len(result.rule_results) == 1
        assert result.rule_results[0].status == "PASS"
        assert len(result.rule_results[0].evidence) == 1
        assert result.rule_results[0].evidence[0].validation_status == "VALID"
        assert result.rule_results[0].evidence[0].chunk_id == "c1"

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_e2e_mandatory_failure():
    db = MockDbSession(doc_ready=True)
    service = MatchService(db)
    
    from app.rag.retriever import ChunkResult
    service.retriever.retrieve = AsyncMock(return_value=[
        ChunkResult(chunk_id="c1", document_id="doc_1", text="ISO 9001 Mandatory.", page_start=1, page_end=1, section_heading="Reqs", sequence_number=1, char_count=20, distance=0.1)
    ])
    
    from app.matching.models import TenderRequirementsExtraction, ExtractedRequirement, RequirementType
    mock_extraction = TenderRequirementsExtraction(
        requirements=[
            ExtractedRequirement(type=RequirementType.REQUIRED_CERTIFICATION, raw_text="ISO 9001 Mandatory", value_text="ISO 9001", is_mandatory=True, source_chunk_ids=["c1"], exact_excerpt="ISO 9001 Mandatory.")
        ]
    )
    
    with patch('langchain_core.runnables.RunnableSequence.ainvoke', new_callable=AsyncMock) as mock_chain:
        mock_chain.return_value = mock_extraction
        
        # Pass an unqualified org
        org = OrganizationCapabilities(certifications=[])
        
        # Execute CANONICAL PIPELINE
        result = await service.evaluate_tender_fit("doc_1", org)
        
        assert result.match_score == 0
        assert result.eligibility_status == EligibilityStatus.INELIGIBLE
        assert len(result.critical_failures) == 1
        assert result.rule_results[0].status == "FAIL"