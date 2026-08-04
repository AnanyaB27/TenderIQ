# TenderIQ — Project Memory

*A living development tracker. Unlike the six authoritative documents in `docs/` (which define what TenderIQ **is**) and `CONTEXT.md` (a static external-AI-tool summary), this file tracks what has actually been **done**, what's next, and what's currently broken. It must be updated immediately after every completed module — not batched, not deferred.*

**Last Updated**: 2026-08-03 (session 2)

> **Note on this update**: Between the last update of this file and now, the GitHub repository received substantial real implementation work (Auth module, Organizations CRUD, Tenders CRUD, full entity column definitions for most domains) outside of what this file had recorded. Per instruction, the repository was treated as the source of truth and this file has been reconciled to match verified current reality rather than prior assumptions. If anything below still looks stale, trust the repository over this document and update it.

---

## 1. Completed Modules

| Module | Type | Status | Date |
|---|---|---|---|
| Architecture.md, DATABASE.md, API_SPEC.md, AI_DESIGN.md, PROJECT_STRUCTURE.md, ENGINEERING_GUIDE.md, CONTEXT.md | Docs | ✅ Done | 2026-07-30 |
| Repository skeleton — all 3 services + Docker/Compose/CI/K8s | Scaffold | ✅ Done | 2026-07-30 |
| **`DatabaseModule` wired into `AppModule`** | Bugfix | ✅ Fixed 2026-08-03 | Was never imported — every `@InjectRepository` across the whole app failed DI resolution at runtime despite `npm run build` passing (build only type-checks; it can't catch DI wiring gaps). Confirmed via boot test before/after. |
| **Auth module** — Google OAuth login/refresh only (no email/password auth exists; `UserEntity` has no password column) | Feature | ✅ Real implementation (pre-existing, verified working) | — |
| **Organizations module**: Organizations, Members, Invitations, MSME Profile CRUD | Feature | ✅ Real implementation (pre-existing) | — |
| **Organizations module**: Certifications CRUD | Feature | ✅ Completed 2026-08-03 | Found as an incomplete stub (empty controller/service, entity had only an `id` column, not registered in the module). Added real entity columns, DTOs, service, controller; registered in `organizations.module.ts`. |
| **Tenders module**: Tender, Category CRUD | Feature | ✅ Real implementation (pre-existing) | — |
| **Tenders module**: Documents, Sources, Category Links, Field Corrections CRUD | Feature | ✅ Completed 2026-08-03 | `TenderDocument` DTOs pre-existed but weren't wired to a service/controller; `TenderSource`/`CategoryLink`/`FieldCorrection` built from scratch against existing entity columns. |
| **Notifications module**: Notifications, Preferences CRUD | Feature | ✅ Completed 2026-08-03 | Was fully stubbed; built out completely. |
| **Pipeline module**: Pipeline Items, Checklist Tasks, Bid Drafts CRUD | Feature | ✅ Completed 2026-08-03 | Was fully stubbed; built out completely. |
| **Saved Searches CRUD** | Feature | ✅ Completed 2026-08-03 | Was fully stubbed; built out completely. |
| **Billing module**: Subscription Plans, Subscriptions, Invoices, Usage Counters CRUD | Feature | ✅ Completed 2026-08-03 | Was fully stubbed (and missing services for Invoices/Usage entirely); built out completely, including a new Plans controller/service that didn't exist before. |
| **Admin module**: DSR Requests CRUD | Feature | ✅ Completed 2026-08-03 | Was a stub; built out completely. |
| **Users module**: full CRUD on `UserEntity` | Feature | ✅ Completed 2026-08-03 (session 2) | No `users/` module existed at all before this — new module created from scratch, registered in `app.module.ts`. |

**Every item above was verified, not just written**: `npm run build` (typecheck) passed after each one, and a real boot test (`node dist/apps/api/src/main.js`) confirmed zero DI-resolution errors for each module in turn (only expected Postgres-connection retries, since no local DB is running in this environment).

### Entities intentionally left without public CRUD (documented decisions, not oversights)

| Entity/Group | Reasoning |
|---|---|
| `UserOauthIdentityEntity` | Stores raw `accessToken`/`refreshToken` OAuth credentials in plain columns, populated only inside `auth.service.ts`'s `loginWithGoogle()` flow. Exposing via CRUD would serialize live OAuth tokens into API responses — a credential-leak risk, not just a style call. Confirmed with the user before finalizing. |
| `IngestionRunEntity`, `IngestionErrorEntity` | Explicitly instructed as internal-ingestion-only; these are written by the (not-yet-built) ingestion worker process, never by a public POST. |
| `AuditLogEntity` | Has no `updatedAt` column at all (unlike every other entity) — a deliberate signal it's append-only. Matches Architecture.md's audit-ledger design. Left as the existing internal-only `AuditModule` (no public controller), not given CRUD. |
| AI-domain entities (`TenderEmbedding`, `OrganizationProfileEmbedding`, `TenderDocumentChunk`, `TenderChunkEmbedding`, `MatchScore`, `EligibilityChecklistItem`) | Architecture.md's explicit ownership boundary: the AI Engine is the sole writer of these; the Backend API is read-only. Not user-CRUDable by design, regardless of column completeness. |
| AI module (`ai.controller.ts`, gateway/credit-guard services), Reports module, and Admin's `ingestion-health`/`ai-metrics`/`organizations-admin`/`platform-metrics`/`webhooks` controllers | Still stubs — but these are specialized aggregation/proxy/webhook endpoints, not single-entity CRUD, so they don't fit the "create/findAll/findOne/update/remove" pattern this pass was scoped to. Left untouched rather than forced into a CRUD shape that doesn't match their purpose. |

---

## 2. Pending Modules

| Module | Status |
|---|---|
| AI Engine (`ai-engine/` FastAPI service) — real extraction/embedding/matching/RAG/chatbot logic | Pending — still skeleton-only (routes return `not_implemented`) |
| Backend `ai/` module — real proxying to the AI Engine + credit metering | Pending — stub |
| Backend `reports/` module — dashboard/funnel/win-loss aggregation queries | Pending — stub |
| Backend `admin/` — ingestion health, AI metrics, org support tools, platform metrics, Razorpay webhook | Pending — stub (see reasoning above; not simple CRUD) |
| `libs/common` guards (`JwtAuthGuard`, `OrganizationMembershipGuard`, `RolesGuard`) | **Still no-op placeholders** — every guard's `canActivate()` unconditionally returns `true`. Every endpoint built so far (including everything completed today) is **unauthenticated and unauthorized in practice**. Not safe to expose publicly as-is. |
| Real baseline TypeORM migration | Still a placeholder (`1730000000000-baseline-schema.ts` has empty `up()`/`down()`) — no environment has ever actually been migrated against these entities. |
| `docs/database/DATABASE.md` reconciliation | The actual entities (column names, enums, relations) have diverged substantially from what DATABASE.md v1.1 specifies (e.g., `TenderEntity` has different fields entirely). This file was not updated to match — flagged here rather than silently left inconsistent. Worth a dedicated pass. |
| Frontend / ai-engine build-out | Unchanged since 2026-07-30 — still skeleton-only. |
| Observability, security hardening, deployment | Unchanged — still pending per the original phase plan. |

---

## 3. Folder Structure (current, condensed)

Unchanged from 2026-07-30 at the top level — see `docs/PROJECT_STRUCTURE.md`. Within `backend/apps/api/src/modules/`, every module folder now contains real DTOs/services/controllers for the entities listed in §1 (previously many were empty stubs).

---

## 4. Architecture Summary

Unchanged — see `docs/architecture/Architecture.md`. Note: the **actual implementation does not yet enforce tenant isolation or authentication** (see guards note in §2) — this is a live gap between the documented architecture (§13.3: tenant isolation enforced at the data-access layer, CI-checked) and current code. Flagging prominently since it's a security-relevant discrepancy, not a cosmetic one.

---

## 5. Database Summary

PostgreSQL + TypeORM, entities living in `backend/libs/database/entities/`, imported via the `@app/database/entities/...` path alias (primary convention; a handful of early files — `organizations.service.ts`, `organizations.controller.ts`, `members.service.ts`, auth files — still use relative imports instead; left as-is per "don't refactor completed modules"). Most entities now have real, complete column definitions — the exceptions are the AI-domain entities (still ID-only stubs by design, per §1) and the ingestion entities (fully columned but intentionally not CRUD-exposed).

**Divergence from `docs/database/DATABASE.md`**: real entity schemas differ meaningfully from the documented v1.1 spec (different field names, different enums, no `pgvector` usage evident yet, etc.). Treat the actual entity files as ground truth for now; DATABASE.md needs a reconciliation pass.

---

## 6. API Summary

Base path is NOT currently prefixed with `/v1` in the running app (no global prefix configured in `main.ts` as of this check) — differs from API_SPEC.md's documented convention. Controllers use flat resource routes (e.g., `organizations`, `organizations/members`, `tenders/documents`, `subscription-plans`) rather than API_SPEC.md's nested-path design (e.g., `organizations/{id}/members`) — foreign keys like `organizationId` are carried in the request body/DTO instead of the URL path. This is the **actual established convention** in the real, working code (confirmed by inspecting `organizations`/`tenders` before writing anything new) and was followed exactly for all new modules per instruction to use the existing architecture, not API_SPEC.md's original design. API_SPEC.md itself was not updated to match — another documentation-vs-code gap worth a dedicated reconciliation pass.

Standard CRUD shape confirmed across every module: `POST /` (create), `GET /` (findAll, ordered by `createdAt DESC` unless a more specific order applies), `GET /:id` (findOne, 404 via `NotFoundException`), `PATCH /:id` (update via `repository.merge` + `save`), `DELETE /:id` (remove, returns `{ success, message }`). Every DTO pair follows `Create*Dto` + `Update*Dto extends PartialType(Create*Dto)`, exported from a per-module `dto/index.ts` barrel.

---

## 7. Current Branch

- **`main`** — working tree had substantial uncommitted changes as of this session's work (all changes described in §1); not committed by this session since committing wasn't requested. Confirm with the user before committing/pushing.

---

## 8. Current Sprint

**Sprint 2 — Entity CRUD completion** *(2026-08-03, both sessions)*
Goal: inspect the real repository, classify every remaining entity as public-CRUD vs. internal-only, and implement every missing CRUD module to completion with build+boot verification after each.
Status: ✅ **Done — no entity requiring public CRUD remains unimplemented.** Final gap (Users module) closed in session 2. AI Engine, Reports, and specialized Admin endpoints remain out of scope by design (see §2) — they are not entity CRUD.

**Sprint 3 — Auth enforcement + real migration** *(not started)*
Goal: replace the no-op guards with real JWT/role/tenant-membership checks; generate and run the real baseline migration against a live Postgres; reconcile DATABASE.md/API_SPEC.md with actual code.
Status: ⏭️ Recommended next, given the guards-are-no-op finding is a real exposure if anything here gets deployed as-is.

---

## 9. Known Issues

| Issue | Area | Severity | Notes |
|---|---|---|---|
| Guards are no-op (`canActivate()` always `true`) | backend | **High — not safe to deploy** | Every endpoint, old and new, is effectively unauthenticated/unauthorized right now. |
| Baseline migration still a placeholder | backend | Blocker for any real DB | No environment has ever been migrated; `synchronize: false` everywhere, so nothing will auto-create tables either. |
| DATABASE.md / API_SPEC.md no longer match actual code | docs | Medium | Divergence grew during the real-implementation work done outside this file's tracking; needs a dedicated reconciliation pass, not fixed in this session (out of scope for the CRUD task given). |
| No global `/v1` prefix in `main.ts` | backend | Low | API_SPEC.md documents one; actual routes are unprefixed. |
| `npm audit` dev-dependency findings (eslint 8.x chain) | backend, frontend | Low | Unchanged from 2026-07-30; still not urgent. |
| AI Engine, Reports, most of Admin are still stubs | backend, ai-engine | Expected | See §2. |

---

## 10. Next Tasks

1. Decide with the user whether to commit today's work (Certifications, Tender sub-entities, Notifications, Pipeline, SavedSearches, Billing, DSR Requests, Users, the `DatabaseModule` fix) — nothing was committed automatically.
2. Implement real tenant/role/JWT enforcement in `libs/common/guards/*` — currently the single highest-severity gap.
3. Generate the real baseline TypeORM migration from the now-mostly-complete entities; stand up a real Postgres (`docker-compose up postgres`) and verify a live boot + a real CRUD round-trip (this session could only verify DI wiring up to the connection attempt, since no local Postgres was running).
4. Reconcile `docs/database/DATABASE.md` and `docs/api/API_SPEC.md` against actual current entities/routes, or explicitly amend them to document the real conventions (flat routes, body-carried FKs, `@app/database` alias, etc.) as the new baseline.
5. Build out the AI Engine, Reports module, and the remaining specialized Admin endpoints.
6. **Update this document** immediately after any of the above lands.

---

## 11. Development Rules

- One architecture, one database design, one folder structure, one coding standard, one API contract, one AI pipeline — **never changed without explicit instruction**; any necessary exception gets an ADR in `docs/adr/` first.
- **The repository is the source of truth when it disagrees with this file, memory, or prior conversation context.** Always inspect actual current code before continuing work.
- Never regenerate previous work, never rename/move/reorganize files, never refactor a module that's already complete — extend or add alongside it.
- Follow the *actual* established convention in working code over any documented-but-unimplemented design when the two disagree (e.g., flat routes over nested paths, `@app/database` alias imports, plain `@InjectRepository` — no custom repository base classes, no generic CRUD abstractions, no interceptors/CQRS introduced).
- Every completed feature is verified with a build (`npm run build`) and, where feasible, a boot test — not just "it compiles."
- **This file is updated immediately after every completed module.**
- Full coding/testing/security/commit/branching rules: `docs/engineering/ENGINEERING_GUIDE.md` — note it also is not fully in sync with actual practice (e.g., no custom repository classes are in use, contra its tenant-scoped-repository guidance) and may need reconciliation alongside DATABASE.md/API_SPEC.md.
