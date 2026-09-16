from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.extraction.pipeline_service import DocumentPipelineService

router = APIRouter(prefix="/internal/documents", tags=["documents"])

@router.post("/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    document_id: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    try:
        pipeline = DocumentPipelineService(db)
        result = await pipeline.process_document(document_id, file_bytes)

        if result["status"] == "EMBEDDING_FAILED":
            raise HTTPException(status_code=502, detail="Failed to generate embeddings from AI provider.")

        return {
            "status": result["status"],
            "extracted_text": result.get("extracted_text"),
            "page_count": result.get("page_count")
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")