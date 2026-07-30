# TenderIQ — Engineering Guide

## Document Control

| Field | Value |
|---|---|
| Document | ENGINEERING_GUIDE.md |
| Product | TenderIQ — AI Procurement Intelligence Platform for MSMEs |
| Version | 1.0 (Baseline) |
| Status | Approved — Authoritative Source of Truth for coding standards, workflow, and quality gates |
| Owner | Chief Software Architect |
| Last Updated | 2026-07-30 |
| Change Policy | This is the single coding standard for TenderIQ (Architecture.md NFR-8). It does not restate *what* to build — see Architecture.md, DATABASE.md, API_SPEC.md, AI_DESIGN.md, PROJECT_STRUCTURE.md for that — only *how* code in this repository is written, reviewed, committed, and shipped. |
| Related Documents | [Architecture.md](../architecture/Architecture.md) · [DATABASE.md](../database/DATABASE.md) · [API_SPEC.md](../api/API_SPEC.md) · [AI_DESIGN.md](../ai/AI_DESIGN.md) · [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) |

---

## 1. Python Standards (`ai-engine/`)

| Rule | Detail |
|---|---|
| Version | Python 3.11+, pinned exactly in CI and in `ai-engine/Dockerfile`. |
| Style & Lint | `ruff` for linting and import ordering, `black` for formatting (line length 100), both run as pre-commit hooks and again in `ai-engine-ci.yml` (PROJECT_STRUCTURE.md §3) — a PR cannot merge with either failing. |
| Typing | `mypy --strict`. Every public function/method is fully type-hinted (parameters and return type); an untyped `Any` requires an inline justification comment explaining why a precise type isn't possible (e.g., a genuinely dynamic third-party payload). |
| Data structures | Pydantic v2 models (or `@dataclass(frozen=True)` where no validation is needed) for every value passed between pipeline stages (`parsing → chunking → embeddings → extraction`, AI_DESIGN.md) — mutable shared state crossing a stage boundary is not allowed; each stage receives an immutable input and returns a new immutable output. |
| Naming | `snake_case` for functions/variables/modules, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants — matches PROJECT_STRUCTURE.md's `ai-engine/app/*` file naming exactly. |
| Docstrings | Google-style, added only where the *why* isn't obvious from the name and type hints (e.g., a non-obvious confidence-scoring formula, AI_DESIGN.md §11) — never a docstring that just restates the function name in sentence form. |
| Async discipline | I/O-bound code (LLM calls, DB queries, HTTP calls to tender sources) is `async def` throughout. Blocking libraries (OCR, PDF parsing, offline FAISS jobs, AI_DESIGN.md §1/§2/§5) are explicitly dispatched via a thread/process pool (`asyncio.to_thread` or an executor) — never called synchronously inside an `async def` route or worker handler. |
| Dependency management | `pyproject.toml` + a committed lockfile; direct dependencies pinned to a major-version range, transitive dependencies pinned exactly in the lockfile. No dependency is vendored/copy-pasted into the repo. |
| Exceptions | A single project-specific exception hierarchy (`AIEngineError` base; see §10 Error Handling) — no bare `except:`, no catching `Exception` without re-raising a translated, specific error. |

---

## 2. TypeScript Standards (`backend/`, `frontend/`)

| Rule | Detail |
|---|---|
| Compiler options | `strict: true` (which implies `noImplicitAny`, `strictNullChecks`, etc.) in every `tsconfig.json` — no service is allowed to opt out. |
| `any` | Banned via `@typescript-eslint/no-explicit-any` set to `error`. Use `unknown` plus a type guard, or a proper generic. A disabled rule at a call site requires an inline comment stating why no precise type exists. |
| `interface` vs `type` | `interface` for object shapes meant to be extended/implemented (DTOs, entity-adjacent shapes); `type` for unions, intersections, and utility-type compositions. This is a fixed convention specifically so it never becomes a recurring PR bikeshed. |
| Naming | `camelCase` (variables/functions), `PascalCase` (classes/types/interfaces/React components), `UPPER_SNAKE_CASE` (true constants), `kebab-case` filenames — consistent with every filename already fixed in PROJECT_STRUCTURE.md (e.g. `organization-membership.guard.ts`). |
| Imports | Absolute path aliases (`@/modules/...`, `@/lib/...`) beyond one directory level — no `../../../` chains three or more levels deep. |
| Exports | Named exports everywhere, except Next.js `page.tsx`/`layout.tsx` files where the framework requires a default export. |
| Async | `async`/`await` only. Raw `.then()` chains and unpromisified callback-style APIs are not permitted in new code. |
| Validation | Every NestJS DTO uses `class-validator` + `class-transformer` decorators; the global `ValidationPipe` runs with `whitelist: true, forbidNonWhitelisted: true` — the runtime enforcement of the whitelist-validation rule already fixed in API_SPEC.md §3.1. |
| Shared lint/format config | One internal `@tenderiq/eslint-config` (and matching Prettier config) consumed by both `backend/` and `frontend/`, so rules never silently diverge between the two TypeScript codebases — one coding standard, not two. |

