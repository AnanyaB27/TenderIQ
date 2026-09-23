from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class RequirementType(str, Enum):
    MIN_TURNOVER = "MIN_TURNOVER"
    MIN_EXPERIENCE = "MIN_EXPERIENCE"
    REQUIRED_CERTIFICATION = "REQUIRED_CERTIFICATION"
    LOCATION_REQUIREMENT = "LOCATION_REQUIREMENT"
    OTHER = "OTHER"
    UNKNOWN = "UNKNOWN"

class GoldRequirement(BaseModel):
    id: str = Field(..., description="Unique identifier for the annotated requirement")
    requirement_text: str = Field(..., description="The verbatim or summarized requirement from the tender")
    requirement_type: RequirementType = Field(..., description="Categorical type matching the RuleEngine")
    expected_normalized_value: Optional[str] = Field(None, description="The expected normalized value (e.g., '10.5' for 10.5 Cr)")
    is_mandatory: bool = Field(..., description="Whether this is a mandatory pass/fail requirement")
    expected_source_page: Optional[int] = Field(None, description="Expected page number containing the evidence")
    expected_source_excerpt: Optional[str] = Field(None, description="Expected exact text excerpt supporting the requirement")
    expected_relevant_chunk_ids: List[str] = Field(default_factory=list, description="List of chunk hashes/IDs that should be retrieved")

class GoldDocument(BaseModel):
    document_id: str = Field(..., description="Must match the UUID of the TenderDocumentEntity")
    tender_source: str = Field(..., description="Source portal (e.g., 'CPPP')")
    requirements: List[GoldRequirement] = Field(..., description="List of manually verified requirements")

class GoldDataset(BaseModel):
    version: str = Field(..., description="Semantic version of this dataset (e.g., '1.0.0')")
    description: str = Field(..., description="Notes about dataset composition")
    documents: List[GoldDocument] = Field(..., description="The collection of annotated documents")
