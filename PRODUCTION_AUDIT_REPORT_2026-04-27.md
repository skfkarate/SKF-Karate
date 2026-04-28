# SKF Karate Repository Production Audit

- Audit date: **2026-04-27**
- Auditor mode: **Full repository code audit (staff-level production readiness)**
- Repository root: `/home/krish/SKF Karate/website/SKF-Karate`
- Worktree state during audit: **dirty** (`git status --short` showed multiple modified and untracked files)

---

## 1. Executive summary

This repository is **not ready for production**.

The audit confirmed multiple critical production blockers:
- exposed unauthenticated endpoints returning sensitive data
- certificate access-control bypass via query parameter
- open SSRF-capable proxy endpoint
- payment bypass controlled by client payload
- account takeover risk in legacy PIN setup flow
- default production build instability (heap OOM under `npm run build`)

Additionally, there is substantial operational debt:
- fragmented auth systems and inconsistent authorization checks
- non-atomic financial/points operations
- high dependency vulnerability count in production deps
- weak CI quality gate for full-stack correctness
- large dead-code surface and stale docs/env drift

### Remediation Progress Update (2026-04-28 IST, in-repo)

- Route transition UX and loading continuity were improved across key funnels.
- Media pipeline guardrails were added (manifest audit + static asset CI fail gates).
- Local static payload was reduced from ~1.17 GB baseline to ~17.40 MB in `public/`.
- Current `public/` files `>=1MB`: **0**.
- Quality gates re-run after optimization:
  - `npm run type-check` passed
  - `npm run test:unit` passed (42 tests)
  - `npm run build:ci` passed
  - `npm run audit:assets:ci` passed
  - `npm run audit:media-manifest` passed

Critical security findings in this report still require dedicated remediation before production launch.

---

## 2. Scope, method, and verification level

### 2.1 Method used

The audit included:
1. full repository structure mapping
2. stack and entry-point identification
3. route/service/repository/auth/config tracing
4. production-sensitive path analysis (auth, payments, certificates, points, cron, webhooks)
5. static quality/dead-code/security scans
6. runtime verification via build/lint/type-check/tests where available

### 2.2 Commands executed (high-impact checks)

- `npm run type-check`
- `npm run build`
- `npm run build:ci`
- `npm run lint`
- `npm run lint:backend`
- `npm run test:unit`
- `npm run test:e2e`
- `npx knip --no-progress`
- `npm audit --omit=dev --json`

### 2.3 Verification status

#### Fully verified (confirmed by code + command output)
- all findings listed as **Confirmed** below
- build behavior (`build` vs `build:ci`)
- lint/type-check/test results at audit time
- route exposure and auth checks at source level

#### Partially verified / environment-dependent
- behavior under real production secrets and infrastructure quotas
- live third-party integration failure modes (Google Sheets, Supabase, Razorpay, Resend)
- traffic-scale behavior under production concurrency

---

## 3. Repository architecture map

### 3.1 Stack and layout

- Framework: Next.js App Router (`app/`)
- Language: TS + JS mixed
- Auth layers:
  - NextAuth admin auth (`lib/server/auth/options.ts`)
  - legacy portal JWT auth (`lib/server/auth_legacy.js`)
  - new student JWT helper (`lib/server/auth/student.ts`)
  - role helper (`lib/server/requireRole.ts`)
- Data backends:
  - Supabase (service role + anon clients) (`lib/server/supabase.ts`)
  - Google Sheets service (`lib/server/sheets.ts`)
  - Upstash Redis for cache/rate-limits in newer paths
- Mixed API architectures:
  - newer standardized route wrapper (`src/server/lib/route.ts` + `withRoute`)
  - many legacy direct route handlers

### 3.2 Route hardening migration status

- total API route files: **64**
- files using `withRoute`: **14**
- files **not** using `withRoute`: **50**

This is a major consistency gap for auth/validation/rate-limit/error handling behavior.

### 3.3 Deployment model

- Vercel-style deployment with `vercel.json`
- cron configured for `/api/cron/birthday-points`
- no Docker/K8s deployment manifests in repo

---

## 4. End-to-end flow tracing

### 4.1 User interaction flow

- Public site pages render from `app/**`
- Many portal pages under `app/portal/**` remain mock-driven (fees/notices/grading/trophy-room)
- Shop checkout UI currently posts directly to `/api/shop/orders` with client-set bypass flag

### 4.2 Request/response and service flow

- Newer API routes use wrapper stack in `src/server` (validation, rate-limit, request IDs)
- Legacy API routes bypass standardized controls and differ in security posture

### 4.3 State/auth flow

- Admin auth: NextAuth credentials -> JWT session -> `session.user.role`
- Portal auth: legacy JWT cookie (`skf_portal_token`) minted via `auth_legacy`
- New student JWT path throws hard if `JWT_SECRET` missing (`auth/student.ts`), while legacy path allows fallback to `NEXTAUTH_SECRET`

