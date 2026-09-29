import re
import hashlib
from typing import List, Dict, Any

class SemanticChunker:
    """
    Splits page-aware normalized text into semantic chunks.
    Preserves page boundaries, sequence, and section metadata.
    """
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def is_heading(self, text: str) -> bool:
        """Heuristics to detect if a line is likely a section heading."""
        text = text.strip()
        if not text or len(text) > 150:
            return False
        
        # All caps line (e.g., "ELIGIBILITY CRITERIA")
        if text.isupper():
            return True
            
        # Common prefix headings
        if re.match(r'^(?:SECTION|PART|CHAPTER|CLAUSE)\s+[A-Z0-9]+', text, re.IGNORECASE):
            return True
            
        # Numbered headings (e.g., "1.", "1.1", "1.1.2 Scope")
        if re.match(r'^\d+(\.\d+)*\s+[A-Z]', text):
            return True
            
        return False

    def _get_overlap_text(self, text: str) -> str:
        """Extracts overlap from the end of the text, attempting to align to a word boundary."""
        if self.chunk_overlap <= 0 or len(text) <= self.chunk_overlap:
            return ""
        
        raw_overlap = text[-self.chunk_overlap:]
        # Try to snap to the first space in the overlap to avoid splitting words
        match = re.search(r'\s+(.*)', raw_overlap, re.DOTALL)
        return match.group(1) if match else raw_overlap

    def chunk_document(self, document_id: str, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not pages:
            return []

        chunks = []
        sequence = 1
        
        current_text = ""
        current_section = "General"
        page_start = pages[0].get("page_number", 1)
        
        def add_chunk(text: str, p_start: int, p_end: int, section: str):
            nonlocal sequence
            text = text.strip()
            if not text:
                return
                
            chunk_id = hashlib.sha256(f"{document_id}_{sequence}_{text}".encode()).hexdigest()
            chunks.append({
                "chunk_id": chunk_id,
                "document_id": document_id,
                "sequence": sequence,
                "text": text,
                "page_start": p_start,
                "page_end": p_end,
                "section": section,
                "char_count": len(text)
            })
            sequence += 1

        for page in pages:
            p_num = page.get("page_number", 1)
            text_content = page.get("text", "")
            
            # Split by normalized paragraph breaks
            paragraphs = re.split(r'\n\n+', text_content)

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                    
                if self.is_heading(para):
                    current_section = para[:255]

                # If a single paragraph is larger than the chunk size (oversized section)
                while len(para) > self.chunk_size:
                    space_left = self.chunk_size - len(current_text)
                    if space_left > 0:
                        current_text += ("\n\n" if current_text else "") + para[:space_left]
                        para = para[space_left:]
                    
                    add_chunk(current_text, page_start, p_num, current_section)
                    current_text = self._get_overlap_text(current_text)
                    page_start = p_num

                if not para:
                    continue

                # Standard size checking
                if len(current_text) + len(para) + 2 <= self.chunk_size:
                    current_text += ("\n\n" + para) if current_text else para
                else:
                    add_chunk(current_text, page_start, p_num, current_section)
                    current_text = self._get_overlap_text(current_text) + ("\n\n" if current_text else "") + para
                    page_start = p_num

        # Flush remaining text
        if current_text.strip():
            # Assume end page is the last page processed
            add_chunk(current_text, page_start, pages[-1].get("page_number", 1), current_section)

        return chunks
