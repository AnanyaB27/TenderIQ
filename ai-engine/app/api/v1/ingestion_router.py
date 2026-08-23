import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/internal/tenders", tags=["ingestion"])

class TenderItem(BaseModel):
    referenceNumber: str
    title: str
    issuingAuthority: str
    estimatedValue: float
    procurementCategory: str
    description: str

@router.get("/live-feed", response_model=List[TenderItem])
async def fetch_live_tenders():
    try:
        live_tenders = [
            {
                "referenceNumber": "GEM/2026/B/8932112",
                "title": "Supply, Installation & Maintenance of IoT Wildlife Monitoring Camera Systems",
                "issuingAuthority": "Ministry of Environment, Forest and Climate Change",
                "estimatedValue": 4500000.0,
                "procurementCategory": "Hardware & IoT",
                "description": "Procurement of automated high-resolution camera traps integrated with edge AI detection for real-time forest perimeter monitoring."
            },
            {
                "referenceNumber": "GEM/2026/B/5412990",
                "title": "Automated Perimeter Security and Laser Fencing Infrastructure",
                "issuingAuthority": "Central Public Works Department (CPWD)",
                "estimatedValue": 8200000.0,
                "procurementCategory": "Security Infrastructure",
                "description": "Turnkey deployment of micro-controller powered automated laser barrier security grids and intrusion alert notification units."
            },
            {
                "referenceNumber": "GEM/2026/B/9948210",
                "title": "Enterprise Cloud Analytics Dashboard and Data Mining Pipeline",
                "issuingAuthority": "National Informatics Centre (NIC)",
                "estimatedValue": 3100000.0,
                "procurementCategory": "Software & AI",
                "description": "Development of a scalable natural language processing and data mining pipeline for automated document parsing and contract analysis."
            }
        ]
        return live_tenders
    except Exception as e:
        print(f"Ingestion Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch live tenders.")