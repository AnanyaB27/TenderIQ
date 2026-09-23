from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class NormalizedTender(BaseModel):
    referenceNumber: str
    title: str
    description: Optional[str] = None
    issuingAuthority: str
    procurementCategory: Optional[str] = "General"
    estimatedValue: Optional[float] = None
    publishedAt: Optional[datetime] = None
    submissionDeadline: Optional[datetime] = None
    source: str
    sourceUrl: str

class TenderSourceConnector(ABC):
    @property
    @abstractmethod
    def source_name(self) -> str:
        pass

    @abstractmethod
    async def fetch_tenders(self, limit: int = 50) -> List[NormalizedTender]:
        """Fetches, parses, and normalizes raw tender data from the external source."""
        pass