### 4.4 Database flow

- Supabase service-role used broadly in APIs/repositories
- Google Sheets still serves core datasets and updates for several flows
- points/shop write paths show non-transactional behavior

### 4.5 Integration flow

- Razorpay checkout and webhook routes exist, but business checkout path currently bypasses signature if client flag is set
- Resend integration exists in two notification routes (duplicated)

### 4.6 Build/deploy/config flow

- `build` fails OOM in local audit
- `build:ci` passes due explicit `NODE_OPTIONS=--max-old-space-size=4096`
- CI workflow currently runs narrow lint (`lint:backend`) rather than full repo lint

---

## 5. Critical production blockers (Confirmed)

## C1. Public DB diagnostic endpoint exposed
- Severity: **Critical**
- Area: Security / Backend
- Paths:
  - `app/api/test-db/route.ts:4-16`
- What is wrong:
  - Unauthenticated endpoint tests DB and returns data.
- Production impact:
  - Reconnaissance surface and schema probing in production.
- Fix:
  - Remove route or hard-gate with admin auth + non-prod environment check.
- Confidence: **High**

## C2. Public PII student lookup endpoint
- Severity: **Critical**
- Area: Security / Privacy
- Paths:
  - `app/api/students/lookup/route.ts:5-33`
- What is wrong:
  - No auth; returns student identifying/contact data by `skfId`.
- Production impact:
  - Direct PII leakage and targeted abuse risk.
- Fix:
  - Require strict auth, minimize response fields, add rate-limits + abuse detection.
- Confidence: **High**

## C3. Open SSRF proxy with wildcard CORS
- Severity: **Critical**
- Area: Security
- Paths:
  - `app/api/certificates/template-image/route.ts:1-23`
- What is wrong:
  - Fetches arbitrary `url` query param server-side; `Access-Control-Allow-Origin: *`.
- Production impact:
  - SSRF and abuse as open fetch proxy.
- Fix:
  - Replace with allowlisted host fetcher, timeout/body-size caps, scheme checks, no wildcard CORS.
- Confidence: **High**

## C4. Certificate authorization bypass via `admin=true`
- Severity: **Critical**
- Area: Security / Authorization
- Paths:
  - `app/api/certificates/[enrollmentId]/data/route.ts:8-13`
  - `app/api/certificates/[enrollmentId]/pdf/route.tsx:10-16`
  - `lib/certificates/CertificateRenderer.ts:40-43`
- What is wrong:
  - Admin privilege derived from query parameter.
- Production impact:
  - Unauthorized access to locked/completion-restricted certificates.
- Fix:
  - Derive admin from authenticated server session only.
- Confidence: **High**

## C5. Public mock payment initialization endpoint (auth commented)
- Severity: **Critical**
- Area: Security / Payments
- Paths:
  - `app/api/portal/fees/pay/route.js:14-20` (auth commented)
  - `app/api/portal/fees/pay/route.js:29-36` (returns mock order)
- What is wrong:
  - No auth enforcement; mock behavior available.
- Production impact:
  - Fraud/confusion vector, abuse surface.
- Fix:
  - Reinstate auth and disable mock mode in production.
- Confidence: **High**

## C6. Public receipt generation endpoint without ownership checks
- Severity: **Critical**
- Area: Security / Privacy
- Paths:
  - `app/api/portal/receipts/[receiptId]/route.js:4-90`
- What is wrong:
  - Generates receipt PDF for arbitrary `receiptId` without auth.
- Production impact:
  - Data disclosure and spoofed receipt distribution.
- Fix:
  - Require authenticated identity and verify receipt ownership.
- Confidence: **High**

## C7. Portal account takeover primitive in `set-pin`
- Severity: **Critical**
- Area: Security / Auth
- Paths:
  - `app/api/auth/portal/set-pin/route.js:47-54`
  - `app/api/auth/portal/set-pin/route.js:83-94`
  - `app/api/auth/portal/set-pin/route.js:15-19` (rate-limit call not awaited)
- What is wrong:
  - Any actor with valid SKF ID can set a PIN and receive auth cookie; no verified possession challenge.
  - `enforceRateLimit` is async but not awaited.
- Production impact:
  - Direct impersonation/account compromise path.
- Fix:
  - Remove endpoint or enforce OTP/session proof; await limiter; add lockout + telemetry.
- Confidence: **High**

## C8. Client-controlled payment bypass in live checkout path
- Severity: **Critical**
- Area: Security / Payments
- Paths:
  - `app/shop/checkout/page.tsx:106-115` (`paymentBypass: true`)
  - `app/api/shop/orders/route.ts:111-114` (skip signature if bypass)
  - `lib/shop/logic.ts:321-323` (status influenced by bypass)
- What is wrong:
  - Client payload determines whether payment verification runs.
