# TenderIQ — Project Memory

*A living development tracker. Unlike the six authoritative documents in `docs/` (which define what TenderIQ **is**) and `CONTEXT.md` (a static external-AI-tool summary), this file tracks what has actually been **done**, what's next, and what's currently broken. It must be updated immediately after every completed module — not batched, not deferred.*

**Last Updated**: 2026-07-30

---

## 1. Completed Modules

| Module | Type | Status | Date |
|---|---|---|---|
| Architecture.md | Doc | ✅ Done (v1.0) | 2026-07-30 |
| DATABASE.md | Doc | ✅ Done (v1.1 — includes RAG chunk-storage addendum) | 2026-07-30 |
| API_SPEC.md | Doc | ✅ Done (v1.0) | 2026-07-30 |
| AI_DESIGN.md | Doc | ✅ Done (v1.0) | 2026-07-30 |
| PROJECT_STRUCTURE.md | Doc | ✅ Done (v1.1 — includes `docs/adr/`) | 2026-07-30 |
| ENGINEERING_GUIDE.md | Doc | ✅ Done (v1.0) | 2026-07-30 |
| CONTEXT.md | Doc | ✅ Done — condensed summary for external AI tools | 2026-07-30 |
| Repository skeleton — `frontend/` (Next.js) | Scaffold | ✅ Structure only, no business logic. Build verified (`next build` succeeds, all 22 routes). | 2026-07-30 |
| Repository skeleton — `backend/` (NestJS monorepo) | Scaffold | ✅ Structure only, no business logic. Build verified (`npm run build`, typecheck, lint, e2e `/healthz` all pass). | 2026-07-30 |
| Repository skeleton — `ai-engine/` (FastAPI) | Scaffold | ✅ Structure only, no AI logic. Verified (`pytest`, `ruff`, `black`, `mypy --strict` all pass). | 2026-07-30 |
| Docker / Compose / GitHub Actions / Kubernetes manifests | Infra | ✅ Done | 2026-07-30 |

**Nothing beyond scaffolding has been implemented.** No real business logic, no real AI logic, no live database migration, no live LLM/embedding integration.

---

## 2. Pending Modules

Per the development order in `docs/PROJECT_STRUCTURE.md` §10:

| Phase | Module | Status |
|---|---|---|
| 4 | Auth & Company (Organizations, members, MSME profile, certifications) | ⏭️ **Next up** |
| 5 | Ingestion + parsing/chunking/embedding foundation | Pending |
| 6 | Extraction, Compliance & Matching (real AI summaries/eligibility/match scores) | Pending |
| 7 | Bid Pipeline & Checklist (real stage-transition logic) | Pending |
| 8 | RAG, Chatbot, Draft Generation, Risk Detection | Pending |
| 9 | Alerts & Notifications (real dispatch) | Pending |
| 10 | Reports | Pending |
| 11 | Billing (real Razorpay integration) | Pending |
| 12 | Admin | Pending |
| 13 | Frontend build-out | Pending (continuous, tracks backend phases) |
| 14 | Observability (OpenTelemetry/Prometheus/Grafana/Loki wired for real) | Pending |
| 15 | Security & Tenant-Isolation Hardening | Pending |
| 16 | Deployment (staging → production) | Pending |

---

## 3. Folder Structure (current, condensed)

Full detail and file-by-file purpose: `docs/PROJECT_STRUCTURE.md`.

```
TenderIQ/
├── docs/            # 6 authoritative docs + docs/adr/
├── .github/         # CI workflows, CODEOWNERS, PR template
├── docker/          # nginx.conf, k8s/ (base + staging/production overlays)
├── docker-compose.yml, docker-compose.prod.yml
├── CONTEXT.md, PROJECT_MEMORY.md   # root-level living/summary docs
├── backend/         # NestJS monorepo: apps/api, apps/notification-worker, libs/{common,database,config}
├── ai-engine/       # FastAPI: app/{ingestion,parsing,chunking,embeddings,extraction,matching,risk,rag,chatbot,drafting,prompts,guardrails,evaluation,workers,db,api}
└── frontend/        # Next.js App Router: app/(auth)/, app/(dashboard)/
```

**Status**: matches `docs/PROJECT_STRUCTURE.md` exactly as of 2026-07-30. Any new top-level folder must update that doc in the same PR — flag here if this ever falls out of sync.

---

## 4. Architecture Summary

Three independently-deployed services: **Frontend** (Next.js, no logic), **Backend API** (NestJS — owns Users/Organizations/Pipelines/Billing/Audit, proxies AI features), **AI Engine** (FastAPI, **internal-only** — owns extraction/embeddings/matching/RAG/chatbot/drafting, also houses the tender ingestion connectors). Multi-tenant via "Organization" with roles `owner`/`bid_manager`/`viewer` + a platform-wide `isPlatformAdmin` flag. Tenant isolation enforced at the data-access layer, CI-checked. Ingestion/AI work is entirely async (Redis + BullMQ). Every AI-derived fact must be traceable to source; Match Score and risk flags are advisory only, never blocking. Full detail: `docs/architecture/Architecture.md`.

---

## 5. Database Summary

PostgreSQL 15+ with `pgvector` (single online store, no separate vector DB). 33 tables across 6 domains (Identity & Organization, Tender Taxonomy & Ingestion, AI & Matching, Bid Workspace, Notifications, Billing & Compliance). App-generated UUIDv7 PKs. Three soft-delete categories: (A) user-owned `deleted_at`, (B) system-of-record driven by `status` (never user-deleted), (C) append-only ledgers (`audit_log`, `dsr_requests`, never deleted). AI Engine is the sole writer of extracted fields/embeddings/scores/checklists; Backend API only writes user-overlay data. Full detail: `docs/database/DATABASE.md`.

