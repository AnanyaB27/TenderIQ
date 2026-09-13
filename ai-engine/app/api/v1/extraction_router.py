from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.parsing.pdf_parser import PDFParser
from app.parsing.format_normalizer import FormatNormalizer

router = APIRouter(prefix="/internal/documents", tags=["extraction"])

class PageContent(BaseModel):
    page_number: int
    text: str

class ExtractionResponse(BaseModel):
    filename: str
    page_count: int
    pages: List[PageContent]
    extracted_text: str  # Kept temporarily for frontend backward compatibility
    status: str

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

@router.post("/extract-text", response_model=ExtractionResponse)
async def extract_text(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Unsupported file type. Only PDF is allowed.")

    file_bytes = await file.read()
    
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 15MB.")

    try:
        raw_pages = PDFParser.parse_bytes(file_bytes)
        
        normalized_pages = []
        full_text_parts = []
        
        for p in raw_pages:
            cleaned_text = FormatNormalizer.normalize(p["text"])
            normalized_pages.append(PageContent(page_number=p["page_number"], text=cleaned_text))
            if cleaned_text:
                full_text_parts.append(cleaned_text)

        full_text = "\n\n".join(full_text_parts).strip()
        status = "SUCCESS" if full_text else "NO_EXTRACTABLE_TEXT"

        return ExtractionResponse(
            filename=file.filename,
            page_count=len(normalized_pages),
            pages=normalized_pages,
            extracted_text=full_text,
            status=status
        )

    except ValueError as e:
        err_msg = str(e)
        if "ENCRYPTED_PDF" in err_msg:
            raise HTTPException(status_code=400, detail="Cannot parse encrypted or password-protected PDFs.")
        elif "MALFORMED_PDF" in err_msg:
            raise HTTPException(status_code=400, detail="The PDF file is corrupted or malformed.")
        else:
            raise HTTPException(status_code=500, detail="An unexpected error occurred during PDF parsing.")