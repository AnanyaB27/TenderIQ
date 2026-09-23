import logging
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from app.matching.match_service import MatchService, DocumentNotProcessedError

logger = logging.getLogger(__name__)

router = APIRouter()

def get_match_service():
    return MatchService()

@router.post("/{org_id}/match")
@router.post("/internal/orgs/{org_id}/match")
async def evaluate_tender_match(
    org_id: str, 
    request: Request,
    service: MatchService = Depends(get_match_service)
):
    try:
        payload = await request.json()
        document_id = payload.get("document_id", "demo-doc-id")
        org_profile_text = payload.get("org_profile_text", "")
        
        # Call the service to get the raw dictionary
        result = await service.evaluate_tender(
            document_id=document_id, 
            org_profile_text=org_profile_text
        )
        
        # Return a direct JSONResponse to bypass strict Pydantic model validation entirely
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Match Router Error: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})