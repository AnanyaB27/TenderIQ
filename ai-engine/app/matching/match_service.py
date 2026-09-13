import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import SecretStr

from app.rag.retriever import Retriever, ChunkResult
from app.matching.models import (
    OrganizationCapabilities,
    TenderRequirementsExtraction,
    TenderRequirement,
    MatchEvaluationResult,
    EligibilityStatus
)
from app.matching.rule_engine import RuleEngine
from app.matching.match_scorer import MatchScorer
from app.matching.evidence_service import EvidenceService

class DocumentNotProcessedError(Exception):
    pass

class MatchService:
    """
    P0.9 CANONICAL TENDER EVALUATION ORCHESTRATOR
    Strictly verifies processing stages, extracts requirements, applies deterministic rules,
    calculates match score, and binds verifiable citations.
    """
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.retriever = Retriever(db_session)
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing.")
        
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.0, google_api_key=SecretStr(api_key))
        self.structured_llm = self.llm.with_structured_output(TenderRequirementsExtraction)
        
        self.rule_engine = RuleEngine()
        self.scorer = MatchScorer()
        self.evidence_service = EvidenceService()

    async def _verify_pipeline_readiness(self, document_id: str) -> bool:
        """Verifies that extraction, chunking, and pgvector embeddings are completed."""
        query = text("""
            SELECT COUNT(*) FROM tender_document_chunks 
            WHERE document_id = :doc_id AND embedding IS NOT NULL
        """)
        result = await self.db.execute(query, {"doc_id": document_id})
        count = result.scalar()
        return count > 0

    def _assemble_context(self, chunks: list[ChunkResult]) -> str:
        parts = []
        for c in chunks:
            parts.append(f"[CHUNK_ID: {c.chunk_id} | Section: {c.section_heading}]\n{c.text}\n")
        return "\n".join(parts)

    async def evaluate_tender_fit(self, document_id: str, org: OrganizationCapabilities) -> MatchEvaluationResult:
        # 1. Pipeline Verification
        is_ready = await self._verify_pipeline_readiness(document_id)
        if not is_ready:
            raise DocumentNotProcessedError(f"Document '{document_id}' lacks embedded chunks. Extraction and Embedding must be completed first.")

        # 2. Vector Retrieval (P0.5)
        query = "eligibility criteria minimum turnover minimum experience required certifications mandatory registrations geographic location"
        chunks = await self.retriever.retrieve(query=query, document_id=document_id, top_k=8)
        
        if not chunks:
            return MatchEvaluationResult(
                match_score=0, eligibility_status=EligibilityStatus.UNKNOWN, evidence_coverage_percent=0.0,
                rule_results=[], critical_failures=[], unknown_requirements=[],
                summary="Retrieval yielded no contextual chunks. Cannot evaluate eligibility."
            )

        context = self._assemble_context(chunks)

        # 3. RAG / Requirement Extraction (P0.6)
        prompt = ChatPromptTemplate.from_messages([
            ("system", 
             "Extract objective eligibility requirements from the TENDER CONTEXT. "
             "For each requirement, provide the EXACT `source_chunk_ids` (the CHUNK_ID string) that support it. "
             "Also provide a short `exact_excerpt` quoted exactly from that chunk. "
             "Do not invent requirements or chunk IDs.\n\n"
             "--- TENDER CONTEXT ---\n{context}\n--- END TENDER CONTEXT ---"),
            ("human", "Extract the requirements and map their source chunks.")
        ])
        
        chain = prompt | self.structured_llm
        try:
            extraction: TenderRequirementsExtraction = await chain.ainvoke({"context": context})
        except Exception as e:
            raise RuntimeError(f"Failed to extract structured requirements from RAG context: {str(e)}")

        tender_reqs = []
        for idx, ext_req in enumerate(extraction.requirements):
            tender_reqs.append(TenderRequirement(
                id=f"req_{idx}_{uuid.uuid4().hex[:8]}",
                type=ext_req.type, raw_text=ext_req.raw_text,
                value_numeric=ext_req.value_numeric, value_text=ext_req.value_text,
                is_mandatory=ext_req.is_mandatory, source_chunk_ids=ext_req.source_chunk_ids, exact_excerpt=ext_req.exact_excerpt
            ))

        # 4. Deterministic Rule Engine (P0.7)
        rule_results = self.rule_engine.evaluate(tender_reqs, org)
        
        # 5. Evidence Binding & Citation Validation (P0.8)
        bound_rules, coverage = self.evidence_service.bind_rule_evidence(rule_results, tender_reqs, chunks)

        # 6. Match Scoring (P0.7)
        score, status, critical, unknown = self.scorer.calculate(bound_rules)

        summary = (
            f"End-to-End Evaluation Complete. Evaluated {len(bound_rules)} requirements with {coverage:.1f}% verifiable evidence coverage. "
            f"Achieved a deterministic match score of {score}/100. "
            f"Critical Failures: {len(critical)}. Unknown Requirements: {len(unknown)}."
        )

        # 7. Final Output (P0.9)
        return MatchEvaluationResult(
            match_score=score,
            eligibility_status=status,
            evidence_coverage_percent=coverage,
            rule_results=bound_rules,
            critical_failures=critical,
            unknown_requirements=unknown,
            summary=summary
        )