import pytest
from unittest.mock import AsyncMock, patch
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.extraction.pipeline_service import DocumentPipelineService

TEST_DATABASE_URL = "postgresql+asyncpg://tenderiq:tenderiq_local@localhost:5432/tenderiq"

@pytest.fixture
async def db_session():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tender_document_chunks (
                id varchar PRIMARY KEY,
                chunk_hash varchar,
                document_id varchar NOT NULL,
                sequence_number int DEFAULT 1,
                text text,
                page_start int DEFAULT 1,
                page_end int DEFAULT 1,
                section_heading varchar,
                char_count int DEFAULT 0,
                embedding vector(768)
            )
        """))

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS tender_document_chunks"))
    await engine.dispose()

@patch.dict('os.environ', {'GOOGLE_API_KEY': 'fake_key'})
@pytest.mark.asyncio
async def test_pipeline_end_to_end_idempotency(db_session):
    service = DocumentPipelineService(db_session)

    # Mock the LLM Embedder to ensure test is deterministic & runs without network
    service.embedding_client.embed_batch = AsyncMock(return_value=[[0.1] * 768])

    # Mock the parser and chunker to ensure structural control
    service.pdf_parser = type("MockParser", (), {"parse": lambda self, b: {"text": "Valid tender text", "page_count": 1}})()
    service.chunker = type("MockChunker", (), {"chunk": lambda self, t: [{"text": t, "page_start": 1, "page_end": 1, "section_heading": "Main"}]})()

    doc_id = "test_doc_123"

    # 1st Run
    result1 = await service.process_document(doc_id, b"fake_pdf_bytes")
    assert result1["status"] == "SUCCESS"

    # Verify DB contains exactly 1 chunk
    res = await db_session.execute(text("SELECT COUNT(*) FROM tender_document_chunks WHERE document_id = :d"), {"d": doc_id})
    assert res.scalar() == 1

    # 2nd Run (Simulate a retry)
    result2 = await service.process_document(doc_id, b"fake_pdf_bytes")
    assert result2["status"] == "SUCCESS"

    # Verify DB still contains exactly 1 chunk (Idempotency Success)
    res = await db_session.execute(text("SELECT COUNT(*) FROM tender_document_chunks WHERE document_id = :d"), {"d": doc_id})
    assert res.scalar() == 1