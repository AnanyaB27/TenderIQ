from fastapi import APIRouter

router = APIRouter(prefix="/internal/tenders", tags=["summary"])


@router.get("/{tender_id}/summary")
async def get_summary(tender_id: str) -> dict[str, str]:
    # Implemented in a later phase (AI_DESIGN.md §6, FR-AI-4).
    return {"tenderId": tender_id, "status": "not_implemented"}
