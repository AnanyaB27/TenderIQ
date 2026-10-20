import io
import os
import pytesseract
from PIL import Image
import fitz  # PyMuPDF

class OcrPipeline:
    """Rasterization, OCR engine call, cleanup, confidence scoring."""
    
    def __init__(self):
        # Point directly to the standard Windows Tesseract installation path
        # For Docker/Linux, this defaults to 'tesseract' in the system PATH
        if os.name == 'nt':
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    def extract_text_from_pdf_bytes(self, file_bytes: bytes) -> list:
        """
        Renders a scanned PDF to images and extracts text using Tesseract OCR.
        Returns a list of dictionaries matching the pypdf extraction format.
        """
        extracted_pages = []
        
        try:
            # Load PDF from memory bytes using PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Render page to an image (matrix zoom increases resolution for better OCR)
                zoom = 2.0
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                
                # Convert raw pixels to a Pillow Image
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                
                # Run OCR on the image
                ocr_text = pytesseract.image_to_string(img, lang="eng")
                
                extracted_pages.append({
                    "page_num": page_num + 1,
                    "text": ocr_text.strip()
                })
                
            doc.close()
            return extracted_pages
            
        except Exception as e:
            raise RuntimeError(f"OCR Pipeline failed: {str(e)}")