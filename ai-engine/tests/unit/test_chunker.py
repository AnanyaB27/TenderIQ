import pytest
from app.chunking.chunker import SemanticChunker

def test_empty_document():
    chunker = SemanticChunker()
    assert chunker.chunk_document("doc_123", []) == []

def test_heading_detection():
    chunker = SemanticChunker()
    assert chunker.is_heading("SECTION 1. INSTRUCTIONS") is True
    assert chunker.is_heading("1.2 Technical Criteria") is True
    assert chunker.is_heading("MANDATORY REQUIREMENTS") is True
    assert chunker.is_heading("This is just a normal sentence in a paragraph.") is False

def test_standard_chunking_with_metadata():
    chunker = SemanticChunker(chunk_size=100, chunk_overlap=20)
    pages = [
        {"page_number": 1, "text": "SECTION 1\n\nThis is the first paragraph.\n\nThis is the second paragraph which is a bit longer to force a split."},
        {"page_number": 2, "text": "SECTION 2\n\nThis is on page two."}
    ]
    
    chunks = chunker.chunk_document("doc_123", pages)
    
    # Assertions
    assert len(chunks) > 1
    assert chunks[0]["sequence"] == 1
    assert chunks[0]["page_start"] == 1
    assert chunks[0]["section"] == "SECTION 1"
    
    # Check that sequence increments and page numbers track correctly
    assert chunks[-1]["sequence"] == len(chunks)
    assert chunks[-1]["page_start"] == 2
    assert chunks[-1]["page_end"] == 2
    assert chunks[-1]["section"] == "SECTION 2"

def test_oversized_section_splitting():
    chunker = SemanticChunker(chunk_size=50, chunk_overlap=10)
    long_para = "A" * 150
    pages = [{"page_number": 1, "text": f"HEADING\n\n{long_para}"}]
    
    chunks = chunker.chunk_document("doc_1", pages)
    
    # A 150 char paragraph with a 50 char limit should split into multiple chunks
    assert len(chunks) >= 3
    # Check overlap (chunks should share text at boundaries)
    assert chunks[1]["text"].startswith("A")
    assert chunks[0]["section"] == "HEADING"
    assert chunks[1]["section"] == "HEADING"

def test_content_preservation():
    chunker = SemanticChunker(chunk_size=200, chunk_overlap=50)
    pages = [
        {"page_number": 1, "text": "Financial Requirements\n\nTurnover: $10M\n\nMust have ISO 9001."}
    ]
    chunks = chunker.chunk_document("doc_1", pages)
    
    combined_text = "".join([c["text"] for c in chunks])
    assert "Turnover: $10M" in combined_text
    assert "ISO 9001" in combined_text