---

## 3. React Standards (`frontend/`)

| Rule | Detail |
|---|---|
| Components | Functional components only; no class components anywhere in new or modified code. |
| Server vs. Client | Server Components by default (Next.js App Router default). A component is marked `"use client"` only when it genuinely needs interactivity, browser APIs, or local state — list/detail pages fetch data server-side rather than via a client-side `useEffect` fetch, per the SSR rationale already fixed in Architecture.md §8.1. |
| State | Local UI-only state uses `useState`/`useReducer`. Server data lives exclusively in React Query (`frontend/lib/query-client.ts`, PROJECT_STRUCTURE.md §8) — it is never duplicated into a global client store. The dedicated `store/` directory is reserved for genuinely cross-cutting client-only state (e.g. active-organization selection), nothing else. |
| Props | Every component's props are typed via an explicit `interface <ComponentName>Props` — no inline object-type props repeated across call sites. |
| Composition | Favor children/render-prop composition over a component that branches its internal rendering on a growing list of boolean props. |
| Accessibility | Every interactive element is keyboard-operable; semantic HTML (`<button>`, `<nav>`, `<label>`) is used over generic `<div onClick>` patterns. This is treated as a hard requirement, not an enhancement — Persona "Priya" (Architecture.md §4, low digital literacy) is directly served by a low-friction, accessible UI. |
| Styling | TailwindCSS utility classes co-located with markup; shared design tokens (color, spacing, typography scale) live only in `tailwind.config.ts` — no hard-coded hex values or magic pixel numbers inline. |
| File organization | One component per file, filename matches the exported component name, unit test co-located as `<Component>.test.tsx` beside it (distinct from the centralized `frontend/tests/e2e` Playwright suite, PROJECT_STRUCTURE.md §8). |
| Prop drilling | Not permitted beyond two levels — extract a context provider or restructure composition instead. |

---

## 4. FastAPI Standards (`ai-engine/app/api/`)

| Rule | Detail |
|---|---|
| Schemas | Pydantic v2 for every request/response model, with `model_config = ConfigDict(extra="forbid")` on every input model — mirrors the NestJS DTO whitelist discipline (§2) even though this API is internal-only (Architecture.md §9.3): "internal" is a network boundary, not a trust boundary. |
| Dependency injection | Shared concerns (DB session, internal-auth context, settings) are provided via `Depends()` — no I/O-holding singleton instantiated at import time. |
| Routing | One router per internal endpoint group, exactly matching `ai-engine/app/api/v1/*_router.py` (PROJECT_STRUCTURE.md §7); each router declares an explicit `prefix` and `tags`, included from `main.py`. |
| Async handlers | Every route handler is `async def`; genuinely blocking work is dispatched to a thread/process pool (§1), never awaited-in-place inside the handler body. |
| Response contracts | Every route declares `response_model=` explicitly — no bare `dict` return relied on implicitly — so the internal contract (Architecture.md §9.3) is enforced by the framework, not only by documentation. |
| Internal auth | The shared service-to-service token check (Architecture.md §13.1) is a single `Depends()`-based guard applied at the router/app level, never re-implemented per endpoint. |
| API docs exposure | OpenAPI generation stays enabled for internal debugging but is never served outside the private network — this service is not internet-facing under any configuration. |
| Worker/API separation | `app/workers/*.py` (queue consumers) never imports from `app/api/*` — workers and the FastAPI app are separate entrypoints sharing only the domain packages (`parsing/`, `extraction/`, `matching/`, etc.), keeping the HTTP surface and the async worker surface fully decoupled. |