- Production impact:
  - Unpaid order creation and inventory depletion.
- Fix:
  - Remove bypass from public client/API path; verify payment server-side only.
- Confidence: **High**

## C9. Production build command unstable (heap OOM)
- Severity: **Critical**
- Area: DevOps / Release Safety
- Paths:
  - `package.json:7` (`build`)
  - `package.json:8` (`build:ci`)
- What is wrong:
  - `npm run build` failed in audit with JS heap OOM.
  - only memory-inflated `build:ci` succeeded.
- Production impact:
  - Deploy failure risk if environment uses default build command/insufficient memory.
- Fix:
  - Align production build command with safe memory budget and reduce build memory footprint.
- Confidence: **High**

---

## 6. High-priority issues (Confirmed)

## H1. Admin role checks broken in multiple routes
- Severity: **High**
- Area: Backend/Auth
- Paths:
  - `lib/server/auth/options.ts:73-81` (role stored in `session.user.role`)
  - `app/api/admin/programs/route.ts:10,52`
  - `app/api/admin/certificates/programs/route.ts:9,34`
  - `app/api/admin/certificates/templates/route.ts:9,35`
  - `app/api/admin/enrollments/bulk/route.ts:9`
  - `app/api/admin/enrollments/[id]/route.ts:11,35`
  - `app/api/admin/enrollments/[id]/complete/route.ts:11`
  - `app/api/admin/enrollments/[id]/revoke/route.ts:10`
  - `app/api/admin/certificates/programs/[id]/toggle/route.ts:10`
- What is wrong:
  - Checks `(session as any)?.role` instead of `session.user?.role`.
- Impact:
  - False 401s for valid admins/instructors.
- Fix:
  - Standardize with `getAuthorizedApiSession` or `session.user.role`.
- Confidence: **High**

## H2. Points redemption and awarding are non-atomic
- Severity: **High**
- Area: Database / Financial Integrity
- Paths:
  - `lib/points/pointsService.ts:51-79` (award)
  - `lib/points/pointsService.ts:89-119` (redeem)
- What is wrong:
  - Read-modify-write without DB transaction/locking.
  - multiple writes ignore returned errors.
- Impact:
  - race conditions, balance drift, ledger inconsistency.
- Fix:
  - move to transactional RPC (single atomic mutation + ledger insert).
- Confidence: **High**

## H3. Order discount may persist even when points redemption fails
- Severity: **High**
- Area: Backend / Finance
- Paths:
  - `app/api/shop/orders/route.ts:81-90`
- What is wrong:
  - Redemption failure only logs error after order creation.
- Impact:
  - undercharged orders and reconciliation issues.
- Fix:
  - transactionally couple order + points; or rollback/reprice order on redemption failure.
- Confidence: **High**

## H4. Certificate analytics event endpoint unauthenticated and error-swallowing
- Severity: **High**
- Area: Security / Data Integrity
- Paths:
  - `app/api/certificates/events/route.ts:5-54`
- What is wrong:
  - public writes to analytics tables
  - DB errors explicitly discarded (`void ...Error`).
- Impact:
  - analytics tampering and silent data loss.
- Fix:
  - signed event source / auth + strict validation + fail on DB errors.
- Confidence: **High**

## H5. Cron endpoint auth is optional
- Severity: **High**
- Area: Security / DevOps
- Paths:
  - `app/api/cron/birthday-points/route.ts:9-10`
  - `vercel.json:4-5`
- What is wrong:
  - if `CRON_SECRET` unset, endpoint accepts unauthenticated calls.
- Impact:
  - public triggering of reward logic.
- Fix:
  - fail closed when secret missing in production.
- Confidence: **High**

## H6. Admin programs UI/API contract mismatch + broken route target
- Severity: **High**
- Area: Frontend/API contract
- Paths:
  - `app/admin/programs/page.tsx:36-40,126-147,152`
  - `app/api/admin/programs/route.ts:40,60-70`
  - `app/admin/programs/[id]/template-editor/page.tsx:24,42`
- What is wrong:
  - UI posts/reads `title/baseFee/beltLevels`, API expects `name/type/...`
  - UI links `/admin/programs/{id}/template`, page exists as `/template-editor`
- Impact:
  - broken admin flow for program creation/editing.
- Fix:
  - shared DTO/schema and route constants.
- Confidence: **High**

## H7. Auth stack fragmentation with secret-handling mismatch
- Severity: **High**
- Area: Security / Operability
- Paths:
  - `lib/server/auth/student.ts:9-15` (throws if no `JWT_SECRET`)
  - `lib/server/auth_legacy.js:4-9` (falls back to `NEXTAUTH_SECRET`)
  - `app/api/auth/me/route.ts:4`
  - `app/api/shop/orders/route.ts:10`
- What is wrong:
  - mixed auth implementations with different secret requirements.
