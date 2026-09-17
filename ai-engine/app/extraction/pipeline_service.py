import io
import re
import hashlib
import uuid
import asyncio
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pypdf import PdfReader
from app.embeddings.embedding_client import EmbeddingClient
import google.generativeai as genai

class StructuredTenderMetadata(BaseModel):
    summary: str
    eligibility_highlights: List[str]
    procurement_type: str

class DocumentChunk(BaseModel):
    text: str
    page_start: int
    page_end: int
    section_heading: Optional[str]

class DocumentPipelineService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.embedding_client = EmbeddingClient()
        # Initialize Gemini for structured intelligence extraction
        self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')

    async def process_document(self, document_id: str, file_bytes: bytes) -> Dict[str, Any]:
        # ---------------------------------------------------------
        # P1.9-A: LAYOUT-AWARE PDF EXTRACTION & SCANNED PDF DETECTION
        # ---------------------------------------------------------
        reader = PdfReader(io.BytesIO(file_bytes))
        page_count = len(reader.pages)
        raw_pages = []
        total_text_length = 0

        for i, page in enumerate(reader.pages):
            # pypdf layout preservation keeps basic table spacing intact
            text_content = page.extract_text(extraction_mode="layout") or ""
            clean_text = text_content.strip()
            total_text_length += len(clean_text)
            raw_pages.append({"page_num": i + 1, "text": clean_text})

        # P1.9-A Safety: If document has pages but almost no text, it's a scanned image.
        if page_count > 0 and total_text_length < (page_count * 50):
            return {
                "status": "NO_EXTRACTABLE_TEXT", 
                "extracted_text": "", 
                "page_count": page_count,
                "summary": None,
                "metadata": None
            }

        full_extracted_text = "\n\n".join([p["text"] for p in raw_pages if p["text"]])

        # ---------------------------------------------------------
        # P1.9-C: SEMANTIC CHUNKING WITH HEADING & PAGE TRACKING
        # ---------------------------------------------------------
        chunks: List[DocumentChunk] = []
        current_heading = "General"
        
        # Regex to detect standard tender section headings (e.g., "1.0 INTRODUCTION", "SECTION II")
        heading_pattern = re.compile(r'^(?:SECTION\s+[IVX\d]+|[\d\.]+\s+)[A-Z][A-Z\s]+$')

        for page_data in raw_pages:
            paragraphs = [p.strip() for p in page_data["text"].split("\n\n") if len(p.strip()) > 40]
            
            for para in paragraphs:
                lines = para.split("\n")
                if len(lines) == 1 and heading_pattern.match(lines[0].strip()):
                    current_heading = lines[0].strip()
                    continue # Headings act as metadata boundaries, not standalone chunks
                
                chunks.append(DocumentChunk(
                    text=para,
                    page_start=page_data["page_num"],
                    page_end=page_data["page_num"],
                    section_heading=current_heading
                ))

        if not chunks:
             return {"status": "NO_EXTRACTABLE_TEXT", "extracted_text": full_extracted_text, "page_count": page_count}

        # ---------------------------------------------------------
        # P0.4: GEMINI EMBEDDING BATCH GENERATION (768-dim)
        # ---------------------------------------------------------
        texts_to_embed = [c.text for c in chunks]
        try:
            embeddings = await self.embedding_client.embed_batch(texts_to_embed)
        except Exception as e:
            print(f"Gemini Embedding failed: {e}")
            return {"status": "EMBEDDING_FAILED", "extracted_text": full_extracted_text, "page_count": page_count}

        # ---------------------------------------------------------
        # P1.9-B & P1.9-D: GROUNDED DOCUMENT SUMMARY & METADATA
        # ---------------------------------------------------------
        document_summary = None
        structured_metadata = None
        
        try:
            # Bound context window to prevent massive payload timeouts. First 5 and last 5 chunks often contain scopes/deadlines.
            context_chunks = chunks[:10] + chunks[-5:] if len(chunks) > 15 else chunks
            context_text = "\n---\n".join([c.text for c in context_chunks])
            
            prompt = f"""
            Analyze the following excerpts from a government tender document.
            Extract a concise executive summary, key eligibility highlights, and the general procurement type (e.g., IT Services, Construction, Goods).
            Do NOT fabricate information. If a detail is missing, omit it.
            
            Document Excerpts:
            {context_text}
            """
            
            # Request strictly typed JSON response
            resp = self.gemini_model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=StructuredTenderMetadata
                )
            )
            parsed_meta = json.loads(resp.text)
            document_summary = parsed_meta.get("summary")
            structured_metadata = parsed_meta
        except Exception as e:
            print(f"Structured Intelligence extraction skipped/failed: {e}")
            # Non-fatal. Continue persistence.

        # ---------------------------------------------------------
        # P1.2: IDEMPOTENT PGVECTOR PERSISTENCE
        # ---------------------------------------------------------
        await self.db.execute(
            text("DELETE FROM tender_document_chunks WHERE document_id = :doc_id"),
            {"doc_id": document_id}
        )

        insert_sql = text("""
            INSERT INTO tender_document_chunks 
            (id, document_id, chunk_hash, sequence_number, text, page_start, page_end, section_heading, char_count, embedding)
            VALUES 
            (:id, :doc_id, :hash, :seq, :txt, :p_start, :p_end, :sec, :chars, CAST(:emb AS vector))
        """)

        for idx, chunk in enumerate(chunks):
            emb_str = f"[{','.join(map(str, embeddings[idx]))}]"
            chunk_hash = hashlib.sha256(chunk.text.encode('utf-8')).hexdigest()

            await self.db.execute(insert_sql, {
                "id": str(uuid.uuid4()),
                "doc_id": document_id,
                "hash": chunk_hash,
                "seq": idx + 1,
                "txt": chunk.text,
                "p_start": chunk.page_start,
                "p_end": chunk.page_end,
                "sec": chunk.section_heading,
                "chars": len(chunk.text),
                "emb": emb_str
            })

        await self.db.commit()

        return {
            "status": "SUCCESS", 
            "extracted_text": full_extracted_text, 
            "page_count": page_count,
            "summary": document_summary,
            "metadata": structured_metadata
        }