---

## 5. SQL Standards

| Rule | Detail |
|---|---|
| Schema changes | Migrations only (DATABASE.md §12) — no manual `ALTER`/`CREATE` against any environment, staging included, ever. |
| Reversibility | Every migration ships an `up`/`down` pair where feasible; a genuinely irreversible migration is called out explicitly in its PR description, never merged silently. |
| Query path | All queries go through the ORM query builder or a named repository method. Raw SQL is permitted only for `pgvector` similarity operators and full-text search expressions the ORM can't express — always parameterized (never string-interpolated), always isolated inside a named repository method, never inline in a service/controller. |
| DB-side naming | Entity decorators explicitly set the table/column name to match DATABASE.md §2's `snake_case` convention — never left to the ORM's auto-pluralization/case-conversion defaults, so the DB-side name is never implicit. |
| Indexing discipline | Every foreign key column is indexed (DATABASE.md §10); a migration adding an FK without its matching index fails the PR checklist (§14). |
| Column selection | `SELECT *` is banned outside genuinely generic admin tooling — every query selects only the columns it uses, both for performance and so a column rename's blast radius is visible in the diff. |
| Bounded result sets | Any query that could return an unbounded number of rows goes through the cursor-pagination convention (API_SPEC.md §3.5) — no "fetch all, paginate in application memory." |
| Transactions | Any operation touching more than one table that must be atomic (e.g., a pipeline stage transition plus its `audit_log` write, DATABASE.md §6) is wrapped in one database transaction at the service layer — never two independent `save()` calls assumed to succeed together. |

---

## 6. Naming Conventions

Per-language naming is fixed in §1–§4 above and in DATABASE.md §2 (schema) / API_SPEC.md (endpoints, `operationId`s). This section covers everything else:

| Element | Convention | Example |
|---|---|---|
| Environment variables | `UPPER_SNAKE_CASE`, prefixed by concern | `DB_HOST`, `REDIS_URL`, `AI_LLM_API_KEY`, `RAZORPAY_WEBHOOK_SECRET` |
| Docker image tags | `tenderiq/<service>:<git-sha-short>` for CI builds; `tenderiq/<service>:<semver>` for releases | `tenderiq/backend-api:a1b2c3d`, `tenderiq/ai-engine:1.4.0` |
| Kubernetes resource names | `<service>-<component>` | `backend-api-deployment`, `ai-engine-hpa`, `notification-worker-deployment` |
| Feature flags | `snake_case`, verb-first, never a double negative | `enable_whatsapp_alerts` (never `disable_no_whatsapp_alerts`) |
| Git branches | See §9 Branching Strategy | `feat/pipeline-approval-gate` |

---

## 7. Folder Rules

PROJECT_STRUCTURE.md is the authoritative layout; this section states the *rules* that keep it true, not the tree itself.

- A new top-level folder in any service requires a PROJECT_STRUCTURE.md update **in the same PR** — the documented tree must never silently drift from the real repository.
- One bounded domain per module folder (Architecture.md §9, restated at the filesystem level): a file never serves two domains' concerns; a file that starts mixing concerns is split into two, never annotated with section-comment dividers to fake separation.
- No circular folder-level imports (e.g., `modules/tenders` importing from `modules/pipeline` and vice versa) — shared logic moves to `libs/common` or `libs/database`; a module never reaches into another module's internals to work around this.
- Tests live beside or in a path mirrored immediately under the code they test (PROJECT_STRUCTURE.md §9) — never a single flat top-level dumping ground unrelated to the module structure.
- Build output (`dist/`, `.next/`, `__pycache__/`) is never committed — enforced by `.gitignore` and a CI check that fails the build if generated artifacts appear in a diff.

---

## 8. Commit Rules

