import os
from dotenv import load_dotenv

# Load environment variables from the .env file before initializing the app or routers
load_dotenv()

from fastapi import FastAPI

from app.api.v1 import (
    draft_router,
    extraction_router,
    health_router,
    match_router,
    qa_router,
    summary_router,
    ingestion_router,
)

# Internal-only service (Architecture.md §8.3) — no public CORS origins,
# never exposed to the internet under any configuration.
app = FastAPI(
    title="TenderIQ AI Engine",
    description="Internal contract — see docs/architecture/Architecture.md §9.3.",
    version="1.0.0",
)

app.include_router(health_router.router)
app.include_router(extraction_router.router)
app.include_router(summary_router.router)
app.include_router(qa_router.router)
app.include_router(match_router.router)
app.include_router(draft_router.router)
app.include_router(ingestion_router.router)