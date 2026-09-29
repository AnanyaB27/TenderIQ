import io
from pypdf import PdfReader
from pypdf.errors import PdfReadError

class PDFParser:
    @staticmethod
    def parse_bytes(file_bytes: bytes) -> list[dict]:
        """
        Extracts text from a PDF while preserving page boundaries.
        Returns a list of dicts: [{"page_number": int, "text": str}]
        """
        if not file_bytes:
            raise ValueError("EMPTY_FILE")

        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)

            if reader.is_encrypted:
                raise ValueError("ENCRYPTED_PDF")

            pages = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages.append({
                    "page_number": i + 1,
                    "text": text
                })

            return pages

        except PdfReadError:
            raise ValueError("MALFORMED_PDF")
        except Exception as e:
            if "ENCRYPTED" in str(e).upper():
                raise ValueError("ENCRYPTED_PDF")
            raise ValueError(f"PARSING_ERROR: {str(e)}")