- **Format**: Conventional Commits — `<type>(<scope>): <subject>`. Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `security`. Scope names the module/service touched, e.g. `feat(pipeline): add approval gate transition`.
- Subject line ≤ 72 characters, imperative mood ("add", not "added"/"adds"), no trailing period.
- The commit **body** (when present) explains *why*, never *what* — the diff already shows what changed; this mirrors the project-wide rule against narrating obvious things in comments (§14).
- One logical change per commit — a commit touching both a schema migration and an unrelated lint-config fix is split into two.
- A commit that changes schema, API contract, or architecture references the doc section it implements, e.g. `feat(billing): add usage_counters flush job (DATABASE.md §7.6)` — keeps the doc-to-code link traceable in `git log`, not just in the PR description.
- No `--no-verify`, no force-push to `main`, no merging with failing pre-commit hooks bypassed — the project's global Git Safety Protocol applies to every contributor, no exceptions.
- Commits touching `libs/common/guards/*`, `libs/database/repositories/tenant-scoped.repository.ts`, or any other security-sensitive path (§12) require signed commits, as an extra provenance guarantee on tenant-isolation-critical code specifically.

---

## 9. Branching Strategy

- **Trunk-based development** off `main`, with short-lived feature branches named `<type>/<short-slug>` (same `type` vocabulary as §8), e.g. `feat/pipeline-approval-gate`, `fix/eligibility-null-turnover`.
- `main` is always deployable. Every PR must pass `backend-ci.yml`, `ai-engine-ci.yml`, `frontend-ci.yml`, and — where applicable — `tenant-isolation-ci.yml` (PROJECT_STRUCTURE.md §3) before merge.
- **Squash-merge only** — `main`'s history is one commit per PR, so the Conventional Commits discipline (§8) is meaningful at the `main` history level even when a working branch had messy WIP commits along the way.
- **No long-lived environment branches.** Staging and production are *deployments of specific commits/tags off `main`* (`deploy-staging.yml`, `deploy-production.yml`), never separate branches that need to be kept in sync — this avoids the classic `develop`/`main` merge-drift failure mode entirely.
- **Releases**: tagged `v<major>.<minor>.<patch>` (semver) from `main`, triggering `deploy-production.yml`; a manual approval gate sits between tag creation and the actual production rollout (Architecture.md §12).
- **Hotfixes**: branched from the last production tag as `hotfix/<slug>`, merged back to `main` immediately after release — never left to diverge from `main` for more than the fix's lifetime.
- **PR requirements**: at least one approving review from the relevant `CODEOWNERS` path (two for the security-sensitive paths named in §12), all required CI checks green, and the PR checklist (§14) completed before merge.

---

## 10. Error Handling

- **Backend (NestJS)**: every thrown error is either a known `HttpException` subtype mapped to one of the exact `error.code` values in API_SPEC.md §13, or is caught by the global exception filter (`http-exception.filter.ts`, PROJECT_STRUCTURE.md §6) and converted to `INTERNAL_ERROR` with a fresh `correlationId` — a raw unhandled exception must never reach a client as a stack trace or a framework-default error page.
- **AI Engine (FastAPI)**: a single exception hierarchy (`AIEngineError` base; `ExtractionError`, `RetrievalError`, `EmbeddingGenerationError`, `LLMProviderError` subclasses) is caught by one shared exception handler mapping each to the correct HTTP status for the internal contract. The Backend API's `ai-gateway.service.ts` treats an `LLMProviderError`-mapped `503` as retryable-degraded (`AI_ENGINE_UNAVAILABLE`, API_SPEC.md §13) — never surfaced to the user as a hard failure without translation.
- **Fail closed on ambiguous authorization**: any error or exception raised *during* a permission check (tenant-isolation check, role check, §12) results in denial, never a fallback to "allow." An exception during a security decision means "no," not "undecided → yes."
- **No silent catches**: a `catch`/`except` block that swallows an error without logging it (§11) or re-throwing a translated error is a review-blocking finding — every error is handled meaningfully or surfaced, never absorbed silently.
- **Retries**: only idempotent operations are retried automatically (queue job processing, AI Engine calls) with exponential backoff and a bounded max-attempt count. Non-idempotent operations (e.g., a payment webhook side effect, API_SPEC.md §11.3) rely on the operation's idempotency key, never on blind retries.
- **User-facing messages**: always the `error.message` from the standard envelope (API_SPEC.md §3.2) — never a raw exception message or stack trace, in any environment's UI.

