from typing import List, Tuple, Dict
from app.matching.models import RuleEvaluation, TenderRequirement, Citation, CitationValidationStatus
from app.matching.citation_validator import CitationValidator
from app.rag.retriever import ChunkResult

class EvidenceService:
    """
    Binds deterministic rule results to validated database chunks.
    Calculates overall evidence coverage.
    """
    def __init__(self):
        self.validator = CitationValidator()

    def bind_rule_evidence(
        self, 
        rules: List[RuleEvaluation], 
        requirements: List[TenderRequirement], 
        retrieved_chunks: List[ChunkResult]
    ) -> Tuple[List[RuleEvaluation], float]:
        
        chunk_map: Dict[str, ChunkResult] = {c.chunk_id: c for c in retrieved_chunks}
        req_map: Dict[str, TenderRequirement] = {r.id: r for r in requirements}
        
        valid_rules_count = 0
        
        for rule in rules:
            req = req_map.get(rule.rule_id)
            if not req or not req.source_chunk_ids:
                # No evidence suggested
                continue
                
            unique_valid_citations: Dict[str, Citation] = {}
            invalid_citations: List[Citation] = []
            
            for chunk_id in req.source_chunk_ids:
                stored_chunk = chunk_map.get(chunk_id)
                
                # Construct suggested citation using app truth to prevent LLM hallucination
                cit = Citation(
                    chunk_id=chunk_id,
                    document_id=stored_chunk.document_id if stored_chunk else "",
                    page_start=stored_chunk.page_start if stored_chunk else 0,
                    page_end=stored_chunk.page_end if stored_chunk else 0,
                    section_heading=stored_chunk.section_heading if stored_chunk else "",
                    excerpt=req.exact_excerpt or (stored_chunk.text[:200] if stored_chunk else ""),
                    validation_status=CitationValidationStatus.UNAVAILABLE
                )
                
                validated_cit = self.validator.validate(cit, stored_chunk)
                
                if validated_cit.validation_status == CitationValidationStatus.VALID:
                    # Deduplicate deterministically by chunk_id
                    if chunk_id not in unique_valid_citations:
                        unique_valid_citations[chunk_id] = validated_cit
                else:
                    # Retain for diagnostic awareness, but it fails validation
                    invalid_citations.append(validated_cit)
            
            # Attach evidence to rule (Valid deduplicated first, then diagnostics)
            rule.evidence.extend(list(unique_valid_citations.values()))
            rule.evidence.extend(invalid_citations)
            
            # Check if rule has at least one valid supporting evidence chunk
            if any(c.validation_status == CitationValidationStatus.VALID for c in rule.evidence):
                valid_rules_count += 1
                
        coverage = (valid_rules_count / len(rules) * 100) if rules else 0.0
        return rules, coverage
