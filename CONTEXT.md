# TenderIQ — Project Context

*A condensed, self-contained summary for use as memory/context in external AI tools (ChatGPT, Gemini, etc.) that do not have access to this repository's `docs/` folder.*

> **Source of truth notice**: This file is a **summary**, not the authoritative spec. The real, detailed, versioned documents live in `docs/` (`architecture/Architecture.md`, `database/DATABASE.md`, `api/API_SPEC.md`, `ai/AI_DESIGN.md`, `PROJECT_STRUCTURE.md`, `engineering/ENGINEERING_GUIDE.md`). If this file ever appears to conflict with those, **the `docs/` files win** — flag the discrepancy rather than trusting this summary. Last synced: **2026-07-30**.

---

## 1. What TenderIQ Is

TenderIQ is an **AI Procurement Intelligence Platform for MSMEs** (Micro, Small, Medium Enterprises). MSMEs lose access to public/private tenders not from ineligibility but because discovering, reading, and qualifying for tenders across dozens of disconnected government/private portals is manual and expertise-intensive. TenderIQ continuously ingests tenders, uses AI to extract and structure them, matches them to a business's real eligibility profile, scores win-worthiness, and guides the user from discovery to submission.

Primary personas: an MSME owner with no dedicated bid desk (low digital literacy — drives accessibility/simplicity requirements), a dedicated bid manager at a larger MSME, a procurement consultant managing multiple client orgs, an internal platform ops admin, and an enterprise compliance officer needing an approval gate before submission.

---

## 2. Architecture (summary of `Architecture.md`)

**Three independently-deployable services**, no shared runtime process:

| Service | Tech | Role |
|---|---|---|
| **Frontend** | React/Next.js | User-facing web app. No business logic. |
| **Backend API** | Node.js/NestJS | Public REST API (implements `API_SPEC.md`). Owns Users, Organizations, Pipelines, Billing, Audit Log. Orchestrates everything; proxies AI features to the AI Engine. |
| **AI Engine** | Python/FastAPI | **Internal-only**, never internet-facing. Owns tender extraction, embeddings, match scoring, eligibility checklists, RAG, chatbot, draft generation. Also houses the tender **Ingestion** adapter layer (one connector per source: GeM, CPPP, state portals, private aggregators). |

**Key architectural rules (locked — do not silently change):**
- AI Engine is called only via the Backend API's `ai-gateway.service.ts`, which enforces AI-credit quota before proxying. No client ever talks to the AI Engine directly.
- Ingestion and AI extraction are entirely **async/queue-driven** (Redis + BullMQ) — never in a synchronous request path.
- Every AI-derived fact (extracted field, eligibility status, summary claim) must be traceable to a source document + page/clause. Corrections are versioned (`tender_field_corrections`), never silently overwritten.
- **Multi-tenant**: an "Organization" = one MSME's workspace. Roles: `owner`, `bid_manager`, `viewer`, plus a platform-wide `isPlatformAdmin` flag. Tenant isolation is enforced at the **data-access layer** (a `tenant-scoped.repository.ts` base class), not just in application logic — this is CI-enforced.
- Match Score and Risk-Clause flags are **advisory only**, never a hard filter — full search is always available; every score/flag shows its reasoning (no black-box scoring).
- Deployment: Docker containers, Kubernetes (namespaces: `frontend`, `backend`, `ai-engine`; the AI Engine namespace has no public Ingress entry).
- NFR highlights: 99.5% uptime (core reads), search p95 ≤ 500ms, AI generation p95 ≤ 8s, cost-efficiency is a first-class constraint (MSME-priced product — avoid enterprise-only managed services where an open-source-first equivalent exists), DPDP Act 2023 compliance for PII (GST/PAN).

---

## 3. Database (summary of `DATABASE.md`, v1.1)

**PostgreSQL 15+ with the `pgvector` extension** is the single online data store (chosen deliberately over a separate vector DB/Elasticsearch for cost efficiency). **33 tables** across 6 domains:

| Domain | Tables |
|---|---|
| Identity & Organization | `users`, `user_oauth_identities`, `organizations`, `organization_members`, `organization_invitations`, `msme_profiles`, `msme_certifications` |
| Tender Taxonomy & Ingestion | `tender_sources`, `tender_categories`, `tenders`, `tender_category_links`, `tender_documents`, `tender_field_corrections`, `ingestion_runs`, `ingestion_errors` |
| AI & Matching | `tender_embeddings`, `organization_profile_embeddings`, `tender_document_chunks`, `tender_chunk_embeddings`, `match_scores`, `eligibility_checklist_items` |
| Bid Workspace | `pipeline_items`, `checklist_tasks`, `bid_drafts`, `saved_searches` |
| Notifications | `notifications`, `notification_preferences` |
| Billing & Compliance | `subscription_plans`, `organization_subscriptions`, `invoices`, `usage_counters`, `audit_log`, `dsr_requests` |