---

## 11. Logging

Architecture.md §15 defines the overall strategy (structured JSON, correlation IDs, levels, retention). This section fixes the code-level rules that make that strategy true in practice:

- One shared structured-logging wrapper per language (`libs/common` logging module for the Node services, `app/logging.py` for the AI Engine) — no direct `console.log`/`print` in shipped application code; a lint/ruff rule enforces this, with the only exception being genuinely one-off local scripts kept outside the shipped app.
- Every log call carries `correlationId` automatically, pulled from request-scoped context (async-local storage in Node, `contextvars` in Python) — a developer never manually threads it through, removing the most common way correlation IDs get silently dropped mid-call-chain.
- PII redaction happens at the logging-wrapper level, not by call-site discipline: a maintained deny-list (`gstNumber`, `panNumber`, `password`, `accessToken`, `refreshToken`, and equivalents) is automatically masked before a log line is serialized, even if a developer accidentally logs a full object containing one of these fields.
- Log-level discipline: `DEBUG` defaults to off in production (a runtime flag, not a rebuild, controls it); `INFO` is reserved for genuine business events (Architecture.md §15's examples) — a PR that logs `INFO` inside a hot loop or on every request without cause is rejected in review.
- Every `ERROR`/`CRITICAL` log includes enough structured context (entity type/id, organization id where applicable) to locate the affected row without a follow-up query — a bare "something went wrong" message is a review-blocking finding.

---

## 12. Security

Architecture.md §13 is the authoritative security architecture. This section is the code-level checklist that operationalizes it:

- **Tenant isolation**: every repository method touching an organization-scoped table extends `tenant-scoped.repository.ts` (backend) / `tenant_scoped_repository.py` (AI Engine), per PROJECT_STRUCTURE.md §6–7. A raw query bypassing that base class on a scoped table is a hard PR-blocking finding, and is additionally caught automatically by `tenant-isolation-ci.yml`.
- **Input validation**: whitelist validation (API_SPEC.md §3.1) is non-negotiable on every externally-reachable endpoint; internal AI Engine endpoints validate just as strictly (`extra="forbid"`, §4) — "internal" is a network boundary, not a trust boundary.
- **Secrets**: never committed, never logged (§11), loaded only from the runtime secret store (Architecture.md §13.5). A pre-commit hook scans for high-entropy strings and known key patterns before a commit is created locally, as a first line of defense before CI even runs.
- **Dependency hygiene**: automated vulnerability scanning runs on every PR (`npm audit`/equivalent for Node, `pip-audit`/equivalent for Python); a new dependency carrying a known critical CVE blocks merge. Existing dependencies are patched on a defined cadence, not only reactively after a disclosure.
- **Least privilege**: each service's runtime database role has only the grants its ownership boundary requires (DATABASE.md §1, §6) — the Backend API's role has no `UPDATE`/`DELETE` grant on `audit_log`; the AI Engine's role has no grant at all on billing-related columns it never touches.
- **Output encoding**: user-supplied free text rendered in the frontend always goes through React's default JSX escaping — `dangerouslySetInnerHTML` is never used without an explicit, reviewed sanitization step (Architecture.md §13.4).
- **Elevated review bar**: any change to `auth/`, `jwt.strategy.ts`, `google-oauth.strategy.ts`, or `organization-membership.guard.ts` requires two reviewer approvals regardless of PR size — the standard one-reviewer rule (§9) is explicitly raised for authentication/session code.

---

## 13. Testing

- **Test pyramid**: unit tests (fast, no I/O) form the base; integration tests (real Postgres/Redis via a `docker-compose` test profile, no external network) sit in the middle; a small set of end-to-end tests (Playwright against a fully running local stack) sit at the top, covering only the golden path per persona (Architecture.md §4) — exhaustive edge-case coverage belongs at the unit level, not the e2e level.
- **Coverage philosophy**: a numeric coverage percentage is tracked but is not itself the merge gate. The actual gate is that every module's public behavior has at least one test asserting its contract; a coverage regression on a file touched by the current PR blocks merge, but an untouched file's pre-existing gap does not retroactively block unrelated work.
- **Tenant-isolation suite** (§12): mandatory, dedicated test category. For every organization-scoped table, at least one test asserts that an authenticated session from Organization B cannot read or write Organization A's row through any exposed repository method or endpoint.
- **AI Engine evaluation tests** (AI_DESIGN.md §14): the release-gate evaluation suite (extraction accuracy, groundedness, calibration) runs as `ai-engine-ci.yml`'s dedicated eval job — a prompt-template or model-version change that fails any eval metric blocks merge exactly like a failing unit test would, per AI_DESIGN.md §14's no-regression-tolerant promotion rule.
- **Test data**: no real tender PII, GST, or PAN numbers in any fixture or gold dataset, even sourced from staging — fixtures use synthetic, obviously-fake data (e.g., a fixed, clearly-invalid GSTIN pattern reserved for tests).
- **Mocking discipline**: the AI Engine's LLM provider client is mocked/stubbed in unit tests (deterministic, no real API cost or network flake); integration tests run at least the golden-path prompts against a real or realistic sandbox provider call, so a template regression that only manifests against real provider behavior is still caught before production.
- **Flaky tests**: quarantined (explicitly marked and tracked) and fixed within a defined window — never left permanently skipped or masked with blanket automatic retries.

---

## 14. Documentation Standards

- Every one of the six core documents (Architecture.md, DATABASE.md, API_SPEC.md, AI_DESIGN.md, PROJECT_STRUCTURE.md, this ENGINEERING_GUIDE.md) is updated **in the same PR** as any change that would make it inaccurate. A schema change without a DATABASE.md update, an endpoint change without an API_SPEC.md update, or a new folder without a PROJECT_STRUCTURE.md update fails review regardless of how good the code itself is.
- **Code comments** follow the project-wide rule already in force: default to none; a comment is added only to explain a non-obvious *why* (a hidden constraint, a subtle invariant, a workaround) — never to restate what a well-named identifier already shows, and never to narrate a ticket/task reference (that belongs in the commit message and PR description, per §8, which keeps the codebase from rotting around stale references).
- **Public API documentation** is Swagger-generated from code (API_SPEC.md §5), never hand-maintained separately — CI fails if a controller lacks the decorators needed to produce a complete OpenAPI entry (summary, tags, at least one example response per documented status code).
- **Per-service README**: each of `backend/`, `ai-engine/`, `frontend/` carries a short README covering only what is *not* already in `docs/` — local setup quirks, service-specific troubleshooting steps — deliberately never re-explaining architecture, schema, or API content that already has a single source of truth in `docs/`.
- **PR description checklist** (enforced via `.github/pull_request_template.md`, PROJECT_STRUCTURE.md §3): Does this change require a `docs/` update, and was it made? Does it touch a tenant-scoped table, and was the isolation test added? Does it add or change an endpoint, and is the Swagger output complete? Does it add a dependency, and was it scanned (§12)?
- **Architecture Decision Records**: any change that extends or departs from the locked architecture (per Architecture.md's change policy) is captured as a short ADR under `docs/adr/NNNN-title.md` **before** the change is implemented, not after — giving this project's "never change the architecture without explicit instruction" rule a durable, dated paper trail of exactly when and why an exception was authorized. (This registers a new `docs/adr/` folder, additive to PROJECT_STRUCTURE.md — see that document's changelog.)

### Standards Enforcement Map

| Standard | Enforced By |
|---|---|
| Python/TypeScript lint & format (§1, §2) | Pre-commit hooks + `backend-ci.yml` / `ai-engine-ci.yml` / `frontend-ci.yml` |
| Type strictness (§1, §2) | `mypy --strict`, `tsc --strict`, both in CI |
| Tenant isolation (§12, §13) | `tenant-isolation-ci.yml`, required check |
| AI evaluation gate (§13, AI_DESIGN.md §14) | `ai-engine-ci.yml` eval job |
| Commit format (§8) | Commit-msg pre-commit hook |
| Branch/merge rules (§9) | GitHub branch protection on `main` |
| Docs-in-sync requirement (§14) | PR template checklist + reviewer sign-off |
| Dependency vulnerability scanning (§12) | CI, all three `*-ci.yml` workflows |