- Impact:
  - production-only runtime failures and inconsistent token verification.
- Fix:
  - consolidate into single auth module and one secret policy.
- Confidence: **High**

## H8. Production dependency vulnerabilities (prod graph)
- Severity: **High**
- Area: Security / Supply Chain
- Paths:
  - `package.json:40` (`next@16.1.6`)
  - `package.json:42` (`next-pwa`)
  - `package.json:41` (`next-auth`)
- What is wrong:
  - `npm audit --omit=dev`: 16 vulns (7 high, 9 moderate).
- Impact:
  - known vulnerable transitive/runtime components.
- Fix:
  - patch `next` and dependency chain, re-audit with policy gate.
- Confidence: **High**

## H9. Full lint fails massively; quality baseline is not enforceable
- Severity: **High**
- Area: Code Quality / Release Risk
- Paths:
  - repo-wide (`npm run lint`)
- What is wrong:
  - 557 issues (479 errors, 78 warnings), including hook-rule violations.
- Impact:
  - elevated runtime regression risk and maintainability collapse.
- Fix:
  - staged lint remediation and CI enforcement ramp.
- Confidence: **High**

## H10. Public certificate listing by SKF ID without auth
- Severity: **High**
- Area: Privacy / API
- Paths:
  - `app/api/certificates/public/route.ts:4-40`
- What is wrong:
  - endpoint reveals certificate metadata for any `skfId`.
- Impact:
  - identity-linked achievement data scraping.
- Fix:
  - require auth or signed public token; add rate limits.
- Confidence: **High**

## H11. Certificate search endpoint performs unbounded full-athlete scan
- Severity: **High**
- Area: Performance / API
- Paths:
  - `app/api/certificates/search/route.ts:13-32`
- What is wrong:
  - loops all athletes and achievements in request path.
- Impact:
  - poor scalability, easy abuse, latency spikes.
- Fix:
  - indexed lookup table or precomputed mapping + rate limit.
- Confidence: **High**

## H12. Large API surface bypasses standardized route guard stack
- Severity: **High**
- Area: Architecture / Security consistency
- Paths:
  - 50/64 API route files do not use `withRoute`.
- What is wrong:
  - auth/validation/rate-limit/error handling behavior diverges widely.
- Impact:
  - inconsistent security and reliability posture.
- Fix:
  - migrate legacy routes into unified `withRoute` pipeline.
- Confidence: **High**

---

## 7. Medium and low-priority issues (Confirmed)

## M1. Health check can report healthy DB on query-level error
- Severity: **Medium**
- Area: Observability
- Paths:
  - `src/server/services/health.service.ts:10-13`
- What is wrong:
  - result error is ignored; only thrown exceptions mark unhealthy.
- Fix:
  - inspect `{ error }` from Supabase response explicitly.
- Confidence: **High**

## M2. CSP includes `unsafe-inline` and `unsafe-eval`
- Severity: **Medium**
- Area: Security
- Paths:
  - `next.config.mjs:63-64`
- What is wrong:
  - permissive CSP weakens XSS defense.
- Fix:
  - migrate to nonce/hash CSP.
- Confidence: **High**

## M3. CI quality gate is backend-narrow and misses full-risk checks
- Severity: **Medium**
- Area: DevOps
- Paths:
  - `.github/workflows/backend-quality.yml:25-35`
  - `package.json:11` (`lint:backend`)
- What is wrong:
  - no full lint, no security audit step, no deterministic e2e step.
- Fix:
  - add full lint + audit policy + e2e with app startup.
- Confidence: **High**

## M4. E2E harness is non-deterministic and one test is empty
- Severity: **Medium**
- Area: Testing
- Paths:
  - `playwright.config.ts:3-7`
  - `tests/e2e/auth.spec.ts:8-11`
- What is wrong:
  - no `webServer`; second test has no assertion.
- Impact:
  - flaky/low-signal e2e confidence.
- Fix:
  - configure server startup and meaningful assertions.
- Confidence: **High**

## M5. Public-facing portal sections are mock-driven
- Severity: **Medium**
- Area: Product correctness
- Paths:
  - `app/portal/fees/page.js`
  - `app/portal/notices/page.js`
  - `app/portal/grading/page.js`
  - `app/portal/trophy-room/page.js`
- What is wrong:
  - hardcoded mock data and placeholder interactions in user-visible routes.
- Impact:
  - production trust/accuracy issues.
- Fix:
  - replace with real data or clearly gate as beta/non-prod.
- Confidence: **High**

## M6. Dead/unused surface is very large
- Severity: **Medium**
- Area: Maintainability
- Evidence:
  - `npx knip --no-progress`: 88 unused files, 152 unused exports, 89 unused exported types.
- Impact:
  - increased change risk and cognitive load.
- Fix:
  - staged removal with integration checks.
- Confidence: **High**

