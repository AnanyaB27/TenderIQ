from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.rag.rag_service import RagService, RagAnswerResponse

router = APIRouter(prefix="/internal/rag", tags=["rag"])

class RagRequest(BaseModel):
    query: str
    document_id: str
    top_k: int = 5

@router.post("/answer", response_model=RagAnswerResponse)
async def get_rag_answer(request: RagRequest, db: AsyncSession = Depends(get_db)):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        rag_service = RagService(db_session=db)
        response = await rag_service.answer(
            query=request.query,
            document_id=request.document_id,
            top_k=request.top_k
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=502, detail=str(re))
    except Exception as e:
        print(f"RAG Error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during answer generation.")