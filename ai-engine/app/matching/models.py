from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class RequirementType(str, Enum):
    MIN_TURNOVER = "MIN_TURNOVER"
    MIN_EXPERIENCE = "MIN_EXPERIENCE"
    REQUIRED_CERTIFICATION = "REQUIRED_CERTIFICATION"
    LOCATION_REQUIREMENT = "LOCATION_REQUIREMENT"
    OTHER = "OTHER"

class RuleStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    UNKNOWN = "UNKNOWN"

class EligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    INELIGIBLE = "INELIGIBLE"
    CONDITIONAL = "CONDITIONAL"
    UNKNOWN = "UNKNOWN"

class CitationValidationStatus(str, Enum):
    VALID = "VALID"
    INVALID = "INVALID"
    UNAVAILABLE = "UNAVAILABLE"

class Citation(BaseModel):
    chunk_id: str
    document_id: str
    page_start: int
    page_end: int
    section_heading: Optional[str]
    excerpt: str
    validation_status: CitationValidationStatus
    validation_reason: Optional[str] = None

class OrganizationCapabilities(BaseModel):
    turnover_cr: Optional[float] = Field(default=None, description="Annual turnover in INR Crores")
    experience_years: Optional[float] = Field(default=None, description="Years of active experience")
    certifications: List[str] = Field(default_factory=list, description="List of held certifications")
    locations: List[str] = Field(default_factory=list, description="List of states/regions where the org is registered")

class ExtractedRequirement(BaseModel):
    type: RequirementType = Field(description="The category of the requirement.")
    raw_text: str = Field(description="The exact text from the tender describing the requirement.")
    value_numeric: Optional[float] = Field(default=None, description="The parsed numeric threshold.")
    value_text: Optional[str] = Field(default=None, description="The target text value.")
    is_mandatory: bool = Field(default=True, description="Whether the requirement is explicitly mandatory.")
    source_chunk_ids: List[str] = Field(default_factory=list, description="The EXACT chunk IDs from the context supporting this.")
    exact_excerpt: Optional[str] = Field(default=None, description="A short, exact substring quoted directly from the source chunk.")

class TenderRequirementsExtraction(BaseModel):
    requirements: List[ExtractedRequirement]

class TenderRequirement(ExtractedRequirement):
    id: str

class RuleEvaluation(BaseModel):
    rule_id: str
    requirement_type: RequirementType
    status: RuleStatus
    requirement_text: str
    organization_value: str
    reason: str
    is_mandatory: bool
    evidence: List[Citation] = Field(default_factory=list)

class MatchEvaluationResult(BaseModel):
    match_score: int
    eligibility_status: EligibilityStatus
    evidence_coverage_percent: float
    rule_results: List[RuleEvaluation]
    critical_failures: List[RuleEvaluation]
    unknown_requirements: List[RuleEvaluation]
    summary: str