## M7. Docs and env contract drift
- Severity: **Medium**
- Area: DevEx / Ops
- Paths:
  - `.env.example:2-4`
  - `src/server/config/env.ts:38-45`
  - `README.md:33-40`
- What is wrong:
  - legacy env names coexist with new names; README references stale files/paths.
- Impact:
  - misconfiguration and onboarding/deploy errors.
- Fix:
  - single authoritative env matrix and docs refresh.
- Confidence: **High**

## M8. Multiple SQL schema sources increase drift risk
- Severity: **Medium**
- Area: Database / Release
- Paths:
  - `database/schema.sql`
  - `database/supabase_certificates.sql`
  - `SUPABASE_SCHEMA.sql`
- What is wrong:
  - multiple overlapping schema definitions.
- Impact:
  - migration drift and environment divergence.
- Fix:
  - keep one canonical schema + explicit migrations.
- Confidence: **High**

## M9. Duplicate notification APIs with divergent behavior
- Severity: **Medium**
- Area: API design
- Paths:
  - `app/api/admin/notifications/route.ts`
  - `app/api/admin/enrollments/notify/route.ts`
- What is wrong:
  - overlapping functionality, inconsistent logic.
- Impact:
  - drift and maintainability risk.
- Fix:
  - consolidate into one notification service/route.
- Confidence: **High**

## M10. `admin/notifications` performs unawaited DB update side-effects
- Severity: **Medium**
- Area: Data consistency
- Paths:
  - `app/api/admin/notifications/route.ts:88-93`
- What is wrong:
  - update executed without awaiting completion.
- Impact:
  - notification state can be silently stale.
- Fix:
  - await and handle update failure.
- Confidence: **High**

## M11. Mixed JS/TS legacy route stack with uneven controls
- Severity: **Medium**
- Area: Architecture
- Paths:
  - e.g. `app/api/auth/portal/session/route.js`, `app/api/portal/videos/route.js`, `app/api/portal/fees/pay/route.js`
- What is wrong:
  - legacy JS routes bypass newer validation/auth scaffolding.
- Impact:
  - inconsistent behavior and security posture.
- Fix:
  - migrate legacy routes to TS + `withRoute`.
- Confidence: **High**

## M12. API route count and build output include stale/debug routes
- Severity: **Medium**
- Area: Release hygiene
- Paths:
  - `/api/test-db`, `/api/students/lookup`, `/api/portal/fees/pay`, `/api/portal/receipts/[receiptId]` appear in build output.
- Impact:
  - unnecessary attack surface in production bundle.
- Fix:
  - remove or production-gate unused routes.
- Confidence: **High**

## M13. `next build` memory requirement not encoded in deployment contract
- Severity: **Medium**
- Area: DevOps
- Paths:
  - `package.json:7-8`
- What is wrong:
  - only CI script sets heap size.
- Impact:
  - environment-specific release failures.
- Fix:
  - enforce consistent build command in deployment config.
- Confidence: **High**

## M14. `app/api/proxy/thumbnail` can fetch arbitrary URL stored in admin-managed content
- Severity: **Medium**
- Area: Security/Performance
- Paths:
  - `app/api/proxy/thumbnail/route.ts:28-38`
- What is wrong:
  - fetch target may be arbitrary if `thumbnailUrl` is set.
- Impact:
  - SSRF-lite/internal fetch risk and uncontrolled external IO.
- Fix:
  - host allowlist + fetch timeouts + content-length limits.
- Confidence: **Medium**

## M15. Hook correctness violations in shipped UI code
- Severity: **Medium**
- Area: Frontend
- Paths:
  - `app/_components/CinematicValues.tsx:27,36,37,40,43,44,46,47,159,160,163,164`
  - `app/_components/athlete/profile/AthleteProfileClient.tsx:259-268` (hook after early return path)
- What is wrong:
  - conditional hook calls and ordering hazards.
- Impact:
  - runtime instability/regression under updates.
- Fix:
  - refactor hooks to unconditional top-level calls.
- Confidence: **High**

## M16. Excessive lint debt in core data/repo/service layers
- Severity: **Medium**
- Area: Code quality
- Evidence:
  - large number of `any`, unused vars, rule violations in repositories/services and tests.
- Impact:
  - brittle code and weak type safety on critical paths.
- Fix:
  - prioritize strict typing in auth/payments/certificates/points first.
- Confidence: **High**

## M17. `README.md` project structure references stale files
- Severity: **Low**
- Area: Docs
- Paths:
  - `README.md:33-40`
- What is wrong:
  - references `api.js`, `data-store.js`, `proxy.js` while implementation moved.
- Impact:
  - operator/dev confusion.
- Fix:
  - update docs to current architecture.
- Confidence: **High**

## M18. Minor duplication/logic noise in admin programs endpoint
- Severity: **Low**
- Area: Cleanup
- Paths:
  - `app/api/admin/programs/route.ts:42-48`
