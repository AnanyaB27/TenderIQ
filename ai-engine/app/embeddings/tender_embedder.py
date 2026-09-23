from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.embeddings.embedding_client import EmbeddingClient
from app.chunking.chunker import SemanticChunker

class TenderEmbedder:
    """
    Orchestrates SemanticChunker -> EmbeddingClient -> PostgreSQL pgvector.
    Enforces transaction safety and idempotency.
    """
    def __init__(self, db_session: AsyncSession):
        self.chunker = SemanticChunker()
        self.embedding_client = EmbeddingClient()
        self.db = db_session

    async def process_and_store_document(self, document_id: str, pages: List[Dict[str, Any]]) -> int:
        if not pages:
            return 0
            
        # 1. Generate semantic chunks
        chunks = self.chunker.chunk_document(document_id, pages)
        chunks = [c for c in chunks if c.get("text", "").strip()]
        if not chunks:
            return 0

        # 2. Idempotency Check: Filter out already embedded chunks
        existing_query = text("SELECT chunk_hash FROM tender_document_chunks WHERE document_id = :doc_id")
        result = await self.db.execute(existing_query, {"doc_id": document_id})
        existing_hashes = {row[0] for row in result.fetchall()}
        
        new_chunks = [c for c in chunks if c["chunk_id"] not in existing_hashes]
        if not new_chunks:
            return 0  # Idempotent return; all chunks already exist

        # 3. Generate Vectors
        texts_to_embed = [c["text"] for c in new_chunks]
        embeddings = await self.embedding_client.embed_batch(texts_to_embed)
        
        if len(embeddings) != len(new_chunks):
            raise RuntimeError(f"Mismatch: Got {len(embeddings)} vectors for {len(new_chunks)} chunks.")

        # 4. Safe Database Persistence via pgvector syntax
        insert_query = text("""
            INSERT INTO tender_document_chunks 
            (document_id, chunk_hash, sequence_number, text, page_start, page_end, section_heading, char_count, embedding)
            VALUES 
            (:doc_id, :chunk_hash, :seq, :text, :page_start, :page_end, :section, :char_count, :embedding)
        """)
        
        persisted_count = 0
        try:
            for chunk, emb in zip(new_chunks, embeddings):
                # Format vector as a string array for pgvector
                pg_vector_str = f"[{','.join(map(str, emb))}]"
                
                await self.db.execute(insert_query, {
                    "doc_id": chunk["document_id"],
                    "chunk_hash": chunk["chunk_id"],
                    "seq": chunk["sequence"],
                    "text": chunk["text"],
                    "page_start": chunk["page_start"],
                    "page_end": chunk["page_end"],
                    "section": chunk["section"],
                    "char_count": chunk["char_count"],
                    "embedding": pg_vector_str
                })
                persisted_count += 1
                
            await self.db.commit()
            return persisted_count
            
        except Exception as e:
            await self.db.rollback()
            raise RuntimeError(f"Database insertion failed. Transaction rolled back. Error: {str(e)}")
