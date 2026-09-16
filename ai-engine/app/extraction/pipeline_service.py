import hashlib
import uuid
import asyncio
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.embeddings.embedding_client import EmbeddingClient

# Gracefully import existing P0 components
try:
    from app.parsing.pdf_parser import PdfParser
except ImportError:
    PdfParser = None

try:
    from app.chunking.chunker import Chunker
except ImportError:
    Chunker = None

class DocumentPipelineService:
    """
    Orchestrates the P1.2 complete document processing workflow:
    Extraction -> Chunking -> Gemini Embedding -> pgvector Persistence
    """
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.embedding_client = EmbeddingClient()
        self.pdf_parser = PdfParser() if PdfParser else None
        self.chunker = Chunker() if Chunker else None

    async def process_document(self, document_id: str, file_bytes: bytes) -> Dict[str, Any]:
        # ---------------------------------------------------------
        # STEP 1 & 2: VALIDATE AND EXTRACT TEXT (P0.2)
        # ---------------------------------------------------------
        extracted_text = ""
        page_count = 0

        if self.pdf_parser and hasattr(self.pdf_parser, 'parse'):
            if asyncio.iscoroutinefunction(self.pdf_parser.parse):
                parse_res = await self.pdf_parser.parse(file_bytes)
            else:
                parse_res = self.pdf_parser.parse(file_bytes)
            extracted_text = parse_res.get("text", "")
            page_count = parse_res.get("page_count", 0)
        else:
            # Fallback robust pypdf extraction if existing interface varies
            import io
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)
            extracted_text = "\n\n".join([p.extract_text() or "" for p in reader.pages])

        if not extracted_text.strip():
            return {"status": "NO_EXTRACTABLE_TEXT", "extracted_text": "", "page_count": page_count}

        # ---------------------------------------------------------
        # STEP 3: SEMANTIC CHUNKING (P0.3)
        # ---------------------------------------------------------
        chunks = []
        if self.chunker and hasattr(self.chunker, 'chunk'):
            chunks_raw = self.chunker.chunk(extracted_text)
            # Normalize to dict ensuring backward compatibility with P0.3
            for i, c in enumerate(chunks_raw):
                if isinstance(c, dict):
                    chunks.append(c)
                elif hasattr(c, 'text'):
                    chunks.append({
                        "text": getattr(c, 'text'),
                        "page_start": getattr(c, 'page_start', 1),
                        "page_end": getattr(c, 'page_end', 1),
                        "section_heading": getattr(c, 'section_heading', None)
                    })
                else:
                    chunks.append({"text": str(c), "page_start": 1, "page_end": 1, "section_heading": None})
        else:
            # Deterministic fallback semantic chunker
            paragraphs = [p.strip() for p in extracted_text.split("\n\n") if len(p.strip()) > 50]
            chunks = [{"text": p, "page_start": 1, "page_end": 1, "section_heading": "General"} for p in paragraphs]

        if not chunks:
             return {"status": "NO_EXTRACTABLE_TEXT", "extracted_text": extracted_text, "page_count": page_count}

        # ---------------------------------------------------------
        # STEP 5: GEMINI EMBEDDING GENERATION (P0.4)
        # ---------------------------------------------------------
        texts_to_embed = [c["text"] for c in chunks]
        try:
            embeddings = await self.embedding_client.embed_batch(texts_to_embed)
        except Exception as e:
            print(f"Gemini Embedding failed: {e}")
            return {"status": "EMBEDDING_FAILED", "extracted_text": extracted_text, "page_count": page_count}

        # ---------------------------------------------------------
        # STEP 4, 6, & 8: IDEMPOTENT PGVECTOR PERSISTENCE
        # ---------------------------------------------------------
        # Enforce idempotency by flushing previous chunks for this document
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
            chunk_text = chunk["text"]
            emb_vector = embeddings[idx]
            emb_str = f"[{','.join(map(str, emb_vector))}]"
            chunk_hash = hashlib.sha256(chunk_text.encode('utf-8')).hexdigest()

            await self.db.execute(insert_sql, {
                "id": str(uuid.uuid4()),
                "doc_id": document_id,
                "hash": chunk_hash,
                "seq": idx + 1,
                "txt": chunk_text,
                "p_start": chunk.get("page_start", 1),
                "p_end": chunk.get("page_end", 1),
                "sec": chunk.get("section_heading", None),
                "chars": len(chunk_text),
                "emb": emb_str
            })

        await self.db.commit()

        return {"status": "SUCCESS", "extracted_text": extracted_text, "page_count": page_count}