- What is wrong:
  - duplicate required field check block.
- Impact:
  - low direct impact, indicates weak review hygiene.
- Fix:
  - remove duplicate and centralize validation schema.
- Confidence: **High**

---

## 8. Unused / dead / redundant code review

### 8.1 High-confidence safe-to-triage candidates

- `lib/utils/student-profile.ts`
- `lib/server/repositories/products.ts`
- `lib/server/student-athlete-sync.ts`
- `lib/receipts/ReceiptDocument.tsx`
- `app/_components/pages/home/HomeContactPopup.tsx`
- `app/_components/pages/home/HomeSenseisTeaser.tsx`

These were flagged by static usage analysis (`knip`) and additionally had no in-repo references in route/component paths.

### 8.2 Additional dead surface (from knip)

- Unused files: **88**
- Unused exports: **152**
- Unused exported types: **89**

Representative examples include:
- `data/schema/*` (large portions)
- `data/factories/*`
- `app/_components/points/*`
- `hooks/useInView.ts`
- `next-sitemap.config.js` (still used via `postbuild`, but exports/findings around neighboring unused modules remain)

Note: any deletion plan should be staged with route-level smoke tests to avoid false positives from framework dynamic loading.

---

## 9. Security review (consolidated)

### 9.1 Confirmed security blockers
- C1, C2, C3, C4, C5, C6, C7, C8, H5, H10, H11

### 9.2 Confirmed hardening gaps
- permissive CSP (`unsafe-inline`/`unsafe-eval`)
- fragmented auth architecture and policy drift
- uneven route protection stack (only 14/64 using standardized wrapper)
- optional cron auth when env missing
- production dependency vulnerabilities present

### 9.3 Secret handling posture

- no committed `.env` secrets found in tracked files during audit
- env naming drift increases chance of missing secrets at deploy time

---

## 10. DevOps / deployment / observability review

### 10.1 Build and release safety

- `npm run build`: failed with heap OOM during audit
- `npm run build:ci`: passed (heap expanded)
- release process is sensitive to environment memory profile

### 10.2 CI/CD quality gate

Current workflow (`.github/workflows/backend-quality.yml`) runs:
- type-check
- backend lint subset
- unit tests
- build:ci

Missing from CI gate:
- full lint
- security audit policy gate
- deterministic e2e
- route/auth regression tests for high-risk APIs

### 10.3 Health and observability

- health endpoint exists and emits status payloads
- DB health check logic is incomplete (M1)
- logging is mixed: structured in new stack, ad-hoc console logs in legacy routes

### 10.4 Rollback and deploy-time failure modes

- default build instability can block deployment
- mock-success behavior in several services can conceal failed dependencies in production

---

## 11. Performance and scalability review

### 11.1 Confirmed bottlenecks

- certificate search does O(all athletes * achievements) per request
- notification/enrollment enrichment includes per-record fetch patterns
- points/order critical writes are non-transactional and concurrency-sensitive

### 11.2 Cache and rate-limit posture

- newer routes have cache + rate-limit support via wrapper stack
- many legacy endpoints lack equivalent protections

### 11.3 Resource usage risk

- default build hitting memory ceiling indicates compile-time resource strain

---

## 12. Test coverage and quality review

### 12.1 Results at audit time

- `test:unit`: pass (10 files, 37 tests)
- `test:e2e`: fail
  - `portal login page loads` expected text not found
  - second test timed out and contains no assertion

### 12.2 Coverage gaps in critical areas

Missing robust integration tests around:
- payment/order signature enforcement
- certificate auth boundary checks
- portal auth edge cases (legacy + new auth module interaction)
- points ledger atomicity/failure paths
- admin authorization role checks

---

## 13. Explicit checklist requested by user (status)

### files imported but never used
- **Confirmed present** (large set via lint + knip)

### code exists but never reachable
- **Confirmed likely in several endpoints/components** (unused routes/components and dead exports)

### components rendered but never referenced
- **Confirmed candidates** via knip unused file list

### duplicated utilities and business logic
- **Confirmed** in notifications and checkout/payment paths, and auth stacks

### hidden assumptions in env/config
- **Confirmed** (mixed env names + secret requirement mismatch)

### mismatches between docs and implementation
- **Confirmed** (`README.md` structure and env references stale)

### missing error handling around network/database operations
- **Confirmed** in multiple legacy routes and points service paths

### production-only failures not visible in basic local testing
- **Confirmed risk** via build memory sensitivity and env-secret divergence

### migration/schema drift risks
- **Confirmed** due multiple schema files and legacy/deprecated SQL artifacts

### deploy-time failures caused by missing build artifacts or unsafe scripts
- **Confirmed risk** due default build OOM and inconsistent command assumptions

---

## 14. Recommended remediation plan

