from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.extraction.pipeline_service import DocumentPipelineService
import traceback

router = APIRouter(
    prefix="/internal/documents",
    tags=["documents"],
)


@router.post("/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    document_id: str = Form(...),
    db: AsyncSession = Depends(get_session),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty file uploaded.",
        )

    try:
        pipeline = DocumentPipelineService(db)

        result = await pipeline.process_document(
            document_id,
            file_bytes,
        )

        if result["status"] == "EMBEDDING_FAILED":
            raise HTTPException(
                status_code=502,
                detail="Failed to generate embeddings from AI provider.",
            )

        return {
            "status": result["status"],
            "extracted_text": result.get("extracted_text"),
            "page_count": result.get("page_count"),
        }

    except HTTPException:
        await db.rollback()
        raise

    except Exception as e:
        await db.rollback()

        # Print the actual exception type and full traceback.
        print("\n" + "=" * 80)
        print("DOCUMENT PIPELINE EXCEPTION")
        print("=" * 80)
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception repr: {repr(e)}")
        print(f"Exception string: {str(e)}")
        traceback.print_exc()
        print("=" * 80 + "\n")

        raise HTTPException(
            status_code=500,
            detail=(
                f"Pipeline processing failed: "
                f"{type(e).__name__}: {repr(e)}"
            ),
        )