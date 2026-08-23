from fastapi import APIRouter, UploadFile, File, HTTPException
import pypdf
import io

router = APIRouter(prefix="/internal/documents", tags=["extraction"])

@router.post("/extract-text")
async def extract_text_from_pdf(file: UploadFile = File(...)):
    """
    Parses an uploaded PDF file (like an enterprise profile, resume, or technical spec)
    and extracts its raw text content for the AI pipeline.
    """
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        reader = pypdf.PdfReader(pdf_file)
        
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
                
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF. Ensure it's not a scanned image.")
            
        return {
            "filename": file.filename,
            "extractedText": extracted_text.strip()
        }
    except Exception as e:
        print(f"Extraction Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")