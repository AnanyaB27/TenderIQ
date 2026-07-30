from fastapi import APIRouter

router = APIRouter(prefix="/internal/tenders", tags=["qa"])


@router.post("/{tender_id}/qa")
async def ask_question(tender_id: str) -> dict[str, str]:
    # Implemented in a later phase (AI_DESIGN.md §7, §12).
    return {"tenderId": tender_id, "status": "not_implemented"}
