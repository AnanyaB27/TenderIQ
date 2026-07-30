from fastapi import APIRouter

router = APIRouter(prefix="/internal/orgs", tags=["match"])


@router.post("/{organization_id}/match")
async def recompute_match(organization_id: str) -> dict[str, str]:
    # Implemented in a later phase (AI_DESIGN.md §9, FR-AI-2).
    return {"organizationId": organization_id, "status": "not_implemented"}
