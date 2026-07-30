# TenderIQ — Project Structure

## Document Control

| Field | Value |
|---|---|
| Document | PROJECT_STRUCTURE.md |
| Product | TenderIQ — AI Procurement Intelligence Platform for MSMEs |
| Version | 1.0 (Baseline) |
| Status | Approved — Authoritative Source of Truth for repository layout |
| Owner | Chief Software Architect |
| Last Updated | 2026-07-30 |
| Change Policy | This is the single folder structure for TenderIQ. Every service's internal layout follows the module/domain boundaries already fixed in Architecture.md §8–9, DATABASE.md §1, and API_SPEC.md — this document does not introduce new boundaries, it lays out where they live on disk. |
| Related Documents | [Architecture.md](architecture/Architecture.md) · [DATABASE.md](database/DATABASE.md) · [API_SPEC.md](api/API_SPEC.md) · [AI_DESIGN.md](ai/AI_DESIGN.md) · [ENGINEERING_GUIDE.md](engineering/ENGINEERING_GUIDE.md) |

> This document lists structure only — folders and files with their purpose. No file contents, function signatures, or implementation code are specified here.

---

## 1. Repository Layout at a Glance

```
TenderIQ/
├── .github/                    # CI/CD workflows and repo governance
├── docker/                     # Container orchestration: local compose, Kubernetes manifests, reverse proxy config
├── docs/                       # Product/engineering documentation (this file's own home)
├── backend/                    # Backend API Service — Node.js/NestJS (Architecture.md §8)
├── ai-engine/                  # AI Engine & Ingestion Service — Python/FastAPI (Architecture.md §8, AI_DESIGN.md)
├── frontend/                   # Web application — React/Next.js (Architecture.md §8)
├── docker-compose.yml          # Local development orchestration (all services + Postgres/pgvector + Redis + MinIO)
├── docker-compose.prod.yml     # Production-shaped compose, used for staging smoke tests only (prod itself is Kubernetes)
├── .editorconfig               # Cross-language whitespace/charset consistency (ENGINEERING_GUIDE.md)
├── .gitignore                  # VCS excludes (node_modules, __pycache__, .env, build output, etc.)
├── LICENSE                     # Proprietary — All Rights Reserved
└── README.md                   # Project overview, links into docs/
```

---

## 2. Root-Level Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Brings up the full local stack: `postgres` (with `pgvector` extension enabled), `redis`, `minio` (S3-compatible object storage), `backend-api`, `notification-worker`, `ai-engine`, `frontend` — the single command a new developer runs to get everything running (ENGINEERING_GUIDE.md onboarding). |
| `docker-compose.prod.yml` | A production-shaped compose file used only to smoke-test container images before they go to Kubernetes; not the production deployment mechanism itself (that is `docker/k8s/`, §4). |
| `.editorconfig` | Enforces indentation/line-ending/charset consistency across the TypeScript, Python, and Markdown files in the repo. |
| `.gitignore` | Excludes `node_modules/`, Python virtual envs/`__pycache__/`, `.env*` (except `.env.example` files), build output (`dist/`, `.next/`), and IDE-local settings. |
| `LICENSE` | Proprietary/All Rights Reserved — TenderIQ is a commercial product, not an open-source release. |
| `README.md` | High-level project description, quick-start (`docker-compose up`), and a table of links into every document in `docs/`. |

---

## 3. `.github/` — CI/CD & Repository Governance

```
.github/
├── workflows/
│   ├── backend-ci.yml           # Lint, type-check, unit + e2e test, build the backend/ NestJS apps on every PR
│   ├── ai-engine-ci.yml         # Lint (ruff), type-check (mypy), unit test, build the ai-engine/ FastAPI service on every PR
│   ├── frontend-ci.yml          # Lint, type-check, unit test, build the frontend/ Next.js app on every PR
│   ├── tenant-isolation-ci.yml  # Dedicated job running the tenant-isolation test suite (Architecture.md §13.3) against any PR touching a data-access module — a required check, not merely advisory
│   ├── deploy-staging.yml       # Builds and deploys all three service images to the staging Kubernetes namespace on merge to `main`
│   └── deploy-production.yml    # Deploys to production on a tagged release, gated on a manual approval step
├── CODEOWNERS                   # Maps each top-level folder to its required PR reviewers
└── pull_request_template.md     # Checklist referencing ENGINEERING_GUIDE.md's PR quality gate (schema/API/security checklist)
```

