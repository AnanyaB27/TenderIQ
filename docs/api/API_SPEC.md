# TenderIQ — API Specification

## Document Control

| Field | Value |
|---|---|
| Document | API_SPEC.md |
| Product | TenderIQ — AI Procurement Intelligence Platform for MSMEs |
| Version | 1.0 (Baseline) |
| Status | Approved — Authoritative Source of Truth for the public REST contract |
| Owner | Chief Software Architect |
| Last Updated | 2026-07-30 |
| Serving Service | Backend API Service (Node.js/NestJS) — see [Architecture.md](../architecture/Architecture.md) §8. The AI Engine (Python/FastAPI) is internal-only and never exposed by this contract; every AI-facing endpoint below is a Backend API route that proxies to the AI Engine's internal contract (Architecture.md §9.3). |
| Change Policy | This is the single API contract for TenderIQ. No endpoint, schema, or status-code convention here may be changed without updating this document first — clients and the Backend API implementation are both built against it. |
| Related Documents | [Architecture.md](../architecture/Architecture.md) · [DATABASE.md](../database/DATABASE.md) · [AI_DESIGN.md](../ai/AI_DESIGN.md) · [ENGINEERING_GUIDE.md](../engineering/ENGINEERING_GUIDE.md) |

> Terminology note: the product/UI term **"Company"** refers to the same tenant concept modeled in DATABASE.md as **`organizations`** (an MSME's workspace). This document uses "Organization" for path/schema names to stay literally consistent with the schema, and "Company" only in prose where it aids readability — they are the same resource.

---

## 1. API Overview

### 1.1 Base URLs

| Environment | Base URL |
|---|---|
| Production | `https://api.tenderiq.in/v1` |
| Staging | `https://api.staging.tenderiq.in/v1` |
| Local | `http://localhost:4000/v1` |

### 1.2 Versioning Policy

- **Scheme**: URI versioning — `/v1/...`. The version segment denotes a breaking-change boundary for the whole API; there is no independent per-resource versioning.
- **Backward compatibility within a version**: additive changes only (new optional fields, new endpoints, new enum values consumers are expected to treat unknown values defensively for). Adding a new enum value is considered additive; removing or renaming one is breaking.
- **Breaking changes** (removing a field, changing a field's type or semantics, removing an endpoint, tightening validation in a way that rejects previously-valid requests) require a new version segment (`/v2`). `/v1` is not modified to carry them.
- **Deprecation**: a deprecated endpoint/field continues to function for a minimum of 6 months after its replacement ships, returns a `Deprecation: true` and `Sunset: <date>` response header, and is documented in a "Deprecated" callout in this file rather than silently removed from these docs.
- **Header-based minor negotiation**: none. Clients pin to a path version; there is no `Accept-Version` header scheme, to keep the contract simple for MSME-side integrators.

### 1.3 Content Type & Encoding

- Request and response bodies are `application/json; charset=utf-8` for all endpoints except file upload (`multipart/form-data`, used only by certification-document and profile-document upload endpoints) and file download (binary/`application/pdf`/`text/csv` for report export).
- All timestamps are ISO-8601 UTC (`2026-07-30T09:15:00Z`). All monetary amounts are returned as JSON numbers with an accompanying `Currency` field (ISO 4217, ISO string), matching DATABASE.md §3.
- All identifiers are UUID strings (DATABASE.md §4 UUID Policy) — clients must not assume any ordering or structure beyond "opaque string," even though they are UUIDv7 internally.

---

## 2. Authentication & Session Model

- **Scheme**: Bearer JWT access tokens (`Authorization: Bearer <token>`), 15-minute TTL, plus a rotating refresh token delivered as an `httpOnly`, `Secure`, `SameSite=Strict` cookie (never returned in a JSON body) — matching Architecture.md §13.1.
- **Organization context**: most endpoints are scoped to one organization via the `organizationId` path parameter. The server never trusts this value alone — it is only honored if the authenticated user has an active (`deleted_at IS NULL`) `organization_members` row for that organization; otherwise the request fails closed with `403`, not `404`, to avoid leaking existence (see §4).
- **Service-to-service (internal) calls** to the AI Engine are authenticated separately (shared rotated service token, internal network only) and are **not** part of this public contract.

Endpoints in this section live under the `Auth` Swagger tag (§5).

| Method & Path | Description | Auth Required |
|---|---|---|
| `POST /auth/register` | Create a new user account (email/password). | No |
| `POST /auth/login` | Authenticate with email/password. | No |
| `POST /auth/oauth/google` | Exchange a Google OAuth authorization code for a TenderIQ session. | No |
| `POST /auth/refresh` | Rotate the refresh-token cookie and issue a new access token. | Refresh cookie |
| `POST /auth/logout` | Revoke the current session's refresh token. | Yes |
| `GET /auth/me` | Return the current user and their organization memberships. | Yes |
| `POST /auth/password/forgot` | Request a password-reset email. | No |
| `POST /auth/password/reset` | Complete a password reset using the emailed token. | No |

### 2.1 `POST /auth/register`

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `email` | string | Yes | Valid email, max 255 chars, lowercased before storage | |
| `password` | string | Yes | Min 10 chars, must contain letters and numbers | |
| `fullName` | string | Yes | 1–255 chars | |
| `phoneNumber` | string | No | E.164 format | |

**Response `201 Created`**

```json
{
  "data": {
    "userId": "b1f6...uuid",
    "email": "priya@example.com",
    "fullName": "Priya Sharma",
    "isEmailVerified": false
  }
}
```

**Status Codes**: `201` created · `400` validation error · `409` email already registered.

**Validation Rules**: email uniqueness checked against `users.email` (partial-unique, live rows only, per DATABASE.md §7.1); password strength enforced server-side regardless of any client-side check; registration does **not** create an Organization — that is a separate, explicit step (§7.1).

### 2.2 `POST /auth/login`

**Request Body**: `email` (string, required), `password` (string, required).

**Response `200 OK`**

```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "accessTokenExpiresAt": "2026-07-30T09:30:00Z",
    "user": { "userId": "...", "email": "...", "fullName": "..." }
  }
}
```

Refresh token is set as an `httpOnly` cookie, not present in the JSON body.

**Status Codes**: `200` · `400` malformed body · `401` invalid credentials · `423` account locked (after configured failed-attempt threshold).

### 2.3 `POST /auth/refresh`

No body (refresh token read from cookie). **Response `200 OK`** — new `accessToken` + rotated cookie. **Status Codes**: `200` · `401` refresh token invalid/expired/reused (reuse of a rotated token revokes the entire session family as a breach signal).

### 2.4 `GET /auth/me`

**Response `200 OK`**

```json
{
  "data": {
    "userId": "...",
    "email": "...",
    "fullName": "...",
    "isPlatformAdmin": false,
    "organizations": [
      { "organizationId": "...", "name": "Sharma Fabricators", "role": "owner" }
    ]
  }
}
```

**Status Codes**: `200` · `401` missing/expired access token.

---

## 3. Common Conventions

### 3.1 Request Schema Conventions

- All request DTOs use **whitelist validation**: unknown fields are rejected with `400`, never silently ignored — prevents mass-assignment and keeps the contract self-documenting.
- Path parameters are always the resource's UUID `id` (e.g., `organizationId`, `tenderId`); never a slug or natural key, except `organizations.slug` used only in the read-only `GET /organizations/by-slug/{slug}` convenience lookup.
- Partial updates use `PATCH` with only the fields to change; `PUT` is reserved for full-resource replacement (used only for `msme_profiles`, which is naturally a single always-fully-specified form submission).
- Every list endpoint accepts pagination (§3.5) and, where applicable, filtering (§3.6) via query parameters — never via request body, even though some filter sets are large, to keep list endpoints cacheable/idempotent `GET`s.

### 3.2 Response Schema Conventions

**Success envelope** (single resource or list):

```json
{
  "data": { "...resource fields..." },
  "meta": { "...optional pagination/context metadata..." }
}
```

List responses always wrap the array under `data` (never a bare top-level array), so metadata can be added without a breaking change:

```json
{
  "data": [ { "...": "..." }, { "...": "..." } ],
  "meta": { "nextCursor": "eyJvZmZzZXQiOj...", "hasMore": true, "limit": 20 }
}
```

**Error envelope** (uniform across every endpoint):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary safe to display",
    "details": [
      { "field": "email", "issue": "must be a valid email address" }
    ],
    "correlationId": "b5b2b7f0-....-uuid"
  }
}
```

- `code` is a stable, machine-readable string (see §13 Error Code Reference) — clients should branch on `code`, never on `message` text.
- `correlationId` always matches the request's tracing correlation ID (Architecture.md §15), and is what a user quotes to support.

### 3.3 Status Codes

| Code | Meaning | Used When |
|---|---|---|
| `200 OK` | Success | Successful `GET`, `PATCH`, `POST` action-endpoints that don't create a resource. |
| `201 Created` | Resource created | Successful resource-creating `POST`. Includes `Location` header. |
| `202 Accepted` | Accepted, not yet complete | Async-triggered work (e.g., bid submission pending approval, §8.3; on-demand match recompute). |
| `204 No Content` | Success, no body | Successful `DELETE`, and `PATCH`/`PUT` where the caller doesn't need the updated resource echoed back. |
| `400 Bad Request` | Client input invalid | Schema/validation failure, malformed JSON, unknown fields. |
| `401 Unauthorized` | Missing/invalid/expired credentials | No access token, expired token, invalid refresh token. |
| `403 Forbidden` | Authenticated but not permitted | Role/permission check failed, or organization-scope check failed (see §4). |
| `404 Not Found` | Resource does not exist (or caller has no right to know it exists) | Also returned instead of `403` for cross-tenant access attempts, per §4. |
| `409 Conflict` | State conflict | Duplicate email on register, illegal pipeline-stage transition, concurrent-edit conflict. |
| `422 Unprocessable Entity` | Well-formed request, semantically invalid | E.g., `PATCH` pipeline stage directly to `won` from `watching` (must pass through `submitted`). |
| `429 Too Many Requests` | Rate limit or quota exceeded | Gateway rate limit, or AI-credit/alert-quota exhaustion (§12); response includes `Retry-After`. |
| `500 Internal Server Error` | Unhandled server fault | Always logged with `correlationId`; body never includes stack traces. |
| `503 Service Unavailable` | Dependency down | E.g., AI Engine unreachable for an AI-facing endpoint; response indicates the feature is temporarily degraded. |

### 3.4 Validation Rules (General)

| Rule | Applies To |
|---|---|
| Email: RFC 5322-conformant, max 255 chars | `users.email`, `organization_invitations.invitedEmail` |
| Password: min 10 chars, at least one letter and one digit | Registration, password reset |
| GST number: 15-char alphanumeric matching the standard GSTIN pattern | `msme_profiles.gstNumber` |
| PAN number: 10-char alphanumeric matching the standard PAN pattern | `msme_profiles.panNumber` |
| Phone number: E.164 | `users.phoneNumber` |
| Free-text fields (`title`, `name`, `description`, notes) | HTML-stripped/escaped server-side before storage — never trusted verbatim (XSS defense, Architecture.md §13.4) |
| Enumerated fields (`role`, `stage`, `status`, `channel`, etc.) | Validated against the exact enum list in DATABASE.md §7 for that column; unrecognized values rejected with `400`, not coerced |
| Monetary fields | Non-negative, max 2 decimal places, paired currency field required if the amount field is present |
| Date/time fields | ISO-8601 only; a deadline field in the past is accepted for historical/read paths but rejected on any field the client is asked to set going forward (e.g., a saved-search cannot filter for a deadline before "now") |
| Pagination `limit` | Integer, 1–100 inclusive, default 20 (§3.5) |

Every validation failure returns `400 VALIDATION_ERROR` with one `details[]` entry per invalid field — never a single generic message when more than one field fails, so a form can highlight all errors at once.

### 3.5 Pagination

TenderIQ uses **cursor-based (keyset) pagination** uniformly across every list endpoint — no endpoint uses offset/page-number pagination. This is a deliberate single convention (Architecture.md design principle of one API contract) chosen because the largest collection (`tenders`, growing toward the 2M-row NFR-3 target) degrades badly under offset pagination; rather than have two conventions, every list endpoint — even small ones like organization members — uses the same shape.

**Request query parameters**

| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | No | 20 (max 100) | Page size. |
| `cursor` | string | No | — (first page) | Opaque, base64-encoded cursor returned by the previous page's `meta.nextCursor`. Never constructed by the client. |

**Response metadata**

```json
"meta": { "limit": 20, "hasMore": true, "nextCursor": "opaque-string-or-null" }
```

- `nextCursor` is `null` when `hasMore` is `false`.
- Cursors are stable under insertion (keyset on `(sortColumn, id)`), so a new tender appearing mid-scroll never causes a duplicate or skipped row.

### 3.6 Filtering & Sorting

- Simple equality filters use `filter[<field>]=<value>`, e.g. `filter[status]=active`.
- Range filters use explicit suffixed params rather than operators in the value, for cache-friendliness and simple validation: `minValue`, `maxValue`, `deadlineAfter`, `deadlineBefore`.
- Full-text/semantic search uses `q` (a single free-text query param), combined server-side across Postgres full-text search and `pgvector` similarity per Architecture.md §9.2/§14.
- Sorting uses `sort=<field>:<asc|desc>`, single-field only (multi-field sort is not exposed publicly to keep cursor pagination correctness straightforward); default sort is documented per endpoint.
- Any filter/sort field not explicitly documented for that endpoint is rejected with `400` rather than silently ignored.

---

## 4. Permissions & Roles

| Role | Scope | Summary |
|---|---|---|
| `owner` | Per-organization (`organization_members.role`) | Full control of the organization: members, profile, billing, settings, all tender/pipeline actions. |
| `bid_manager` | Per-organization | Full tender/pipeline/checklist/AI-feature access; cannot manage billing, cannot remove the organization, cannot change other members' roles. |
| `viewer` | Per-organization | Read-only across tenders, pipeline, reports; cannot create/edit/delete anything. |
| `platform_admin` | Platform-wide (`users.isPlatformAdmin`) | Access to the `Admin` endpoint group (§11) only; platform admin does **not** implicitly grant organization-level write access to any specific organization's data — an admin acting inside a tenant's data for support purposes goes through a distinct, separately audited support-impersonation path outside this contract's normal routes. |

**Enforcement model** (Architecture.md §13.3, §9.4): every organization-scoped route resolves the caller's role from `organization_members`, keyed off the authenticated session — never from a client-supplied role claim. A request for an organization the caller has no active membership in returns `404`, not `403`, so membership existence cannot be probed.

**Permission matrix** (✔ = allowed, ✘ = blocked with `403`):

| Action | `owner` | `bid_manager` | `viewer` |
|---|---|---|---|
| View tenders, search, AI summary/eligibility | ✔ | ✔ | ✔ |
| Create/update pipeline items, checklist tasks | ✔ | ✔ | ✘ |
| Trigger AI Q&A / draft generation | ✔ | ✔ | ✘ |
| Approve a pipeline item (approval gate) | ✔ | only if designated approver | ✘ |
| Invite/remove members, change roles | ✔ | ✘ | ✘ |
| Edit MSME profile / certifications | ✔ | ✔ | ✘ |
| View billing/invoices | ✔ | ✘ | ✘ |
| Change subscription plan | ✔ | ✘ | ✘ |
| View reports/dashboard | ✔ | ✔ | ✔ |
| Export reports | ✔ | ✔ | ✘ |
| Delete the organization | ✔ | ✘ | ✘ |

---

## 5. Swagger / OpenAPI Organization

- Served at `GET /v1/docs` (Swagger UI) and `GET /v1/docs-json` (raw OpenAPI 3.1 document), generated directly from the NestJS controller decorators — this file and the generated spec are kept in sync by CI failing the build if a controller lacks the required decorators (ENGINEERING_GUIDE.md).
- **Tags** mirror this document's endpoint sections exactly, and map 1:1 to the Backend API's NestJS modules (Architecture.md §9.1): `Auth`, `Company`, `Tender`, `AI`, `Reports`, `Admin`. A controller belongs to exactly one tag; cross-cutting concerns (pagination, error envelope) are documented once via shared OpenAPI components, not repeated per endpoint.
- **`operationId`** convention: `<verb><Resource>[<Sub-resource>]`, camelCase, matching the method name in the NestJS controller — e.g. `listTenders`, `createPipelineItem`, `approvePipelineItem`. Generated client SDKs use this as the function name.
- **Security scheme**: a single `bearerAuth` (`type: http`, `scheme: bearer`, `bearerFormat: JWT`) component applied at the operation level; public endpoints (register/login/refresh/oauth) explicitly declare `security: []` to override the global default.
- **Shared components**: `PaginationMeta`, `ErrorResponse`, `Money`, `OrganizationRoleEnum`, `PipelineStageEnum`, etc. are defined once under `components/schemas` and referenced (`$ref`) everywhere they appear, so a schema change is made in one place.
- **Grouping order** in the UI follows the order of this document: Auth → Company → Tender → AI → Reports → Admin, with `Admin` collapsed by default and visible only when the authenticated Swagger session belongs to a platform admin (the Swagger UI itself is not publicly deployed in production — it is reachable only from the internal network/VPN, per Architecture.md §13).
- Every endpoint documents at minimum: summary, description, tag, security requirement, request schema, and one example response per documented status code — Swagger auto-generation fails CI if any of these is missing (ENGINEERING_GUIDE.md quality gate).

---

## 6. Endpoints — Authentication

Covered fully in §2. No additional endpoints beyond those listed there.

---

## 7. Endpoints — Company (Organization, MSME Profile, Billing, Notifications)

Swagger tag: `Company`. Base path: `/organizations`.

| Method & Path | Description | Min Role |
|---|---|---|
| `POST /organizations` | Create a new organization; caller becomes `owner`. | Any authenticated user |
| `GET /organizations` | List organizations the caller belongs to. | Any member |
| `GET /organizations/{organizationId}` | Get organization detail. | `viewer` |
| `PATCH /organizations/{organizationId}` | Update name/settings. | `owner` |
| `DELETE /organizations/{organizationId}` | Soft-delete the organization. | `owner` |
| `GET /organizations/{organizationId}/members` | List members. | `viewer` |
| `POST /organizations/{organizationId}/invitations` | Invite a member by email + role. | `owner` |
| `GET /organizations/{organizationId}/invitations` | List pending invitations. | `owner` |
| `POST /invitations/{token}/accept` | Accept an invitation (token from the invite email). | Any authenticated user |
| `PATCH /organizations/{organizationId}/members/{memberId}` | Change a member's role. | `owner` |
| `DELETE /organizations/{organizationId}/members/{memberId}` | Remove a member. | `owner` |
| `GET /organizations/{organizationId}/profile` | Get the MSME profile. | `viewer` |
| `PUT /organizations/{organizationId}/profile` | Full-replace the MSME profile. | `owner`, `bid_manager` |
| `GET /organizations/{organizationId}/certifications` | List certifications. | `viewer` |
| `POST /organizations/{organizationId}/certifications` | Add a certification (multipart, with document upload). | `owner`, `bid_manager` |
| `DELETE /organizations/{organizationId}/certifications/{certificationId}` | Remove a certification. | `owner`, `bid_manager` |
| `GET /organizations/{organizationId}/subscription` | Get current plan, cycle, status. | `owner` |
| `POST /organizations/{organizationId}/subscription` | Change plan (initiates Razorpay checkout). | `owner` |
| `GET /organizations/{organizationId}/invoices` | List invoices. | `owner` |
| `GET /organizations/{organizationId}/usage` | Current-period AI-credit and alert usage vs. plan limits. | `owner`, `bid_manager` |
| `GET /notifications` | List the caller's notifications (cross-organization feed). | Any authenticated user |
| `PATCH /notifications/{notificationId}/read` | Mark a notification read. | Owning user |
| `GET /notification-preferences` | Get channel preferences per event type. | Any authenticated user |
| `PUT /notification-preferences` | Replace channel preferences. | Any authenticated user |

### 7.1 `POST /organizations`

**Request Body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | 1–255 chars |
| `slug` | string | Yes | 3–255 chars, lowercase kebab-case, unique (`409` on collision) |

**Response `201 Created`** — the created organization; caller is written as `created_by_user_id` and as the sole `organization_members` row with `role: "owner"` in the same transaction.

**Status Codes**: `201` · `400` validation · `409` slug taken.

### 7.2 `PUT /organizations/{organizationId}/profile`

**Request Body**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `gstNumber` | string | No | GSTIN pattern (§3.4), unique across live profiles |
| `panNumber` | string | No | PAN pattern (§3.4) |
| `udyamRegistrationNumber` | string | No | |
| `primaryIndustrySector` | string | Yes | 1–100 chars |
| `nicCodes` | string[] | No | Each 1–20 chars |
| `annualTurnoverYear1Amount` / `Year2` / `Year3` | number | No | Non-negative, 2 decimal places |
| `turnoverCurrency` | string | No | ISO 4217, default `INR` |
| `yearsInOperation` | integer | No | 0–150 |
| `preferredLocations` | string[] | No | |

**Response `200 OK`** — the full profile as stored. **Status Codes**: `200` · `400` · `403` (role) · `404`.

### 7.3 `PATCH /organizations/{organizationId}/members/{memberId}`

**Request Body**: `role` (string, required, one of `owner`/`bid_manager`/`viewer`).

**Validation**: an organization must always retain at least one `owner` — an attempt to demote the last owner returns `409 LAST_OWNER`.

### 7.4 `POST /organizations/{organizationId}/subscription`

**Request Body**: `planCode` (string, required, one of `free`/`starter`/`growth`/`enterprise`).

**Response `202 Accepted`** — returns a Razorpay checkout reference; the subscription's `status` remains `trialing`/previous value until the Razorpay webhook confirms payment (handled by `POST /admin/webhooks/razorpay`, §11), at which point `organization_subscriptions.is_current` flips per DATABASE.md §7.6.

---

## 8. Endpoints — Tender

Swagger tag: `Tender`. Covers discovery/search, AI-adjacent read models that are tender-shaped, alerts, and the bid pipeline workspace.

### 8.1 Discovery

| Method & Path | Description | Min Role |
|---|---|---|
| `GET /tenders` | Search/list tenders (full-text + semantic + filters). | `viewer` |
| `GET /tenders/{tenderId}` | Tender detail. | `viewer` |
| `GET /tenders/{tenderId}/documents` | List source documents for a tender. | `viewer` |
| `GET /tenders/categories` | List the canonical category taxonomy. | Any authenticated user |

#### `GET /tenders`

**Query Parameters**

| Param | Type | Description |
|---|---|---|
| `q` | string | Free-text / semantic query. |
| `filter[status]` | string | One of `active`, `closed`, `cancelled`, `awarded` (default `active`). |
| `filter[categoryId]` | uuid | |
| `filter[locationState]` | string | |
| `minValue` / `maxValue` | number | Tender value range. |
| `deadlineAfter` / `deadlineBefore` | ISO-8601 datetime | |
| `organizationId` | uuid | When present, results include `matchScore` and are sortable by it (requires an active membership in that organization). |
| `minMatchScore` | number | Only valid combined with `organizationId`; implements "Recommended for you" (FR-DIS-2). |
| `sort` | string | One of `deadline:asc`, `deadline:desc`, `value:asc`, `value:desc`, `matchScore:desc` (only if `organizationId` present), `relevance:desc` (default when `q` present). |
| `limit`, `cursor` | — | Per §3.5. |

**Response `200 OK`**

```json
{
  "data": [
    {
      "tenderId": "...",
      "title": "Supply of Industrial Fasteners",
      "issuingAuthority": "...",
      "tenderValueAmount": 4500000.00,
      "tenderValueCurrency": "INR",
      "submissionDeadlineAt": "2026-08-20T17:00:00Z",
      "status": "active",
      "matchScore": 82.5
    }
  ],
  "meta": { "limit": 20, "hasMore": true, "nextCursor": "..." }
}
```

**Status Codes**: `200` · `400` invalid filter/sort combination · `403` if `organizationId` given but caller has no membership.

#### `GET /tenders/{tenderId}`

**Response `200 OK`** includes full tender fields (DATABASE.md §7.2 `tenders`) plus `aiSummary`. Eligibility checklist and match score are **not** inlined here — they are organization-specific and served by the `AI` endpoints (§9), since a tender detail page is meaningful even to a caller not yet scoped to a specific organization's fit.

**Status Codes**: `200` · `404`.

### 8.2 Alerts (Saved Searches)

| Method & Path | Description | Min Role |
|---|---|---|
| `GET /organizations/{organizationId}/saved-searches` | List saved searches. | `viewer` |
| `POST /organizations/{organizationId}/saved-searches` | Create a saved search/alert. | `owner`, `bid_manager` |
| `PATCH /saved-searches/{savedSearchId}` | Update filters/threshold/active flag. | `owner`, `bid_manager` |
| `DELETE /saved-searches/{savedSearchId}` | Soft-delete. | `owner`, `bid_manager` |

**`POST` Request Body**: `name` (string, required), `filters` (object, required — same shape as the `GET /tenders` filter query params), `matchScoreThreshold` (number, optional, 0–100). Subject to the organization's `alertLimitPerMonth` plan quota (§12); exceeding it returns `429 QUOTA_EXCEEDED`.

### 8.3 Bid Pipeline & Checklist Tasks

| Method & Path | Description | Min Role |
|---|---|---|
| `GET /organizations/{organizationId}/pipeline-items` | List pipeline items (Kanban board data). | `viewer` |
| `POST /organizations/{organizationId}/pipeline-items` | Shortlist a tender → creates a `watching` pipeline item. | `owner`, `bid_manager` |
| `GET /pipeline-items/{pipelineItemId}` | Detail, incl. checklist tasks and draft sections. | `viewer` (own org) |
| `PATCH /pipeline-items/{pipelineItemId}` | Change `stage`, or record `outcomeNotes`. | `owner`, `bid_manager` |
| `DELETE /pipeline-items/{pipelineItemId}` | Soft-delete (remove from pipeline). | `owner`, `bid_manager` |
| `POST /pipeline-items/{pipelineItemId}/approve` | Approve a pending-approval submission. | Designated approver / `owner` |
| `POST /pipeline-items/{pipelineItemId}/reject` | Reject a pending-approval submission. | Designated approver / `owner` |
| `GET /pipeline-items/{pipelineItemId}/checklist-tasks` | List checklist tasks. | `viewer` |
| `POST /pipeline-items/{pipelineItemId}/checklist-tasks` | Add a task (optionally seeded from an eligibility item). | `owner`, `bid_manager` |
| `PATCH /checklist-tasks/{checklistTaskId}` | Update assignee/status/due date. | `owner`, `bid_manager`, or the assignee |
| `DELETE /checklist-tasks/{checklistTaskId}` | Soft-delete a task. | `owner`, `bid_manager` |

#### `PATCH /pipeline-items/{pipelineItemId}` — Stage Transition Rules

**Request Body**: `stage` (string, optional, one of the `pipeline_items.stage` enum), `outcomeNotes` (string, optional, required when `stage` is `won`/`lost`/`disqualified`).

**Validation** (`422 ILLEGAL_TRANSITION` if violated):

```
watching → preparing → submitted → { won | lost | disqualified }
watching → dismissed
preparing → dismissed
```

No transition may skip a stage (e.g., `watching` → `won` directly is rejected) — this guarantees pipeline funnel analytics (FR-ANL-1, derived from `audit_log`, DATABASE.md §7.4) always reflect a complete funnel.

**Approval gate**: if the target `stage` is `submitted` and `organizations.isApprovalGateEnabled` is true, the response is `202 Accepted` with `approvalStatus: "pending"` instead of `200`, and the stage does not actually change to `submitted` until `POST /pipeline-items/{id}/approve` succeeds (Architecture.md §10.5 sequence).

**Status Codes**: `200` (direct transition) · `202` (approval pending) · `400` · `403` · `404` · `422` (illegal transition).

---

## 9. Endpoints — AI

Swagger tag: `AI`. Every endpoint here is billed against the calling organization's `usage_counters` (`ai_credits` metric, DATABASE.md §7.6) and enforces the plan's `aiCreditLimitPerMonth` (§12); all of them proxy to the AI Engine's internal contract (Architecture.md §9.3) and never call an LLM directly from the client.

| Method & Path | Description | Min Role | AI Credit Cost |
|---|---|---|---|
| `GET /tenders/{tenderId}/summary` | AI-generated plain-language summary (FR-AI-4). Cached; regeneration only on re-extraction. | `viewer` | 0 (served from cache after first generation) |
| `GET /organizations/{organizationId}/tenders/{tenderId}/eligibility` | Org-specific eligibility checklist (FR-AI-3). Computed on first request if absent. | `viewer` | 1 (only on first computation) |
| `GET /organizations/{organizationId}/tenders/{tenderId}/match-score` | Org-specific match score + reasoning (FR-AI-2). | `viewer` | 0 (precomputed asynchronously, §14 Architecture) |
| `POST /organizations/{organizationId}/tenders/{tenderId}/qa` | Ask a grounded question about one tender (FR-AI-5). | `owner`, `bid_manager` | 1 per question |
| `POST /pipeline-items/{pipelineItemId}/draft-sections` | Generate AI draft response section(s) (FR-BID-2). | `owner`, `bid_manager` | 2 per section |
| `GET /pipeline-items/{pipelineItemId}/draft-sections` | List generated/edited drafts. | `viewer` | 0 |
| `PATCH /draft-sections/{draftId}` | Edit or discard a draft. | `owner`, `bid_manager` | 0 |
| `POST /organizations/{organizationId}/recompute-matches` | Manually trigger a full match-score recompute (e.g., after a profile edit). | `owner`, `bid_manager` | 0, rate-limited to 1/hour (§12) |

### 9.1 `GET /organizations/{organizationId}/tenders/{tenderId}/eligibility`

**Response `200 OK`**

```json
{
  "data": {
    "tenderId": "...",
    "organizationId": "...",
    "items": [
      {
        "criterionIndex": 0,
        "criterionText": "Bidder must hold ISO 9001:2015 certification.",
        "status": "not_met",
        "sourceClauseExcerpt": "The bidder shall possess a valid ISO 9001:2015 certificate...",
        "sourceDocumentId": "...",
        "sourcePageNumber": 4
      }
    ],
    "evaluatedAt": "2026-07-29T06:12:00Z"
  }
}
```

**Status Codes**: `200` · `403` · `404` · `503` (AI Engine unavailable — response includes `error.code: "AI_ENGINE_UNAVAILABLE"` and the client is expected to retry, not treat as a permanent failure).

### 9.2 `POST /organizations/{organizationId}/tenders/{tenderId}/qa`

**Request Body**: `question` (string, required, 3–1000 chars).

**Response `200 OK`**

```json
{
  "data": {
    "answer": "Yes — the tender document requires ISO 9001:2015 certification, stated in Section 3.2.",
    "citations": [ { "documentId": "...", "pageNumber": 4, "excerpt": "..." } ]
  }
}
```

**Status Codes**: `200` · `400` (question too short/long) · `403` · `404` · `429 QUOTA_EXCEEDED` (AI credits exhausted for the billing period) · `503`.

**Validation**: the answer is always grounded strictly in the retrieved tender document chunks (Architecture.md §9.2 RAG Q&A Service); if no relevant passage is retrieved, the response still returns `200` with `answer` explicitly stating the document does not address the question — never a fabricated answer.

### 9.3 `POST /pipeline-items/{pipelineItemId}/draft-sections`

**Request Body**: `sectionType` (string, required, one of a documented set e.g. `company_profile`, `technical_capability`).

**Response `201 Created`** — a `bid_drafts` row with `status: "generated"`. The client must treat this as a **draft requiring review** — no endpoint in this API marks a draft as part of an actual submission artifact; that remains a manual, human step outside the platform (Architecture.md §9.2, §18).

---

## 10. Endpoints — Reports

Swagger tag: `Reports`. All scoped to an organization; `viewer` role can view but not export.

| Method & Path | Description | Min Role |
|---|---|---|
| `GET /organizations/{organizationId}/reports/dashboard` | Summary tiles: tenders tracked, win rate, upcoming deadlines, pipeline funnel counts, value won vs. bid (FR-ANL-1). | `viewer` |
| `GET /organizations/{organizationId}/reports/pipeline-funnel` | Stage-by-stage funnel counts and conversion rates over a date range. | `viewer` |
| `GET /organizations/{organizationId}/reports/win-loss` | Win/loss breakdown by category, value band, and time period. | `viewer` |
| `GET /organizations/{organizationId}/reports/export` | Export pipeline/analytics as CSV or PDF (US-7). | `owner`, `bid_manager` |

### 10.1 `GET /organizations/{organizationId}/reports/dashboard`

**Query Parameters**: `periodStart`, `periodEnd` (ISO-8601 date, optional, default = last 12 months).

**Response `200 OK`**

```json
{
  "data": {
    "tendersTracked": 47,
    "winRate": 0.34,
    "upcomingDeadlines": [
      { "tenderId": "...", "title": "...", "submissionDeadlineAt": "..." }
    ],
    "pipelineFunnel": { "watching": 20, "preparing": 12, "submitted": 9, "won": 4, "lost": 4, "disqualified": 1 },
    "valueWonAmount": 12500000.00,
    "valueBidAmount": 38900000.00,
    "currency": "INR"
  }
}
```

### 10.2 `GET /organizations/{organizationId}/reports/export`

**Query Parameters**: `format` (string, required, `csv` or `pdf`), `report` (string, required, one of `pipeline`, `win-loss`, `dashboard`), `periodStart`/`periodEnd` (optional).

**Response `200 OK`** — binary body, `Content-Type: text/csv` or `application/pdf`, `Content-Disposition: attachment; filename="..."`.

**Status Codes**: `200` · `400` unknown `format`/`report` · `403` (viewer attempting export) · `404`.

---

## 11. Endpoints — Admin

Swagger tag: `Admin`. Every endpoint requires `users.isPlatformAdmin = true`; none are organization-scoped by role (Persona 4). Not reachable from the public Swagger UI deployment (§5).

| Method & Path | Description |
|---|---|
| `GET /admin/ingestion/sources` | List configured tender sources and their `isActive`/health status. |
| `GET /admin/ingestion/runs` | List recent ingestion runs, filterable by `sourceId`, `status` (US-10). |
| `GET /admin/ingestion/errors` | List recent ingestion errors, filterable by `sourceId`, `severity`. |
| `GET /admin/ai/extraction-confidence-trend` | Weekly trend of extraction confidence / manual-correction rate (US-11). |
| `GET /admin/organizations` | List all organizations (support/ops search, not a tenant-facing listing). |
| `GET /admin/organizations/{organizationId}` | Organization detail incl. subscription and usage, for support purposes. |
| `PATCH /admin/organizations/{organizationId}/subscription` | Manually override an organization's plan (support/comp scenarios). |
| `GET /admin/dsr-requests` | List data-subject requests (export/delete), filterable by `status` (NFR-11). |
| `PATCH /admin/dsr-requests/{dsrRequestId}` | Update status / mark completed, with `details`. |
| `GET /admin/metrics/platform` | Active organizations, subscription mix, MRR, ingestion volume — operational dashboard feed. |
| `POST /admin/webhooks/razorpay` | Razorpay subscription/payment webhook receiver (signature-verified, not user-authenticated). |

### 11.1 `GET /admin/ingestion/runs`

**Query Parameters**: `filter[sourceId]` (uuid), `filter[status]` (`running`/`success`/`partial_failure`/`failed`), plus standard pagination (§3.5).

**Response `200 OK`** — array of `ingestion_runs` rows (DATABASE.md §7.2) with source `code`/`name` joined in.

### 11.2 `PATCH /admin/dsr-requests/{dsrRequestId}`

**Request Body**: `status` (string, required, one of `in_progress`/`completed`/`rejected`), `details` (string, optional).

**Every call in this section writes an `audit_log` entry** (`actor_user_id` = the admin, `action` = e.g. `dsr_request.status_change`) per DATABASE.md §6 — admin actions are held to the same audit standard as tenant actions, not exempted.

### 11.3 `POST /admin/webhooks/razorpay`

Not authenticated via JWT — verified via Razorpay's HMAC request signature header instead; any request failing signature verification returns `401` and is logged as a security event. Idempotent on Razorpay's `event.id` (duplicate deliveries are safely ignored, returning `200` without reprocessing).

---

## 12. Rate Limiting & Quotas

| Layer | Limit | Response on Breach |
|---|---|---|
| Per-IP (unauthenticated endpoints: register/login/password-reset) | 10 requests / minute | `429 RATE_LIMITED`, `Retry-After` header |
| Per-user (all authenticated endpoints) | 300 requests / minute | `429 RATE_LIMITED` |
| Per-organization AI credits | Per `subscription_plans.aiCreditLimitPerMonth` (DATABASE.md §7.6); resets on `organization_subscriptions.billingCycleStart/End` | `429 QUOTA_EXCEEDED`, body includes `resetAt` |
| Per-organization alert (saved search) count | Per `subscription_plans.alertLimitPerMonth` | `429 QUOTA_EXCEEDED` on create |
| `POST /organizations/{organizationId}/recompute-matches` | 1 / hour / organization | `429 RATE_LIMITED` |

All rate-limit and quota checks happen in the Backend API before any AI Engine call is made, so quota exhaustion never consumes LLM cost (Architecture.md §14).

---

## 13. Error Code Reference

| `code` | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | One or more request fields failed validation (§3.4). |
| `UNAUTHENTICATED` | 401 | Missing/expired/invalid access token. |
| `INVALID_CREDENTIALS` | 401 | Login email/password mismatch. |
| `REFRESH_TOKEN_INVALID` | 401 | Refresh token invalid, expired, or reused. |
| `ACCOUNT_LOCKED` | 423 | Too many failed login attempts. |
| `FORBIDDEN` | 403 | Authenticated, but role/permission check failed. |
| `NOT_FOUND` | 404 | Resource missing, or caller has no visibility into it (cross-tenant). |
| `EMAIL_TAKEN` | 409 | Registration email already in use. |
| `SLUG_TAKEN` | 409 | Organization slug already in use. |
| `LAST_OWNER` | 409 | Attempt to remove/demote the organization's only `owner`. |
| `ILLEGAL_TRANSITION` | 422 | Pipeline stage transition skips a required stage or is otherwise invalid (§8.3). |
| `RATE_LIMITED` | 429 | Per-IP/per-user request-rate limit exceeded. |
| `QUOTA_EXCEEDED` | 429 | Plan-based AI-credit or alert-count quota exceeded. |
| `AI_ENGINE_UNAVAILABLE` | 503 | Internal AI Engine dependency unreachable/timed out. |
| `INTERNAL_ERROR` | 500 | Unhandled server fault; always paired with a `correlationId`. |
