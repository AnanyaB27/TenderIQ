import pytest
from app.matching.models import Citation, CitationValidationStatus, RuleEvaluation, RequirementType, RuleStatus, TenderRequirement
from app.matching.citation_validator import CitationValidator
from app.matching.evidence_service import EvidenceService
from app.rag.retriever import ChunkResult

def test_citation_validator_valid():
    validator = CitationValidator()
    stored_chunk = ChunkResult(chunk_id="c1", document_id="d1", text="The turnover must be $5M.", page_start=1, page_end=1, section_heading="Reqs", sequence_number=1, char_count=50, distance=0.1)
    
    citation = Citation(chunk_id="c1", document_id="d1", page_start=1, page_end=1, section_heading="Reqs", excerpt="turnover must be $5M", validation_status=CitationValidationStatus.UNAVAILABLE)
    
    result = validator.validate(citation, stored_chunk)
    assert result.validation_status == CitationValidationStatus.VALID

def test_citation_validator_invalid_cross_document():
    validator = CitationValidator()
    stored_chunk = ChunkResult(chunk_id="c1", document_id="d1", text="The turnover must be $5M.", page_start=1, page_end=1, section_heading="Reqs", sequence_number=1, char_count=50, distance=0.1)
    
    # Citation attempts to claim document d2
    citation = Citation(chunk_id="c1", document_id="d2", page_start=1, page_end=1, section_heading="Reqs", excerpt="turnover", validation_status=CitationValidationStatus.UNAVAILABLE)
    
    result = validator.validate(citation, stored_chunk)
    assert result.validation_status == CitationValidationStatus.INVALID
    assert "Cross-document" in result.validation_reason

def test_citation_validator_invalid_excerpt():
    validator = CitationValidator()
    stored_chunk = ChunkResult(chunk_id="c1", document_id="d1", text="The turnover must be $5M.", page_start=1, page_end=1, section_heading="Reqs", sequence_number=1, char_count=50, distance=0.1)
    
    # Excerpt hallucinated by LLM
    citation = Citation(chunk_id="c1", document_id="d1", page_start=1, page_end=1, section_heading="Reqs", excerpt="turnover must be $10M", validation_status=CitationValidationStatus.UNAVAILABLE)
    
    result = validator.validate(citation, stored_chunk)
    assert result.validation_status == CitationValidationStatus.INVALID
    assert "Excerpt not found" in result.validation_reason

def test_evidence_service_binding_and_coverage():
    service = EvidenceService()
    
    # 2 Retrieved Chunks
    chunks = [
        ChunkResult(chunk_id="c1", document_id="d1", text="ISO 9001 required.", page_start=1, page_end=1, section_heading="Cert", sequence_number=1, char_count=20, distance=0.1),
        ChunkResult(chunk_id="c2", document_id="d1", text="5 years experience.", page_start=2, page_end=2, section_heading="Exp", sequence_number=2, char_count=20, distance=0.1)
    ]
    
    # 2 Extracted Requirements
    req1 = TenderRequirement(id="req1", type=RequirementType.REQUIRED_CERTIFICATION, raw_text="ISO", is_mandatory=True, source_chunk_ids=["c1"], exact_excerpt="ISO 9001 required.")
    req2 = TenderRequirement(id="req2", type=RequirementType.MIN_EXPERIENCE, raw_text="5 years", is_mandatory=True, source_chunk_ids=["fake_chunk"], exact_excerpt="5 years experience.")
    
    # 2 Rule Evaluations
    rules = [
        RuleEvaluation(rule_id="req1", requirement_type=RequirementType.REQUIRED_CERTIFICATION, status=RuleStatus.PASS, requirement_text="ISO", organization_value="ISO", reason="Passed", is_mandatory=True),
        RuleEvaluation(rule_id="req2", requirement_type=RequirementType.MIN_EXPERIENCE, status=RuleStatus.FAIL, requirement_text="5 years", organization_value="2", reason="Failed", is_mandatory=True)
    ]
    
    bound_rules, coverage = service.bind_rule_evidence(rules, [req1, req2], chunks)
    
    # Rule 1 should have 1 VALID citation
    assert len(bound_rules[0].evidence) == 1
    assert bound_rules[0].evidence[0].validation_status == CitationValidationStatus.VALID
    
    # Rule 2 should have 1 INVALID citation (hallucinated chunk ID)
    assert len(bound_rules[1].evidence) == 1
    assert bound_rules[1].evidence[0].validation_status == CitationValidationStatus.INVALID
    
    # Coverage should be 50% (1 out of 2 rules have valid evidence)
    assert coverage == 50.0