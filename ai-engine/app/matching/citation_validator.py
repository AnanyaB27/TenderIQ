from typing import Optional
from app.matching.models import Citation, CitationValidationStatus
from app.rag.retriever import ChunkResult

class CitationValidator:
    """
    Validates that a suggested citation strictly aligns with authoritative database evidence.
    Prevents cross-document leakage and LLM metadata hallucination.
    """
    def validate(self, citation: Citation, stored_chunk: Optional[ChunkResult]) -> Citation:
        if not stored_chunk:
            citation.validation_status = CitationValidationStatus.INVALID
            citation.validation_reason = "Chunk ID not found in retrieved context."
            return citation

        if citation.chunk_id != stored_chunk.chunk_id:
            citation.validation_status = CitationValidationStatus.INVALID
            citation.validation_reason = "Chunk ID mismatch."
            return citation

        if citation.document_id != stored_chunk.document_id:
            citation.validation_status = CitationValidationStatus.INVALID
            citation.validation_reason = "Cross-document citation rejected."
            return citation

        if citation.page_start != stored_chunk.page_start or citation.page_end != stored_chunk.page_end:
            citation.validation_status = CitationValidationStatus.INVALID
            citation.validation_reason = "Page metadata mismatch."
            return citation

        if citation.section_heading != stored_chunk.section_heading:
            citation.validation_status = CitationValidationStatus.INVALID
            citation.validation_reason = "Section heading mismatch."
            return citation

        if citation.excerpt and citation.excerpt not in stored_chunk.text:
            citation.validation_status = CitationValidationStatus.INVALID
            citation.validation_reason = "Cited excerpt not found exactly in source chunk text."
            return citation

        citation.validation_status = CitationValidationStatus.VALID
        citation.validation_reason = "Verified against authoritative source chunk."
        return citation