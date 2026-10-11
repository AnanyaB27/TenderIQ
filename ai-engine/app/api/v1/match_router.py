import logging
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

# Import your database session dependency (ensure this path is correct for your project)
from app.db.session import get_session
from app.matching.match_service import MatchService, DocumentNotProcessedError

logger = logging.getLogger(__name__)

router = APIRouter()

# Inject the DB session into the MatchService
def get_match_service(db: AsyncSession = Depends(get_session)):
    return MatchService(db=db)

@router.post("/{org_id}/match")
@router.post("/internal/orgs/{org_id}/match")
async def evaluate_tender_match(
    org_id: str, 
    request: Request,
    service: MatchService = Depends(get_match_service)
):
    try:
        payload = await request.json()
        document_id = payload.get("document_id")
        org_profile_text = payload.get("org_profile_text", "")
        
        if not document_id:
            return JSONResponse(status_code=400, content={"detail": "document_id is required"})
        
        # Execute the real evaluation
        result = await service.evaluate_tender(
            document_id=document_id, 
            org_profile_text=org_profile_text
        )
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Match Router Error: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})