**Conventions:**
- PKs are **app-generated UUIDv7** (time-ordered, non-guessable) — never DB-default v4, never integers.
- Naming: `snake_case`, plural table names, FK columns `<entity>_id`.
- **Soft-delete has three categories**: (A) user-owned resources carry `deleted_at` (users, orgs, pipeline items, etc.); (B) system-of-record rows (tenders, documents, embeddings, match scores) have no `deleted_at` — lifecycle is a `status` column, never deleted by users; (C) append-only ledgers (`audit_log`, `dsr_requests`) are never updated/deleted at all; a few tables (notifications, usage_counters) are retention-purged by a scheduled job, not user action.
- **Ownership boundary**: the AI Engine is the *only* writer of extracted tender fields, embeddings, match scores, and eligibility checklists. The Backend API is read-only on those and only writes user-generated overlay data (bookmarks-as-pipeline-entries, checklist tasks, notes).
- `pgvector` columns use `hnsw`/`ivfflat` indexes; embeddings are 1536-dim (Voyage AI), L2-normalized so cosine similarity = dot product.

---

## 4. Folder Structure (summary of `PROJECT_STRUCTURE.md`)

```
TenderIQ/
├── .github/workflows/     # CI (per-service) + tenant-isolation-ci + deploy-staging/production
├── docker/                # nginx.conf (local gateway), k8s/ (base + staging/production Kustomize overlays)
├── docs/                  # The 6 authoritative docs + this repo's own PROJECT_STRUCTURE.md, adr/
├── docker-compose.yml     # Local dev: postgres+pgvector, redis, minio, all 3 services, nginx
├── backend/               # NestJS monorepo
│   ├── apps/api/          # Public REST API — one module per Swagger tag (see §7)
│   ├── apps/notification-worker/  # Separate BullMQ-consuming app (Notification Service container)
│   └── libs/{common,database,config}/  # Shared guards/interceptors/filters, TypeORM entities+migrations, config
├── ai-engine/             # FastAPI, internal-only
│   └── app/{ingestion,parsing,chunking,embeddings,extraction,matching,risk,rag,chatbot,drafting,
│             prompts,guardrails,evaluation,workers,db,api/v1}/
└── frontend/              # Next.js App Router — routes mirror API resource nouns 1:1
    └── app/(auth)/, app/(dashboard)/{tenders,pipeline,reports,organization,admin,alerts}/
```

Rule: a new top-level folder always requires a same-PR update to `docs/PROJECT_STRUCTURE.md` — the doc must never drift from the real tree.

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Next.js (App Router, TS), TailwindCSS, React Query, Zustand |
| Backend API | Node.js + NestJS (TypeScript), TypeORM |
| AI Engine | Python + FastAPI, SQLAlchemy (async) |
| Database | PostgreSQL 15+ with `pgvector` |
| Cache / Queue | Redis + BullMQ |
| Object Storage | S3-compatible (AWS S3 prod / MinIO local) |
| LLM | Claude API (Anthropic) — summarization, extraction, RAG, drafting |
| Embeddings | Voyage AI (1536-dim) |
| Offline vector experimentation | FAISS — **offline/eval only**, never the live serving index (`pgvector` is) |
| Payments | Razorpay |
| Containers/Orchestration | Docker; Kubernetes (Kustomize base + staging/production overlays) |
| CI/CD | GitHub Actions |
| Observability | OpenTelemetry → Prometheus/Grafana; Loki for logs |

---

## 6. Coding Standards (summary of `ENGINEERING_GUIDE.md`)

