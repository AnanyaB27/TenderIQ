import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ValidationError, SecretStr
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_google_genai import ChatGoogleGenerativeAI

from app.db.session import get_db
from app.matching.models import OrganizationCapabilities
from app.matching.match_service import MatchService, DocumentNotProcessedError

router = APIRouter(prefix="/internal/orgs", tags=["match"])

class MatchRequest(BaseModel):
    document_id: str
    org_profile_text: Optional[str] = None

class MatchResponse(BaseModel):
    documentId: str
    organizationId: str
    matchScore: int
    eligibilityStatus: str
    evidenceCoverage: float
    summary: str
    gaps: List[str]
    recommendations: List[str]
    ruleResults: list  # <--- Added for P0.9: Passes the full evidence/citations to the frontend

@router.post("/{organization_id}/match", response_model=MatchResponse)
async def evaluate_match(organization_id: str, request: MatchRequest, db: AsyncSession = Depends(get_db)):
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Google API key is not configured on the AI Engine.")

    try:
        # 1. Parse unstructured org capabilities into a strict structured model
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.0,
            google_api_key=SecretStr(api_key)
        )
        structured_llm = llm.with_structured_output(OrganizationCapabilities)
        
        capabilities_text = request.org_profile_text or "General technical capabilities."
        
        org_caps: OrganizationCapabilities = await structured_llm.ainvoke(
            f"Extract organization capabilities from the following profile text. "
            f"If numerical values for turnover (in INR Crores) or experience (in years) are found, extract them as floats. "
            f"Extract any certifications or locations as lists of strings. Profile: {capabilities_text}"
        )

        # 2. Run the canonical Match Service (P0.9 Orchestrator)
        match_service = MatchService(db_session=db)
        
        evaluation_result = await match_service.evaluate_tender_fit(
            document_id=request.document_id, 
            org=org_caps
        )

        # 3. Map internal evaluation result back to the expected schema
        gaps = [
            f"[{r.requirement_type.value}] {r.requirement_text} (Reason: {r.reason})" 
            for r in evaluation_result.rule_results if r.status == "FAIL"
        ]
        
        recommendations = [
            f"Clarify or provide evidence for unknown requirement: {r.requirement_text}" 
            for r in evaluation_result.unknown_requirements
        ]

        if not gaps and evaluation_result.match_score > 0:
            recommendations.append("Proceed with bid preparation. No critical eligibility gaps identified.")

        return MatchResponse(
            documentId=request.document_id,
            organizationId=organization_id,
            matchScore=evaluation_result.match_score,
            eligibilityStatus=evaluation_result.eligibility_status.value,
            evidenceCoverage=round(evaluation_result.evidence_coverage_percent, 1),
            summary=evaluation_result.summary,
            gaps=gaps,
            recommendations=recommendations,
            ruleResults=[r.model_dump() for r in evaluation_result.rule_results]
        )
        
    except DocumentNotProcessedError as dnp:
        raise HTTPException(status_code=422, detail=str(dnp))
    except ValidationError as e:
        print(f"Schema Validation Error: {e}")
        raise HTTPException(status_code=502, detail="AI output did not match expected structural schema.")
    except Exception as e:
        print(f"Match Evaluation Error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during match evaluation.")