---

## 4. `docker/` — Containerization & Orchestration

```
docker/
├── nginx/
│   └── nginx.conf               # Local reverse proxy simulating the production API Gateway/Ingress (Architecture.md §7.2, §12) — TLS termination is a no-op locally, routing rules mirror production
└── k8s/
    ├── base/                    # Kustomize base manifests, environment-agnostic
    │   ├── namespaces.yaml      # `frontend`, `backend`, `ai-engine` namespaces (Architecture.md §12 deployment diagram)
    │   ├── backend-deployment.yaml
    │   ├── backend-service.yaml
    │   ├── notification-worker-deployment.yaml
    │   ├── ai-engine-deployment.yaml
    │   ├── ai-engine-service.yaml
    │   ├── ingestion-worker-cronjob.yaml
    │   ├── frontend-deployment.yaml
    │   ├── frontend-service.yaml
    │   ├── ingress.yaml         # Routes to Backend API and Frontend; AI Engine has no ingress entry (internal-only, Architecture.md §13.1)
    │   ├── hpa.yaml              # HorizontalPodAutoscaler definitions per Architecture.md §14
    │   └── secrets.template.yaml # Placeholder structure only — real secrets are never committed (ENGINEERING_GUIDE.md)
    └── overlays/
        ├── staging/
        │   └── kustomization.yaml   # Staging-specific replica counts, resource limits, env overrides
        └── production/
            └── kustomization.yaml   # Production-specific replica counts, resource limits, multi-AZ node affinity
```

---

## 5. `docs/` — Documentation

Already established; this file's own location is `docs/PROJECT_STRUCTURE.md`, alongside:

```
docs/
├── PROJECT_STRUCTURE.md         # This document
├── architecture/Architecture.md # System architecture (vision through future scope)
├── database/DATABASE.md         # Relational schema, ER diagrams, conventions
├── api/API_SPEC.md              # Public REST contract
├── ai/AI_DESIGN.md              # AI Engine pipeline design
└── engineering/ENGINEERING_GUIDE.md  # Coding standards, review checklists, onboarding (see next task)
```

---

## 6. `backend/` — Backend API Service (NestJS)

Structured as an **Nx/Nest monorepo with two runnable apps** sharing one set of libraries — this reflects Architecture.md's container diagram, which treats the Backend API and the Notification Service as two separate containers even though both are Node.js/NestJS, without duplicating the data-access and common-infrastructure code between them.

