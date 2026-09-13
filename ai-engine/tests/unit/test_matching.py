import pytest
from app.matching.models import (
    OrganizationCapabilities, TenderRequirement, RequirementType, 
    RuleStatus, EligibilityStatus, ExtractedRequirement, TenderRequirementsExtraction
)
from app.matching.rule_engine import RuleEngine
from app.matching.scorer import MatchScorer
from app.matching.match_service import MatchService
from unittest.mock import AsyncMock, patch

def test_rule_engine_numeric():
    engine = RuleEngine()
    org = OrganizationCapabilities(turnover_cr=8.5, experience_years=2.0)
    
    req_pass = TenderRequirement(id="1", type=RequirementType.MIN_TURNOVER, raw_text="Min 5 Cr", value_numeric=5.0, is_mandatory=True)
    req_fail = TenderRequirement(id="2", type=RequirementType.MIN_EXPERIENCE, raw_text="Min 3 Years", value_numeric=3.0, is_mandatory=True)
    req_unk  = TenderRequirement(id="3", type=RequirementType.MIN_TURNOVER, raw_text="Turnover req", value_numeric=None, is_mandatory=True)
    
    results = engine.evaluate([req_pass, req_fail, req_unk], org)
    
    assert results[0].status == RuleStatus.PASS
    assert results[1].status == RuleStatus.FAIL
    assert results[2].status == RuleStatus.UNKNOWN

def test_rule_engine_missing_org_data():
    engine = RuleEngine()
    org = OrganizationCapabilities() # Empty
    req = TenderRequirement(id="1", type=RequirementType.MIN_TURNOVER, raw_text="Min 5 Cr", value_numeric=5.0, is_mandatory=True)
    
    results = engine.evaluate([req], org)
    assert results[0].status == RuleStatus.UNKNOWN
    assert "Missing" in results[0].reason

def test_rule_engine_certification():
    engine = RuleEngine()
    org = OrganizationCapabilities(certifications=["ISO 9001", "ISO 27001"])
    
    req_pass = TenderRequirement(id="1", type=RequirementType.REQUIRED_CERTIFICATION, raw_text="Need ISO 9001", value_text="iso 9001", is_mandatory=True)
    req_fail = TenderRequirement(id="2", type=RequirementType.REQUIRED_CERTIFICATION, raw_text="Need CMMI", value_text="CMMI", is_mandatory=True)
    
    results = engine.evaluate([req_pass, req_fail], org)
    assert results[0].status == RuleStatus.PASS
    assert results[1].status == RuleStatus.FAIL

def test_match_scorer():
    scorer = MatchScorer()
    
    # Mock some rule evaluations
    from app.matching.models import RuleEvaluation
    pass_rule = RuleEvaluation(rule_id="1", requirement_type=RequirementType.MIN_TURNOVER, status=RuleStatus.PASS, requirement_text="A", organization_value="B", reason="C", is_mandatory=True)
    fail_critical = RuleEvaluation(rule_id="2", requirement_type=RequirementType.MIN_EXPERIENCE, status=RuleStatus.FAIL, requirement_text="A", organization_value="B", reason="C", is_mandatory=True)
    fail_minor = RuleEvaluation(rule_id="3", requirement_type=RequirementType.REQUIRED_CERTIFICATION, status=RuleStatus.FAIL, requirement_text="A", organization_value="B", reason="C", is_mandatory=False)
    unk_rule = RuleEvaluation(rule_id="4", requirement_type=RequirementType.LOCATION_REQUIREMENT, status=RuleStatus.UNKNOWN, requirement_text="A", organization_value="B", reason="C", is_mandatory=True)
    
    # 1. 100% Pass
    score, status, crit, unk = scorer.calculate([pass_rule])
    assert score == 100
    assert status == EligibilityStatus.ELIGIBLE
    
    # 2. Critical Failure Overrides Score
    score, status, crit, unk = scorer.calculate([pass_rule, pass_rule, fail_critical])
    assert score == 66  # 2 passed out of 3 evaluated
    assert status == EligibilityStatus.INELIGIBLE # Critical failure triggered
    assert len(crit) == 1
    
    # 3. Minor Failure Does Not Trigger Ineligible
    score, status, crit, unk = scorer.calculate([pass_rule, fail_minor])
    assert score == 50
    assert status == EligibilityStatus.ELIGIBLE # Actually Eligible since no critical failure
    
    # 4. Unknown drops status to Conditional
    score, status, crit, unk = scorer.calculate([pass_rule, unk_rule])
    assert score == 100 # Unknown excluded from math
    assert status == EligibilityStatus.CONDITIONAL
    assert len(unk) == 1

class MockAsyncSession:
    pass

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_match_service_integration():
    db = MockAsyncSession()
    service = MatchService(db)
    
    # Mock Retriever
    from app.rag.retriever import ChunkResult
    service.retriever.retrieve = AsyncMock(return_value=[
        ChunkResult(chunk_id="c1", document_id="d1", text="Must have ISO 9001.", page_start=1, page_end=1, section_heading="Reqs", sequence_number=1, char_count=50, distance=0.1)
    ])
    
    # Mock LLM Extraction
    mock_extraction = TenderRequirementsExtraction(
        requirements=[
            ExtractedRequirement(type=RequirementType.REQUIRED_CERTIFICATION, raw_text="Must have ISO 9001.", value_text="ISO 9001", is_mandatory=True)
        ]
    )
    with patch('langchain_core.runnables.RunnableSequence.ainvoke', new_callable=AsyncMock) as mock_chain_invoke:
        mock_chain_invoke.return_value = mock_extraction
        
        org = OrganizationCapabilities(certifications=["ISO 9001"])
        result = await service.evaluate_tender_fit("doc_1", org)
        
        assert result.match_score == 100
        assert result.eligibility_status == EligibilityStatus.ELIGIBLE
        assert len(result.rule_results) == 1