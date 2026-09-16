from fastapi import APIRouter
from typing import List
from app.ingestion.connectors.cppp_connector import CPPPConnector
from app.ingestion.connectors.base_connector import NormalizedTender

router = APIRouter(prefix="/internal/tenders", tags=["ingestion"])

@router.get("/live-feed", response_model=List[NormalizedTender])
async def get_live_feed():
    connector = CPPPConnector()
    # Fetch real live data, normalized to the TenderIQ schema
    tenders = await connector.fetch_tenders(limit=25)
    return tenders