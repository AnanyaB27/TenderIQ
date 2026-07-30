from pydantic import BaseModel


class EligibilityCriterion(BaseModel):
    """One extracted eligibility clause (AI_DESIGN.md §8 canonical schema)."""

    model_config = {"extra": "forbid"}

    criterion_text: str
    category: str
    source_page_number: int | None = None
    source_clause_excerpt: str | None = None
    confidence: float = 0.0


class TenderExtraction(BaseModel):
    """Canonical extraction output shape (AI_DESIGN.md §8)."""

    model_config = {"extra": "forbid"}

    title: str
    issuing_authority: str | None = None
    tender_value_amount: float | None = None
    emd_amount: float | None = None
    submission_deadline_at: str | None = None
    opening_at: str | None = None
    location_state: str | None = None
    location_city: str | None = None
    eligibility_criteria: list[EligibilityCriterion] = []
    required_documents: list[str] = []
    category_tags: list[str] = []
