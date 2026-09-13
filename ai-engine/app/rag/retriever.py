from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.embeddings.embedding_client import EmbeddingClient

class ChunkResult(BaseModel):
    chunk_id: str
    document_id: str
    text: str
    page_start: int
    page_end: int
    section_heading: Optional[str]
    sequence_number: int
    char_count: int
    distance: float

class Retriever:
    """
    Executes pgvector similarity searches for a given query against stored document chunks.
    Reads only; strictly adheres to cosine distance (<=>) for relevance ranking.
    """
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.embedding_client = EmbeddingClient()

    async def retrieve(
        self,
        query: str,
        document_id: str,
        top_k: int = 5,
        max_distance: Optional[float] = None
    ) -> List[ChunkResult]:
        if not query or not query.strip():
            return []
            
        if top_k <= 0:
            raise ValueError("top_k must be a strictly positive integer.")

        # 1. Embed Query
        query_vectors = await self.embedding_client.embed_batch([query])
        if not query_vectors or len(query_vectors) == 0:
            raise RuntimeError("Failed to generate query embedding from the AI provider.")
        
        query_vector = query_vectors[0]
        
        # Cast to pgvector string format
        q_vec_str = f"[{','.join(map(str, query_vector))}]"

        # 2. Construct Safe Parameterized SQL Query
        # Uses pgvector's <=> operator to calculate cosine distance natively in the database.
        # Distance 0.0 means identical, 1.0 means orthogonal, 2.0 means opposite.
        base_sql = """
            SELECT 
                chunk_hash,
                document_id,
                text,
                page_start,
                page_end,
                section_heading,
                sequence_number,
                char_count,
                (embedding <=> CAST(:query_embedding AS vector)) AS distance
            FROM tender_document_chunks
            WHERE document_id = :document_id
              AND embedding IS NOT NULL
        """
        
        params = {
            "query_embedding": q_vec_str,
            "document_id": document_id,
            "top_k": top_k
        }

        # 3. Apply Optional Distance Threshold
        if max_distance is not None:
            if max_distance < 0:
                raise ValueError("max_distance cannot be negative.")
            base_sql += " AND (embedding <=> CAST(:query_embedding AS vector)) <= :max_distance"
            params["max_distance"] = max_distance

        # 4. Rank and Limit
        base_sql += " ORDER BY distance ASC LIMIT :top_k"

        # 5. Execute and Structure Result
        result = await self.db.execute(text(base_sql), params)
        rows = result.fetchall()

        chunks = []
        for row in rows:
            chunks.append(ChunkResult(
                chunk_id=row.chunk_hash,
                document_id=row.document_id,
                text=row.text,
                page_start=row.page_start,
                page_end=row.page_end,
                section_heading=row.section_heading,
                sequence_number=row.sequence_number,
                char_count=row.char_count,
                distance=float(row.distance)
            ))

        return chunks