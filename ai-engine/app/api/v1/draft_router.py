from fastapi import APIRouter

router = APIRouter(prefix="/internal/tenders", tags=["draft"])


@router.post("/{tender_id}/draft")
async def generate_draft(tender_id: str) -> dict[str, str]:
    # Implemented in a later phase (Architecture.md §9.2 Draft Generation Service).
    return {"tenderId": tender_id, "status": "not_implemented"}
