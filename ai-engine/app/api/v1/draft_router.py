from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db_session
from app.drafting.drafting_service import DraftingService

router = APIRouter(prefix="/internal/drafts", tags=["drafting"])

class DraftRequest(BaseModel):
    document_id: str
    draft_type: str
    org_profile_text: str
    evaluation_summary: Optional[str] = "Not provided"

@router.post("/generate")
async def generate_draft(req: DraftRequest, db: AsyncSession = Depends(get_db_session)):
    service = DraftingService(db)
    return await service.generate_draft(
        document_id=req.document_id,
        draft_type=req.draft_type,
        org_profile_text=req.org_profile_text,
        evaluation_summary=req.evaluation_summary
    )