- **TypeScript** (backend + frontend): `strict: true` everywhere; `any` banned (lint error); `interface` for extendable shapes, `type` for unions; `kebab-case` filenames; named exports only (except Next `page`/`layout`).
- **Python** (ai-engine): 3.11+, `ruff` + `black` (line length 100) + `mypy --strict`; Pydantic/frozen-dataclass immutability between pipeline stages; async-first, blocking work explicitly offloaded to a thread pool.
- **React**: functional components only; Server Components by default, `"use client"` only when truly needed; server data lives only in React Query, never duplicated into global state; accessibility (keyboard operability, semantic HTML) is a hard requirement.
- **FastAPI**: Pydantic v2 with `extra="forbid"` on every model — "internal-only" is a network boundary, not a trust boundary; every route declares `response_model=`.
- **SQL**: migrations only, never manual DDL; ORM/repository query path only (raw SQL limited to `pgvector`/full-text search, always parameterized); every FK indexed; no `SELECT *`; cursor pagination for any unbounded query.
- **Commits**: Conventional Commits (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `security`), imperative subject ≤72 chars, body explains *why* not *what*.
- **Branching**: trunk-based off `main`, short-lived `<type>/<slug>` branches, squash-merge only; no long-lived `develop`/`staging` branches — staging/prod are deployments of tagged commits.
- **Error handling**: fail-closed on any ambiguous authorization check; no silent catches; only idempotent operations are auto-retried.
- **Logging**: one shared structured-logging wrapper per language; `correlationId` auto-attached; PII (GST/PAN/tokens) auto-redacted by a maintained deny-list, not call-site discipline.
- **Security**: tenant isolation enforced via a mandatory base repository class, CI-checked; two-reviewer rule on any auth-path code; least-privilege DB roles per service.
- **Testing**: unit → integration → a small e2e layer covering only golden paths; mandatory tenant-isolation test suite; AI Engine has a release-gate evaluation suite (no metric regression tolerated) run in CI.
- **Docs**: any change that would make a `docs/` file inaccurate must update it in the *same PR*. Any change extending the locked architecture requires an ADR in `docs/adr/` *before* implementation.

---

## 7. API Summary (summary of `API_SPEC.md`)

- Base path `/v1`, served only by the Backend API (NestJS). URI versioning; breaking changes go to `/v2`, never retrofitted into `/v1`.
- **Auth**: Bearer JWT (15 min access token) + rotating refresh token in an `httpOnly` cookie. Google OAuth supported.
- **Uniform response envelope**: success → `{ "data": ..., "meta": {...} }`; error → `{ "error": { "code", "message", "details", "correlationId" } }`.
- **Pagination**: cursor-based (`limit` + opaque `cursor`) on **every** list endpoint — no offset pagination anywhere, by design, for consistency at scale.
- **Permissions**: resolved server-side from the authenticated session's `organization_members` row — a request for an org the caller has no membership in returns `404` (not `403`), to avoid leaking existence.

**Endpoint groups** (Swagger tags, one per NestJS module):

| Tag | Key endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `/login`, `/oauth/google`, `/refresh`, `/logout`, `GET /auth/me` |
| **Company** | `/organizations` CRUD, `/organizations/{id}/members`, `/invitations`, `/profile` (MSME profile), `/certifications`, `/subscription`, `/invoices`, `/usage`, `/notifications`, `/notification-preferences` |
| **Tender** | `GET /tenders` (search/filter/semantic query), `GET /tenders/{id}`, `/tenders/categories`, `/organizations/{id}/saved-searches` (alerts), `/organizations/{id}/pipeline-items` (Kanban), `/pipeline-items/{id}` (stage transitions + approval gate), `/checklist-tasks` |
| **AI** | `GET /tenders/{id}/summary`, `GET /organizations/{id}/tenders/{id}/eligibility`, `.../match-score`, `POST .../qa` (grounded Q&A), `POST /pipeline-items/{id}/draft-sections`, `POST /organizations/{id}/recompute-matches` — all metered against AI-credit quota |
| **Reports** | `/organizations/{id}/reports/dashboard`, `/pipeline-funnel`, `/win-loss`, `/export` (CSV/PDF) |
| **Admin** | `/admin/ingestion/{sources,runs,errors}`, `/admin/ai/extraction-confidence-trend`, `/admin/organizations`, `/admin/dsr-requests`, `/admin/metrics/platform`, `/admin/webhooks/razorpay` |

---

## 8. Current Status (as of 2026-07-30)