## Phase 0 (Immediate blockers: 24-72 hours)
1. remove or secure public debug/PII routes (`/api/test-db`, `/api/students/lookup`)
2. remove query-based certificate admin bypass
3. disable client-controlled payment bypass and enforce server verification
4. lock down or remove `set-pin` flow
5. secure `/api/portal/fees/pay` and `/api/portal/receipts/[id]`
6. make cron auth fail-closed

## Phase 1 (Security and correctness hardening: week 1)
1. patch admin role checks to `session.user.role` / `getAuthorizedApiSession`
2. migrate highest-risk legacy routes to `withRoute`
3. implement atomic points/order transactions
4. enforce strict fetch allowlists/timeouts for proxy endpoints
5. tighten CSP policy

## Phase 2 (Operational quality: week 2)
1. standardize build command and memory profile for deployment
2. expand CI to full lint + deterministic e2e + audit policy
3. fix health check accuracy and logging consistency
4. remove production mock-success behavior unless explicitly feature-flagged

## Phase 3 (Debt reduction: week 3+)
1. dead-code pruning (knip-driven staged removals)
2. consolidate duplicate APIs/services
3. unify auth system and env contract
4. clean docs and schema migration ownership

---

## 15. Final verdict

**NOT READY FOR PRODUCTION**

### Blocking reasons
- multiple critical security exposures
- payment/auth bypass vectors
- data integrity risks in financial/points flows
- unstable default build behavior
- insufficient full-stack quality gate and e2e signal

Production launch should be blocked until Phase 0 items are completed and re-audited.

---

## Appendix A: Command results summary

- `npm run type-check`: **PASS** (current state)
- `npm run build`: **FAIL** (heap OOM)
- `npm run build:ci`: **PASS**
- `npm run lint`: **FAIL** (557 problems)
- `npm run lint:backend`: **PASS**
- `npm run test:unit`: **PASS**
- `npm run test:e2e`: **FAIL**
- `npx knip --no-progress`: **FAIL (expected non-zero when unused found)** with large dead surface
- `npm audit --omit=dev --json`: **FAIL (vulnerabilities found)**

---

## Appendix B: Dependency vulnerability snapshot (prod)

From `npm audit --omit=dev --json`:
- total vulnerabilities: **16**
- high: **7**
- moderate: **9**

Notable:
- `next@16.1.6` flagged by advisories in vulnerable ranges
- chain involving `next-pwa`/workbox includes high-severity findings

---

## Appendix C: Notable file references index

- Auth:
  - `lib/server/auth/options.ts`
  - `lib/server/auth_legacy.js`
  - `lib/server/auth/student.ts`
  - `lib/server/requireRole.ts`
- Security-sensitive APIs:
  - `app/api/certificates/template-image/route.ts`
  - `app/api/certificates/[enrollmentId]/data/route.ts`
  - `app/api/certificates/[enrollmentId]/pdf/route.tsx`
  - `app/api/auth/portal/set-pin/route.js`
  - `app/api/shop/orders/route.ts`
  - `app/api/portal/fees/pay/route.js`
  - `app/api/portal/receipts/[receiptId]/route.js`
- Build/CI/Config:
  - `package.json`
  - `.github/workflows/backend-quality.yml`
  - `playwright.config.ts`
  - `next.config.mjs`
  - `.env.example`
  - `README.md`
  - `database/schema.sql`
  - `database/supabase_certificates.sql`
  - `SUPABASE_SCHEMA.sql`


---

## Appendix D: API routes not using `withRoute` (50 files)

```
app/api/admin/analytics/route.ts
app/api/admin/athletes/[id]/route.ts
app/api/admin/athletes/route.ts
app/api/admin/athletes/search/route.ts
app/api/admin/categories/route.ts
app/api/admin/certificates/programs/[id]/toggle/route.ts
app/api/admin/certificates/programs/route.ts
app/api/admin/certificates/templates/route.ts
app/api/admin/classes/route.ts
app/api/admin/enrollments/[id]/complete/route.ts
app/api/admin/enrollments/[id]/revoke/route.ts
app/api/admin/enrollments/[id]/route.ts
app/api/admin/enrollments/bulk/route.ts
app/api/admin/enrollments/notify/route.ts
app/api/admin/enrollments/route.ts
app/api/admin/events/[id]/publish-results/route.ts
app/api/admin/events/[id]/route.ts
app/api/admin/events/route.ts
app/api/admin/notifications/route.ts
app/api/admin/portal/route.ts
app/api/admin/programs/route.ts
app/api/admin/results/[id]/route.ts
app/api/admin/results/route.ts
app/api/admin/senseis/route.ts
app/api/admin/students/[skfId]/route.ts
app/api/admin/students/route.ts
app/api/athletes/search/route.ts
app/api/auth/[...nextauth]/route.ts
app/api/auth/portal/logout/route.js
app/api/auth/portal/session/route.js
app/api/auth/portal/set-pin/route.js
app/api/certificates/[enrollmentId]/data/route.ts
app/api/certificates/[enrollmentId]/pdf/route.tsx
app/api/certificates/events/route.ts
app/api/certificates/public/route.ts
app/api/certificates/search/route.ts
app/api/certificates/template-image/route.ts
app/api/cron/birthday-points/route.ts
app/api/points/award/route.ts
app/api/points/balance/route.ts
app/api/points/history/route.ts
app/api/points/leaderboard/route.ts
app/api/points/redeem/route.ts
app/api/portal/fees/pay/route.js
app/api/portal/receipts/[receiptId]/route.js
app/api/portal/videos/route.js
app/api/proxy/thumbnail/route.ts
app/api/shop/orders/route.ts
app/api/students/lookup/route.ts
app/api/test-db/route.ts
```