```
backend/
├── apps/
│   ├── api/                                    # Public REST API — implements every endpoint in API_SPEC.md
│   │   └── src/
│   │       ├── main.ts                         # Bootstraps Nest, applies global ValidationPipe, exception filter, Swagger setup (API_SPEC.md §5)
│   │       ├── app.module.ts                   # Root module, imports every feature module below
│   │       ├── config/
│   │       │   ├── configuration.ts            # Typed config loader (env → strongly-typed config object)
│   │       │   └── validation.schema.ts        # Startup-time env validation — fails fast on missing/malformed config
│   │       └── modules/
│   │           ├── auth/                       # Swagger tag: Auth (API_SPEC.md §2)
│   │           │   ├── auth.module.ts
│   │           │   ├── auth.controller.ts
│   │           │   ├── auth.service.ts
│   │           │   ├── strategies/
│   │           │   │   ├── jwt.strategy.ts
│   │           │   │   └── google-oauth.strategy.ts
│   │           │   └── dto/                    # RegisterDto, LoginDto, RefreshDto, etc.
│   │           ├── organizations/               # Swagger tag: Company (API_SPEC.md §7)
│   │           │   ├── organizations.module.ts
│   │           │   ├── organizations.controller.ts
│   │           │   ├── organizations.service.ts
│   │           │   ├── members.controller.ts
│   │           │   ├── members.service.ts
│   │           │   ├── invitations.controller.ts
│   │           │   ├── invitations.service.ts
│   │           │   ├── msme-profile.controller.ts
│   │           │   ├── msme-profile.service.ts
│   │           │   ├── certifications.controller.ts
│   │           │   ├── certifications.service.ts
│   │           │   └── dto/
│   │           ├── billing/                     # Swagger tag: Company (subscription/invoice/usage sub-resources)
│   │           │   ├── billing.module.ts
│   │           │   ├── subscriptions.controller.ts
│   │           │   ├── subscriptions.service.ts
│   │           │   ├── invoices.controller.ts
│   │           │   ├── usage.controller.ts
│   │           │   ├── razorpay-client.service.ts
│   │           │   └── dto/
│   │           ├── notifications/                # Read-side of notifications (dispatch lives in apps/notification-worker)
│   │           │   ├── notifications.module.ts
│   │           │   ├── notifications.controller.ts
│   │           │   ├── notifications.service.ts
│   │           │   ├── preferences.controller.ts
│   │           │   └── dto/
│   │           ├── tenders/                      # Swagger tag: Tender — discovery/search (API_SPEC.md §8.1)
│   │           │   ├── tenders.module.ts
│   │           │   ├── tenders.controller.ts
│   │           │   ├── tenders.service.ts
│   │           │   ├── categories.controller.ts
│   │           │   └── dto/
│   │           ├── saved-searches/               # Swagger tag: Tender — alerts (API_SPEC.md §8.2)
│   │           │   ├── saved-searches.module.ts
│   │           │   ├── saved-searches.controller.ts
│   │           │   ├── saved-searches.service.ts
│   │           │   └── dto/
│   │           ├── pipeline/                     # Swagger tag: Tender — bid workspace (API_SPEC.md §8.3)
│   │           │   ├── pipeline.module.ts
│   │           │   ├── pipeline-items.controller.ts
│   │           │   ├── pipeline-items.service.ts
│   │           │   ├── checklist-tasks.controller.ts
│   │           │   ├── checklist-tasks.service.ts
│   │           │   └── dto/
│   │           ├── ai/                           # Swagger tag: AI — proxies to ai-engine/ (API_SPEC.md §9)
│   │           │   ├── ai.module.ts
│   │           │   ├── ai.controller.ts
│   │           │   ├── ai-gateway.service.ts      # Internal HTTP client to the AI Engine's contract (Architecture.md §9.3)
│   │           │   ├── ai-credit-guard.service.ts # Enforces usage_counters quota before proxying (API_SPEC.md §12)
│   │           │   ├── draft-sections.controller.ts
│   │           │   └── dto/
│   │           ├── reports/                      # Swagger tag: Reports (API_SPEC.md §10)
│   │           │   ├── reports.module.ts
│   │           │   ├── reports.controller.ts
│   │           │   ├── reports.service.ts
│   │           │   ├── export.service.ts          # CSV/PDF generation
│   │           │   └── dto/
│   │           ├── admin/                        # Swagger tag: Admin — platform-admin only (API_SPEC.md §11)
│   │           │   ├── admin.module.ts
│   │           │   ├── ingestion-health.controller.ts
│   │           │   ├── ai-metrics.controller.ts
│   │           │   ├── organizations-admin.controller.ts
│   │           │   ├── dsr-requests.controller.ts
│   │           │   ├── platform-metrics.controller.ts
│   │           │   ├── webhooks.controller.ts      # POST /admin/webhooks/razorpay
│   │           │   └── dto/
│   │           ├── audit/                         # No public controller — internal AuditService used by every module above (DATABASE.md §6)
│   │           │   ├── audit.module.ts
│   │           │   └── audit.service.ts
│   │           └── health/
│   │               └── health.controller.ts       # `/healthz`, `/readyz` (Architecture.md §16)
│   │
│   └── notification-worker/                     # Notification Service container (Architecture.md §7.2 container diagram)
│       └── src/
│           ├── main.ts                          # Bootstraps a standalone Nest application context (no HTTP server) that consumes the notification queue
│           ├── worker.module.ts
│           ├── processors/
│           │   ├── new-match.processor.ts       # tender.new_match event → notification dispatch
│           │   ├── deadline-reminder.processor.ts
│           │   ├── checklist-overdue.processor.ts
│           │   └── teammate-action.processor.ts
│           └── channels/
│               ├── email-channel.service.ts
│               └── in-app-channel.service.ts
│
├── libs/                                          # Shared across both apps above
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── organization-membership.guard.ts  # Resolves org role from the session, never from the path param alone (Architecture.md §13.3)
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── correlation-id.interceptor.ts     # Assigns/propagates correlationId (Architecture.md §15)
│   │   │   ├── response-envelope.interceptor.ts  # Wraps every response in the `{ data, meta }` envelope (API_SPEC.md §3.2)
│   │   │   └── logging.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts          # Produces the uniform `{ error: {...} }` envelope (API_SPEC.md §3.2, §13)
│   │   └── pipes/
│   │       └── whitelist-validation.pipe.ts      # Rejects unknown fields (API_SPEC.md §3.1)
│   ├── database/
│   │   ├── database.module.ts
│   │   ├── entities/                             # One TypeORM entity per DATABASE.md table, grouped by domain
│   │   │   ├── identity/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── user-oauth-identity.entity.ts
│   │   │   │   ├── organization.entity.ts
│   │   │   │   ├── organization-member.entity.ts
│   │   │   │   ├── organization-invitation.entity.ts
│   │   │   │   ├── msme-profile.entity.ts
│   │   │   │   └── msme-certification.entity.ts
│   │   │   ├── tender/
│   │   │   │   ├── tender-source.entity.ts
│   │   │   │   ├── tender-category.entity.ts
│   │   │   │   ├── tender.entity.ts
│   │   │   │   ├── tender-category-link.entity.ts
│   │   │   │   ├── tender-document.entity.ts
│   │   │   │   ├── tender-field-correction.entity.ts
│   │   │   │   ├── ingestion-run.entity.ts
│   │   │   │   └── ingestion-error.entity.ts
│   │   │   ├── ai/
│   │   │   │   ├── tender-embedding.entity.ts
│   │   │   │   ├── organization-profile-embedding.entity.ts
│   │   │   │   ├── tender-document-chunk.entity.ts     # DATABASE.md §7.7 addendum
│   │   │   │   ├── tender-chunk-embedding.entity.ts    # DATABASE.md §7.7 addendum
│   │   │   │   ├── match-score.entity.ts
│   │   │   │   └── eligibility-checklist-item.entity.ts
│   │   │   ├── pipeline/
│   │   │   │   ├── pipeline-item.entity.ts
│   │   │   │   ├── checklist-task.entity.ts
│   │   │   │   ├── bid-draft.entity.ts
│   │   │   │   └── saved-search.entity.ts
│   │   │   ├── notifications/
│   │   │   │   ├── notification.entity.ts
│   │   │   │   └── notification-preference.entity.ts
│   │   │   └── billing/
│   │   │       ├── subscription-plan.entity.ts
│   │   │       ├── organization-subscription.entity.ts
│   │   │       ├── invoice.entity.ts
│   │   │       ├── usage-counter.entity.ts
│   │   │       ├── audit-log.entity.ts
│   │   │       └── dsr-request.entity.ts
│   │   ├── migrations/
│   │   │   └── <timestamp>-baseline-schema.ts    # Initial migration creating the full DATABASE.md v1.1 schema; every subsequent schema change is its own incremental migration file added here per DATABASE.md §12
│   │   ├── repositories/                          # Custom repositories beyond generic CRUD
│   │   │   ├── tenant-scoped.repository.ts         # Base class injecting the mandatory organization_id predicate (Architecture.md §9.4, §13.3)
│   │   │   ├── tenders.repository.ts               # Full-text + match-score-aware query composition
│   │   │   └── pipeline-items.repository.ts        # Stage-transition-aware queries
│   │   └── seeds/
│   │       ├── subscription-plans.seed.ts
│   │       └── tender-categories.seed.ts
│   └── config/
│       └── redis.config.ts                        # Shared BullMQ/Redis connection config for both apps
│
├── test/
│   └── e2e/                                       # Supertest-based e2e specs, one suite per module above
├── nest-cli.json                                   # Declares the two-app monorepo layout
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .eslintrc.js
├── .prettierrc
└── .env.example
```

