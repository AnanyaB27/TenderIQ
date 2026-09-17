# TenderIQ

TenderIQ is an AI Procurement Intelligence Platform designed for MSMEs to discover, analyze, and draft responses for government tenders.

## Current Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** NestJS + TypeScript + TypeORM
- **AI Engine:** Python + FastAPI
- **Database:** PostgreSQL + pgvector
- **AI Provider:** Google Gemini (Generative AI + 768-dim Text Embeddings)

## Implemented Capabilities (P0.1 - P1.12)

- Live ingestion of CPPP (Central Public Procurement Portal) tenders.
- Automated PDF extraction (layout-aware, page-boundary tracking).
- Semantic chunking & 768-dimensional Gemini vector embeddings.
- Deterministic Rule Engine for eligibility matching (AI extracts, Rules decide).
- Validated Evidence & Citation tracking.
- Transparent Evaluation Confidence & Risk Indicators.
- Factual MSME Organizational Profile management.
- AI-Assisted Bid Drafting (Conservative, grounded generation).

## Limitations & Future Scope

- OCR for scanned/image-only PDFs is not currently implemented.
- Predictive ML models (win probability) are explicitly excluded to maintain determinism.
- Production Kubernetes/CI-CD deployments are scaffolded but require environment bindings.