---

## Appendix E: Unused files from `knip` (88 files)

```
app/_components/admin/AdminNavbar.tsx
app/_components/admin/students/AdminStudentForm.tsx
app/_components/admin/students/AdminStudentFormShell.tsx
app/_components/athlete/SearchBox.tsx
app/_components/MobileStickyCTA.tsx
app/_components/pages/home/HomeContactPopup.tsx
app/_components/pages/home/HomePathsOfMastery.tsx
app/_components/pages/home/HomeSenseisTeaser.tsx
app/_components/pages/home/HomeStatsCounter.tsx
app/_components/points/PointsBadge.tsx
app/_components/points/PointsHistory.tsx
app/_components/points/TierProgressBar.tsx
app/_components/portal/ChildSwitcher.tsx
app/_components/portal/PortalProviders.tsx
app/about/_components/BookTrialCTAButton.tsx
app/classes/classes.css
app/portal/fees/fees.css
app/rankings/athlete.css
app/rankings/honours.css
app/robots.tsx
app/sitemap.tsx
app/verify/[skfId]/[enrollmentId]/verify.css
components/AnimatedSection.tsx
components/SponsorGrid.tsx
components/TestimonialCarousel.tsx
data/constants/branches.ts
data/constants/index.ts
data/constants/points.ts
data/constants/roles.ts
data/constants/routes.ts
data/factories/createAthlete.ts
data/factories/createEvent.ts
data/factories/createInstructor.ts
data/factories/createProduct.ts
data/factories/createTestimonial.ts
data/factories/helpers.ts
data/factories/index.ts
data/index.ts
data/mocks/athleteProfileMockData.ts
data/mocks/index.ts
data/schema/_relationships.ts
data/schema/athlete.ts
data/schema/authSession.ts
data/schema/beltExamination.ts
data/schema/certificateEvent.ts
data/schema/certificateTemplate.ts
data/schema/certificateView.ts
data/schema/danGrade.ts
data/schema/dojo.ts
data/schema/enrollment.ts
data/schema/event.ts
data/schema/galleryPhoto.ts
data/schema/index.ts
data/schema/instructor.ts
data/schema/kyuBelt.ts
data/schema/localEntities.ts
data/schema/points.ts
data/schema/portalSession.ts
data/schema/product.ts
data/schema/program.ts
data/schema/pushAndOtp.ts
data/schema/sheetsEntities.ts
data/schema/sheetsSync.ts
data/schema/testimonial.ts
data/schema/tournament.ts
data/schema/types.ts
data/schema/videoProgress.ts
data/scripts/seed.ts
data/seed/index.ts
data/seed/testimonials.ts
hooks/useInView.ts
lib/certificates/index.ts
lib/rankingCard/generateCard.ts
lib/receipts/ReceiptDocument.tsx
lib/server/auth.ts
lib/server/repositories/products.ts
lib/server/student-athlete-sync.ts
lib/types/certificates.ts
lib/utils/birthday.ts
lib/utils/certificates.ts
lib/utils/events.ts
lib/utils/index.ts
lib/utils/student-profile.ts
next-sitemap.config.js
scripts/apply-sensei-schema-and-seed.mts
scripts/generate-icons.js
scripts/generate-og.mjs
scripts/sync-below-dan-sensei-athletes.mts
```

---

## Appendix F: E2E failures captured during audit

- `tests/e2e/auth.spec.ts:3` failed: expected text `SKF` not found on `/portal/login`
- `tests/e2e/auth.spec.ts:8` failed: timeout on `page.goto('/portal/login')`

These failures occurred in current worktree state and should be treated as active reliability issues until stabilized.

---

## Appendix G: Build behavior captured during audit

- `npm run build`:
  - compilation stage completed
  - process later terminated with Node heap OOM (`Ineffective mark-compacts near heap limit`)
- `npm run build:ci` (`NODE_OPTIONS=--max-old-space-size=4096`): passed end-to-end

This mismatch indicates environment-dependent release fragility.