---

## 7. `ai-engine/` — AI Engine & Ingestion Service (Python/FastAPI)

Internal-only service (Architecture.md §8.3) — the `api/` package below implements exactly the internal contract in Architecture.md §9.3; every other package implements one numbered section of AI_DESIGN.md, referenced inline.

```
ai-engine/
├── app/
│   ├── main.py                       # FastAPI app factory; mounts internal routers only, no public CORS origins
│   ├── config.py                     # Typed settings (env-driven): LLM provider keys, embedding model, DB/Redis/object-storage config
│   ├── api/
│   │   └── v1/
│   │       ├── extraction_router.py  # POST /internal/tenders/{id}/extract
│   │       ├── summary_router.py     # GET /internal/tenders/{id}/summary
│   │       ├── qa_router.py          # POST /internal/tenders/{id}/qa
│   │       ├── match_router.py       # POST /internal/orgs/{id}/match
│   │       ├── draft_router.py       # POST /internal/tenders/{id}/draft
│   │       └── health_router.py      # /healthz, /readyz
│   ├── ingestion/                    # AI_DESIGN.md is silent here by design — this is Architecture.md §9.2's Ingestion Adapter Layer
│   │   ├── connectors/
│   │   │   ├── base_connector.py     # `SourceConnector` interface: fetchNew(), fetchDocument(), mapToCanonical()
│   │   │   ├── gem_connector.py
│   │   │   ├── cppp_connector.py
│   │   │   ├── state_portal_connector.py
│   │   │   └── aggregator_connector.py
│   │   ├── scheduler.py              # Triggers scheduled polling per tender_sources.connectorConfig
│   │   └── deduplication.py          # source-id + content-hash dedup (FR-ING-2)
│   ├── parsing/                      # AI_DESIGN.md §1 (OCR) + §2 (PDF Parsing)
│   │   ├── format_normalizer.py
│   │   ├── pdf_parser.py             # Layout-aware block/table/clause-tree extraction
│   │   ├── ocr_pipeline.py           # Rasterization, OCR engine call, cleanup, confidence scoring
│   │   └── table_extractor.py
│   ├── chunking/                     # AI_DESIGN.md §3
│   │   ├── chunker.py                # Clause-tree-aligned chunking, sizing rules
│   │   └── boilerplate_dedup.py      # content_hash-based chunk reuse
│   ├── embeddings/                   # AI_DESIGN.md §4
│   │   ├── embedding_client.py       # Voyage AI client wrapper, batching
│   │   ├── tender_embedder.py
│   │   ├── org_profile_embedder.py
│   │   └── chunk_embedder.py
│   ├── extraction/                   # AI_DESIGN.md §8
│   │   ├── anchor_extractor.py       # Pass 1 — heuristic label/anchor extraction
│   │   ├── llm_extractor.py          # Pass 2 — structured-output LLM extraction
│   │   └── schema.py                 # Canonical extraction JSON schema
│   ├── matching/                     # AI_DESIGN.md §9
│   │   ├── rule_engine.py            # Deterministic eligibility rule evaluation per category
│   │   ├── match_scorer.py           # Combines rule-based + semantic-similarity scores
│   │   └── calibration.py            # Win/loss-driven calibration weight adjustment (FR-BID-3)
│   ├── risk/                         # AI_DESIGN.md §10
│   │   ├── clause_classifier.py      # LLM risk-clause taxonomy classification
│   │   └── peer_outlier_detector.py  # Offline FAISS-backed statistical peer comparison
│   ├── rag/                          # AI_DESIGN.md §7
│   │   ├── retriever.py              # Hybrid dense + sparse retrieval
│   │   ├── reranker.py
│   │   └── qa_service.py             # Grounded answer generation + citation attachment
│   ├── chatbot/                      # AI_DESIGN.md §12
│   │   ├── tender_chatbot.py
│   │   └── platform_help_chatbot.py
│   ├── drafting/                     # Draft Generation Service (Architecture.md §9.2, AI_DESIGN.md §6 template family)
│   │   └── draft_generator.py
│   ├── prompts/                      # AI_DESIGN.md §6 — versioned prompt templates, one subfolder per task family
│   │   ├── extraction/
│   │   ├── eligibility/
│   │   ├── summary/
│   │   ├── qa/
│   │   ├── risk_classification/
│   │   └── draft_generation/
│   ├── guardrails/                   # AI_DESIGN.md §11 (Confidence Scoring) + §13 (Hallucination Prevention)
│   │   ├── confidence_scorer.py
│   │   └── citation_validator.py     # Rejects/regenerates any output missing a required citation
│   ├── evaluation/                   # AI_DESIGN.md §14 (+ §5 FAISS offline benchmarking)
│   │   ├── eval_runner.py
│   │   ├── faiss_benchmark.py        # Offline embedding-model/candidate benchmarking (never the online index)
│   │   ├── metrics.py
│   │   └── gold_datasets/            # Human-labeled eval sets (versioned, not committed with real tender PII)
│   ├── workers/                      # Redis/BullMQ queue consumers
│   │   ├── extraction_worker.py
│   │   ├── matching_worker.py
│   │   └── ingestion_worker.py
│   └── db/
│       ├── session.py                # SQLAlchemy engine/session, scoped to the tables this service owns (Architecture.md §9.4)
│       ├── models/                   # SQLAlchemy models — only for tables the AI Engine reads/writes directly
│       │   ├── tender.py
│       │   ├── tender_document.py
│       │   ├── tender_document_chunk.py
│       │   ├── tender_field_correction.py
│       │   ├── tender_embedding.py
│       │   ├── tender_chunk_embedding.py
│       │   ├── organization_profile_embedding.py
│       │   ├── match_score.py
│       │   ├── eligibility_checklist_item.py
│       │   ├── ingestion_run.py
│       │   └── ingestion_error.py
│       └── repositories/
│           └── tenant_scoped_repository.py  # Mirrors backend/libs/database's tenant-isolation invariant on the AI Engine side
├── tests/
│   ├── unit/
│   └── eval/                          # Runs against evaluation/gold_datasets in CI (AI_DESIGN.md §14 release gate)
├── pyproject.toml
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## 8. `frontend/` — Web Application (Next.js)

```
frontend/
├── app/
│   ├── layout.tsx                      # Root layout, theme/providers
│   ├── page.tsx                        # Marketing/landing → redirect to dashboard if authenticated
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx                  # Auth-gated shell: nav, organization switcher (US-8), notification feed
│       ├── dashboard/page.tsx          # Reports dashboard (FR-ANL-1)
│       ├── tenders/
│       │   ├── page.tsx                # Search/browse (FR-DIS-1/2)
│       │   └── [tenderId]/page.tsx     # Detail: AI summary, eligibility checklist, match score, Q&A
│       ├── alerts/page.tsx             # Saved searches (FR-DIS-3)
│       ├── pipeline/
│       │   ├── page.tsx                # Kanban board (US-5)
│       │   └── [pipelineItemId]/page.tsx  # Checklist tasks, draft sections, approval actions
│       ├── reports/page.tsx            # Funnel, win/loss, export (US-7)
│       ├── organization/
│       │   ├── settings/page.tsx
│       │   ├── members/page.tsx
│       │   ├── profile/page.tsx        # MSME profile (FR-IAM-5)
│       │   ├── certifications/page.tsx
│       │   └── billing/page.tsx
│       └── admin/                      # Only reachable to platform admins (mirrors Swagger `Admin` tag)
│           ├── ingestion-health/page.tsx   # US-10
│           ├── ai-metrics/page.tsx         # US-11
│           ├── organizations/page.tsx
│           └── dsr-requests/page.tsx
├── components/
│   ├── ui/                             # Design-system primitives: button, input, modal, table, badge, tabs
│   ├── layout/                         # navbar, sidebar, organization-switcher
│   ├── tenders/                        # match-score-badge, eligibility-checklist, deadline-countdown, tender-card
│   ├── pipeline/                       # kanban-board, checklist-task-item, draft-section-editor
│   └── reports/                        # funnel-chart, win-loss-chart, dashboard-tile
├── lib/
│   ├── api-client.ts                   # Typed HTTP client — one function per API_SPEC.md `operationId`
│   ├── auth.ts                         # Session/token helpers
│   ├── query-client.ts                 # React Query setup (caching aligned with API_SPEC.md cache semantics)
│   └── utils.ts
├── hooks/
│   ├── use-organization.ts
│   ├── use-tenders-search.ts
│   ├── use-pipeline.ts
│   └── use-notifications.ts
├── store/
│   └── active-organization.store.ts    # Client-side active-organization selection (org switcher state)
├── types/
│   └── api.ts                          # TS types mirroring API_SPEC.md request/response schemas
├── middleware.ts                       # Edge auth/session-refresh check
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── tests/
│   ├── unit/
│   └── e2e/                            # Playwright specs covering the golden paths per persona (Architecture.md §4)
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── .eslintrc.js
├── package.json
└── .env.example
```

---

## 9. Cross-Cutting Naming & Placement Conventions

| Rule | Applies To |
|---|---|
| One module/package per bounded domain, mirroring API_SPEC.md's Swagger tags and Architecture.md §9's module breakdown — never a domain split across two folders, never two domains merged into one. | `backend/apps/api/src/modules/*`, `ai-engine/app/*` |
| One entity/model file per DATABASE.md table, named as the singular of the table (`tenders` table → `tender.entity.ts` / `tender.py`). | `backend/libs/database/entities/*`, `ai-engine/app/db/models/*` |
| Frontend routes mirror Backend API resource nouns (`/tenders`, `/pipeline`, `/organization/*`) so a developer can find the corresponding endpoint in API_SPEC.md by folder name alone. | `frontend/app/(dashboard)/*` |
| Every service ships its own `.env.example` (never a shared root `.env`) — services are independently deployable (Architecture.md §8.3) and must not assume a shared process environment. | `backend/.env.example`, `ai-engine/.env.example`, `frontend/.env.example` |
| Tests live beside the app they test (`backend/test`, `ai-engine/tests`, `frontend/tests`), not centralized in a top-level `tests/` — keeps ownership unambiguous. | All three services |
| Nothing under `ai-engine/app/api/` is reachable except through `backend/apps/api/src/modules/ai/ai-gateway.service.ts` — enforced by network policy (Architecture.md §13.1), not just convention. | `ai-engine/app/api/*` |

---

## 10. Development Order (Build Sequence)

Phases are sequenced by dependency, not by team — several phases can run in parallel once their prerequisite phase is done (noted inline).

| Phase | Scope | Key Deliverables | Depends On |
|---|---|---|---|
| **1. Scaffolding** | Root configs, `docker-compose.yml`, `.github/workflows` skeletons, empty service shells with health-check endpoints only. | `docker-compose up` brings up empty but running containers. | — |
| **2. Database Foundation** | `backend/libs/database`: all entities, the baseline migration implementing DATABASE.md v1.1 in full, seed data (`subscription_plans`, `tender_categories`). | A running Postgres with the complete schema and `pgvector` enabled. | Phase 1 |
| **3. Backend Core Infrastructure** | `common/` (guards, interceptors, filters, pipes), `config/`, `health/`, `audit/` module. | Cross-cutting plumbing every feature module depends on — built once, reused everywhere (NFR-8). | Phase 2 |
| **4. Auth & Company** | `auth/` and `organizations/` modules (members, invitations, MSME profile, certifications). | A user can register, create an organization, invite teammates, and complete an MSME profile — everything downstream is organization-scoped, so this must exist first. | Phase 3 |
| **5. Ingestion + Parsing/Chunking/Embedding Foundation** | `ai-engine/app/ingestion`, `parsing`, `chunking`, `embeddings`, plus `tenders` read module in the Backend API. | Tenders flow end-to-end from a real source into Postgres, fully parsed, chunked, and embedded — no LLM-generated *content* yet (no summaries/eligibility), just clean structured/vector data users can search. | Phase 4 (organizations must exist to scope search), can start in parallel with Phase 4 on the AI Engine side |
| **6. Extraction, Compliance & Matching** | `ai-engine/app/extraction`, `matching`; Backend `ai/` module's summary/eligibility/match-score endpoints. | FR-AI-2, FR-AI-3, FR-AI-4 fully working: AI summaries, eligibility checklists, match scores visible per organization. | Phase 5 |
| **7. Bid Pipeline & Checklist** | Backend `pipeline/` module (stage transitions, approval gate, checklist tasks seeded from eligibility items). | The full bid-workspace state machine (US-5, US-12). | Phase 6 |
| **8. RAG, Chatbot, Draft Generation, Risk Detection** | `ai-engine/app/rag`, `chatbot`, `drafting`, `risk`; corresponding Backend `ai/` endpoints. | FR-AI-5, FR-AI-6, FR-BID-2 — the harder generative/retrieval features, deliberately sequenced after the deterministic extraction/matching foundation is proven. | Phase 6 |
| **9. Alerts & Notifications** | Backend `saved-searches/` module; `notification-worker` app and its processors/channels. | FR-DIS-3, FR-NOT-1/2. | Phase 5 (needs tenders + match scores to alert on) |
| **10. Reports** | Backend `reports/` module (dashboard, funnel, win-loss, export). | FR-ANL-1/2, US-7. | Phase 7 (needs pipeline outcome data to report on) |
| **11. Billing** | Backend `billing/` module, Razorpay integration, `usage_counters` metering wired into the `ai/` module's credit guard. | FR-SUB-1/2/3. | Phase 6 (AI-credit metering needs AI endpoints to meter) |
| **12. Admin** | Backend `admin/` module; corresponding frontend `admin/` routes. | US-10, US-11, DSR handling (NFR-11). | Phases 5–11 (surfaces operational data from all of them) |
| **13. Frontend Build-Out** | `frontend/app/(auth)`, then `(dashboard)` routes in the same order as the backend phases they depend on (Auth/Company → Tenders → Pipeline → AI features → Reports → Admin). | A usable UI tracking each backend phase roughly one phase behind. | Runs continuously alongside Phases 4–12, never ahead of the API it renders |
| **14. Observability** | OpenTelemetry instrumentation, Prometheus/Grafana dashboards, Loki log shipping, alert rules (Architecture.md §15–16) across all three services. | Full observability stack live in staging. | Phases 3–12 (instrument as each module lands, not bolted on at the end retroactively — but the *dashboards themselves* are finalized here) |
| **15. Security & Tenant-Isolation Hardening** | Full tenant-isolation automated test suite, dependency vulnerability scan wiring, secrets-management review, OWASP checklist pass. | CI gate required before first production deploy (Architecture.md §13). | Phases 4–12 |
| **16. Deployment** | `docker/k8s/overlays/staging` rollout → soak → `docker/k8s/overlays/production` rollout. | Production launch. | Phase 15 |

Within Phases 4–12, the **Backend module → AI Engine capability (where applicable) → Frontend route** ordering is deliberate and repeats every phase: an endpoint exists and is tested before the screen that calls it is built, and an AI Engine capability exists and is evaluated (AI_DESIGN.md §14 release gate) before the Backend endpoint that proxies to it is exposed.