**Status**: entities exist in `backend/libs/database/entities/` and `ai-engine/app/db/models/` but are currently **ID-only placeholders** — full column definitions per DATABASE.md are not yet implemented in code. The baseline migration file is a placeholder with empty `up()`/`down()`.

---

## 6. API Summary

Base path `/v1`, Backend API only (AI Engine never public). Bearer JWT (15 min) + rotating refresh cookie. Uniform envelope (`{ data, meta }` / `{ error: {...} }`). Cursor-based pagination everywhere. Six endpoint groups/Swagger tags: **Auth**, **Company** (orgs/members/profile/certifications/billing/notifications), **Tender** (discovery/alerts/pipeline), **AI** (summary/eligibility/match-score/qa/draft, credit-metered), **Reports**, **Admin**. Full detail: `docs/api/API_SPEC.md`.

**Status**: every controller exists and is wired into its module/app, but route handlers are empty (no `@Get`/`@Post` methods implemented yet, except `/healthz`/`/readyz` and the AI Engine's stub internal routes).

---

## 7. Current Branch

- **`main`** — trunk-based development (no long-lived environment branches; per `ENGINEERING_GUIDE.md` §9, staging/production are deployments of tagged commits, not branches).
- Working tree clean as of 2026-07-30.
- No feature branch currently checked out. The next unit of work (Phase 4: Auth & Company) should be branched as `feat/auth-and-company-module` per the `<type>/<slug>` convention.

---

## 8. Current Sprint

**Sprint 0 — Foundation** *(complete)*
Goal: establish the six authoritative documents, scaffold all three services + infra, verify everything compiles.
Status: ✅ Done, 2026-07-30.

**Sprint 1 — Auth & Company** *(not yet started)*
Goal: implement Phase 4 for real — working registration/login/OAuth, organization creation, membership/invitation flow, MSME profile + certifications CRUD, with the real baseline DB migration behind it.
Status: ⏭️ Next. No start date set — update this section when work begins.

*(This is a lightweight tracker, not a formal ceremony log. Update the sprint name/goal/status here as work actually starts and finishes — don't let it go stale.)*

---

## 9. Known Issues

| Issue | Area | Severity | Notes |
|---|---|---|---|
| Entities/models are ID-only stubs | backend, ai-engine | Blocker for Phase 4+ | Full DATABASE.md column sets not yet in code. |
| Baseline migration (`1730000000000-baseline-schema.ts`) has empty `up()`/`down()` | backend | Blocker for any real DB | Must be generated from completed entities before any environment is migrated. |
| `libs/common` guards/interceptors/filters/pipes are no-op placeholders | backend | Blocker for Phase 4+ | `JwtAuthGuard`, `OrganizationMembershipGuard`, `RolesGuard` all currently return `true` unconditionally — **not safe to deploy as-is**. |
| `DatabaseModule` not yet imported into `AppModule` | backend | Expected at this stage | Deferred until entities are real, to avoid requiring a live DB just to boot the skeleton. |
| AI Engine internal routes return `{"status": "not_implemented"}` | ai-engine | Expected at this stage | No LLM/embedding provider calls wired up yet. |
| `npm audit` flags transitive dev-dependency vulnerabilities (eslint 8.x's glob/minimatch chain) | backend, frontend | Low (dev-only, not shipped) | Real fix requires an eslint v9/v10 flat-config migration — tracked, not urgent. |
| No environment has ever been deployed | infra | Expected at this stage | `docker/k8s/` manifests are unexercised against a real cluster. |

---

## 10. Next Tasks

1. Branch `feat/auth-and-company-module` off `main`.
2. Implement real `AuthModule`: argon2id password hashing, JWT strategy (access + refresh), Google OAuth strategy, session/refresh-token registry in Redis.
3. Fill in full column definitions for the Identity & Organization domain entities (`users`, `organizations`, `organization_members`, `organization_invitations`, `msme_profiles`, `msme_certifications`) per DATABASE.md §7.1.
4. Generate the real baseline TypeORM migration from those entities; wire `DatabaseModule` into `AppModule`.
5. Implement `TenantScopedRepository`'s actual `organization_id` predicate injection; replace the no-op guards with real logic.
6. Implement the Organizations module's real endpoints (create/list/update org, members, invitations, MSME profile, certifications) per API_SPEC.md §7.
7. Add real unit + e2e tests for everything above, including the mandatory tenant-isolation suite.
8. **Update this document**: move Auth & Company from §2 to §1, update §7/§8, close out any resolved rows in §9, refresh §10.

---

## 11. Development Rules

- One architecture, one database design, one folder structure, one coding standard, one API contract, one AI pipeline — **never changed without explicit instruction**; any necessary exception gets an ADR in `docs/adr/` first.
- Never regenerate previous work — read and build on what exists.
- Any change that would make a `docs/` file inaccurate updates that file **in the same PR**.
- **This file is updated immediately after every completed module** — Completed/Pending move together, Known Issues and Next Tasks refreshed, no batching updates for later.
- Full coding/testing/security/commit/branching rules: `docs/engineering/ENGINEERING_GUIDE.md` — this file does not restate them, only tracks compliance status where relevant (see Known Issues).
