import pytest
from app.parsing.pdf_parser import PDFParser
from app.parsing.format_normalizer import FormatNormalizer
import base64

# Minimal valid PDF base64 string for testing without external file dependencies
MINIMAL_PDF_B64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM+PgpzdHJlYW0KcGFnZQplbmRzdHJlYW0KZW5kb2JqCjEgMCBvYmoKPDwvVHlwZSAvUGFnZQovQ29udGVudHMgMiAwIFIKL1BhcmVudCAzIDAgUgo+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMSAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iago1IDAgb2JqCjw8L0NyZWF0b3IgKFRlc3QpPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA1NiAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMTEgMDAwMDAgbiAKMDAwMDAwMDE2NCAwMDAwMCBuIAowMDAwMDAwMjEyIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2Ci9Sb290IDQgMCBSCi9JbmZvIDUgMCBSCj4+CnN0YXJ0eHJlZgoyNTUKJSVFT0YK"

def test_empty_file_parsing():
    with pytest.raises(ValueError, match="EMPTY_FILE"):
        PDFParser.parse_bytes(b"")

def test_malformed_pdf_parsing():
    with pytest.raises(ValueError, match="MALFORMED_PDF"):
        PDFParser.parse_bytes(b"This is not a pdf file")

def test_minimal_valid_pdf_parsing():
    pdf_bytes = base64.b64decode(MINIMAL_PDF_B64)
    pages = PDFParser.parse_bytes(pdf_bytes)
    assert len(pages) == 1
    assert pages[0]["page_number"] == 1
    assert isinstance(pages[0]["text"], str)

def test_format_normalizer():
    dirty_text = "This   is a\n\n\n\ntest.\t\tList:\n- Item 1\n- Item 2"
    clean_text = FormatNormalizer.normalize(dirty_text)
    
    # Should reduce multiple spaces/tabs to single spaces
    assert "This is a" in clean_text
    # Should reduce 4 newlines to 2 newlines (paragraph break)
    assert "a\n\ntest." in clean_text
    # Should preserve single newlines for lists
    assert "List:\n- Item 1\n- Item 2" in clean_text