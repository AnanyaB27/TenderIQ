## Evaluation Framework & Benchmarking (P1.13)

An offline, decoupled benchmarking framework exists in `ai-engine/app/evaluation/`. It calculates deterministic metrics (Precision, Recall, F1, Recall@K, MRR, Citation Validity) based on a strict `GoldDataset` JSON schema.

- **CURRENTLY IMPLEMENTED:** Pydantic schema validation, mathematical metric utilities, and the offline `EvaluationRunner` orchestrator.
- **PARTIALLY IMPLEMENTED:** The `faiss_benchmark.py` scaffold exists solely for offline embedding comparisons and does _not_ interact with production routing.
- **FUTURE SCOPE:** Population of the actual JSON gold dataset using human-annotated real CPPP PDFs, and execution of live end-to-end benchmarking against the PostgreSQL/pgvector retrieval core.
