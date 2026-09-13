from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.rag.retriever import Retriever, ChunkResult

router = APIRouter(prefix="/internal/retrieval", tags=["retrieval"])

class RetrievalRequest(BaseModel):
    query: str
    document_id: str
    top_k: int = 5
    max_distance: Optional[float] = None

class RetrievalResponse(BaseModel):
    results: List[ChunkResult]

@router.post("/search", response_model=RetrievalResponse)
async def search_chunks(request: RetrievalRequest, db: AsyncSession = Depends(get_db)):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        retriever = Retriever(db_session=db)
        results = await retriever.retrieve(
            query=request.query,
            document_id=request.document_id,
            top_k=request.top_k,
            max_distance=request.max_distance
        )
        return RetrievalResponse(results=results)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Retrieval Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve relevant chunks.")