- **All 6 core documents are complete and approved (v1.0/v1.1)**: `Architecture.md`, `DATABASE.md`, `API_SPEC.md`, `AI_DESIGN.md`, `PROJECT_STRUCTURE.md`, `ENGINEERING_GUIDE.md`.
- **Full repository skeleton exists for all 3 services**, plus Docker/Compose/GitHub Actions/Kubernetes manifests — **no business logic and no AI logic yet**. Every controller/service/entity/model/guard is a structurally-correct, wired, empty placeholder (e.g., entities have only an `id` column; guards' `canActivate()` always returns `true`; internal AI routes return `{"status": "not_implemented"}`).
- **All three services were verified to actually build and run**, not just written: ai-engine's FastAPI app imports and passes `pytest`/`ruff`/`black`/`mypy --strict`; the backend builds, typechecks, lints, and passes a real e2e test hitting `/healthz`; the frontend's `next build` succeeds across all 22 routes.
- **Nothing has shipped to production.** No real database migrations have been run against a live environment (the baseline migration file is itself still a placeholder — real DDL is generated in a later phase). No real LLM/embedding calls have been wired up.
- **Next step**: Phase 4 of the development order in `PROJECT_STRUCTURE.md` §10 — implement the Auth and Company (Organizations) modules for real, since almost everything downstream is organization-scoped.

---

## 9. Rules (persistent, do not violate)

1. **One architecture, one database design, one folder structure, one coding standard, one API contract, one AI pipeline** — never change any of these without explicit user instruction. A required exception gets an ADR in `docs/adr/` first.
2. **Never regenerate previous work** — always read and build on what already exists.
3. **Never produce placeholder implementations when asked for production code** — but placeholders were explicitly requested for this scaffolding pass; don't confuse the two.
4. Documentation requests are answered with **production-quality, complete output** — no omitted sections, no summarizing away detail, unless the task is explicitly a summary (like this file).
5. **Tenant isolation is non-negotiable** and enforced in code (base repository class), not only convention.
6. **AI Engine is internal-only** — no client, and no future feature, calls it directly.
7. Every AI-derived claim must be **traceable to a source document**; low-confidence output is surfaced as "needs verification," never presented as fact.
8. Match scores and risk flags are **advisory, never blocking**.

---

## 10. Current Modules (scaffolded, structure-only)

**Backend (`apps/api`)**: `auth`, `organizations` (+ members, invitations, msme-profile, certifications), `billing` (+ Razorpay client), `notifications` (read-side), `tenders`, `saved-searches`, `pipeline` (+ checklist-tasks), `ai` (gateway to AI Engine + credit guard), `reports` (+ export), `admin` (+ webhooks), `audit`, `health`. Plus a separate `apps/notification-worker` app (4 queue processors).

**AI Engine**: `ingestion` (4 source connectors), `parsing` (OCR, PDF parser, table extractor), `chunking`, `embeddings`, `extraction` (2-pass), `matching` (rule engine, scorer, calibration), `risk` (clause classifier, peer-outlier detector), `rag` (retriever, reranker, Q&A), `chatbot` (tender-scoped + platform-help), `drafting`, `guardrails` (confidence scorer, citation validator), `evaluation` (incl. offline FAISS benchmarking), `workers` (3 queue consumers).

**Frontend**: `(auth)` routes (login/register/forgot/reset), `(dashboard)` routes — dashboard, tenders (+ detail), alerts, pipeline (+ detail), reports, organization (settings/members/profile/certifications/billing), admin (ingestion-health/ai-metrics/organizations/dsr-requests).

---

## 11. Future Modules / Scope (from `Architecture.md` §18 and `AI_DESIGN.md` §15)

- WhatsApp-based alerts and conversational Q&A (meets low-digital-literacy users on a familiar channel).
- Native mobile app (React Native) sharing the same API contract.
- Dedicated full-text search infra (OpenSearch) once tender volume/query latency crosses a documented threshold — decoupled from the primary transactional DB.
- Dedicated online vector store (e.g., Qdrant) if `pgvector` is outgrown — the offline FAISS harness is the benchmark used to decide *if/when*, not a pre-commitment.
- Multi-language support (Hindi + regional languages) for UI, extraction, and chatbot — data model already language-ready.
- Marketplace connecting MSMEs with vetted procurement consultants.
- Fuller AI-assisted bid-document drafting (beyond boilerplate sections) — always retaining mandatory human review, never auto-submission.
- Direct integration with government e-procurement submission APIs, strictly as an assist, never full automation.
- Blockchain-anchored audit trail for enterprise/compliance-sensitive customers.
- Anonymized peer win-rate benchmarking by sector/category.
- Multi-region deployment if growth or data-residency requirements justify it.
- Fine-tuned/smaller extraction model to cut per-tender AI cost at scale; active-learning loop feeding human corrections back into evaluation/few-shot sets; table-structure-aware extraction upgrade; streaming/agentic multi-turn retrieval for harder chatbot questions.
