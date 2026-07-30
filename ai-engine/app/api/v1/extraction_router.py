from fastapi import APIRouter

router = APIRouter(prefix="/internal/tenders", tags=["extraction"])


@router.post("/{tender_id}/extract")
async def extract_tender(tender_id: str) -> dict[str, str]:
    # Implemented in a later phase (AI_DESIGN.md §8, Architecture.md §9.3).
    return {"tenderId": tender_id, "status": "not_implemented"}
