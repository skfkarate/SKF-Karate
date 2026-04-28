# SKF Karate: Smooth UX + Fast Rendering + Security Hardening Master Plan

**Date:** 2026-04-27  
**Prepared for:** SKF Karate Website Team  
**Scope:** End-to-end user experience smoothness, rendering speed, image delivery architecture, API/security hardening, admin reliability.

---

## 0) Quick Summary (Read This First)

You want the site to feel as smooth as top-tier product sites (Apple-level polish), while also being secure and production-grade.

### What users are currently feeling
- They click a button.
- There is a pause.
- Then loading appears.
- Then content appears.
- This creates a “laggy” feeling even if total load time is not huge.

### Core plan
1. **Make feedback instant on click** (0–100ms): immediate visual response, no dead click gap.
2. **Prefetch likely next routes/data** before click so navigation feels instant.
3. **Stream and skeleton-load intelligently** so users always see useful UI while data loads.
4. **Move heavy images out of `/public` to CDN/object storage + optimized delivery**.
5. **Reduce main-thread blocking and JS weight** (the biggest reason click-to-loading feels delayed).
6. **Fix critical API/auth/security gaps first** so performance work happens on safe foundations.
7. **Measure everything with Core Web Vitals + user-journey metrics** and enforce budgets in CI.

### Success targets (p75, mobile-first)
- **INP <= 200ms** (interaction responsiveness)
- **LCP <= 2.5s**
- **CLS <= 0.1**
- **Route transition feedback <= 100ms after click**
- **Perceived route transition complete <= 1.2s for common routes**

### Execution order
- **Phase A (Week 1):** security blockers + observability baseline
- **Phase B (Week 2):** instant navigation UX + route prefetch + loading boundaries
- **Phase C (Week 3):** image pipeline + CDN migration
- **Phase D (Week 4):** bundle/animation/main-thread optimization
- **Phase E (Week 5):** admin reliability, scale tests, final polish

---

## 1) Design Principles Used by the Best Sites (and How We Apply Them)

Top polished sites generally follow a predictable engineering playbook:

1. **Immediate feedback wins over raw speed**
   - Even if backend takes 600ms, users must see feedback instantly.
   - We’ll make all primary actions acknowledge click immediately.

2. **Fast shell + progressive reveal**
   - Render layout instantly.
   - Stream expensive content into clear skeleton areas.

3. **Predictive fetching**
   - Prefetch route code/data before click where intent is likely.

4. **Media pipeline, not just image files**
   - Multiple sizes, modern formats, immutable caching, CDN edge delivery.

5. **Motion that is GPU-friendly**
   - Use `transform` and `opacity`, avoid layout-thrashing animations.

6. **Budgets and guardrails**
   - Performance and security budgets enforced in CI, not manual hope.

7. **Security baked into flow design**
   - Sensitive business flows are protected against automation and abuse.

---

## 2) Current State Snapshot (Project-Matched)

### 2.1 Positive foundation already present
- Next.js App Router architecture exists.
- Some new routes already use standardized `withRoute` abstractions.
- `next/image`, modern React stack, and caching helpers exist.

### 2.2 Main friction causing “click feels delayed”
- Large share of APIs/routes still in legacy patterns (inconsistent loading/caching/auth behavior).
- Main-thread work and client-heavy components in key screens.
- Route-level loading UI not consistently optimized for immediate transition perception.
- Image strategy is mixed; public-folder usage creates weak caching characteristics for frequently changed assets.

### 2.3 Critical production hardening still required
- Security and auth inconsistencies on several APIs.
- Client-controlled payment bypass logic exists.
- SSRF-style proxy risk and publicly exposed sensitive endpoints exist.

**Decision:** We do performance and polish **in parallel** with security blockers, but blocker fixes are first gate to production.

---

## 3) Objectives by Persona

## 3.1 User perspective (athlete/parent/public visitor)
- Clicks feel instant and trustworthy.
- Loading is graceful and informative (no blank dead zone).
- Images/video/thumbnails appear quickly and crisply across network/device conditions.
- Motion feels smooth, intentional, not janky.

## 3.2 Hacker perspective (threat model)
- Sensitive endpoints locked down.
- No auth bypass by query params or client flags.
- No open proxy/SSRF flows.
- Strong rate-limits on sensitive business actions.
- Logs and alerts detect abuse patterns early.

## 3.3 Admin perspective
- Admin pages feel responsive even on large datasets.
- Health/status panels reflect reality (no false-green checks).
- Notification/payment/certificate actions are reliable, auditable, and idempotent.

---

## 4) Performance Architecture Plan

## 4.1 Fix the click-to-loading dead gap (your top UX complaint)

### What we will implement
1. **Instant visual acknowledgment on click (0–100ms)**
   - Button press state + micro-feedback immediately in UI thread.
   - Do not wait for network before state changes.

2. **Route intent prefetching**
   - Use automatic Next prefetch plus manual `router.prefetch()` for high-probability next routes.
   - Prefetch on hover, on viewport exposure, and in key funnel steps.

3. **Segment-level `loading.tsx` + skeletons**
   - Add/standardize `loading.tsx` for routes where users frequently navigate.
   - Skeleton should mimic final layout to reduce perceived shift.

4. **Shared layout continuity**
   - Keep nav/header interactive during route transitions.
   - Avoid replacing whole page tree when only sub-content changes.

5. **Transition-safe state updates**
   - For expensive UI updates, wrap non-urgent work with `useTransition`.

### Where in this project
- `app/` major user funnels: home -> classes/events/shop/portal/athlete search.
- high-frequency interactive components in `app/_components/**`.

### Acceptance tests
- On 4G throttling, click to visible feedback <= 100ms for target CTAs.
- No route with blank state before loading/skeleton appears.

---

## 4.2 Data and rendering strategy (App Router best use)

1. **Prefer server components for data-heavy views**
   - Move logic off client bundles where possible.

2. **Cache and revalidate deliberately**
   - Use `fetch` cache options and tags for read-mostly data.
   - Use on-demand revalidation on writes.

3. **Streaming boundaries placement**
   - Keep above-the-fold shell static/cached.
   - Stream dynamic panels below predictable skeleton boundaries.

4. **Avoid sequential waterfalls**
   - Convert serial awaits to parallel `Promise.all` in route data loaders/services.

5. **Reduce overfetching**
   - Request only columns needed from Supabase/Sheets adapters.

### Acceptance tests
- Server timings show reduced waterfall depth on key routes.
- Repeat navigation should hit cache for stable sections.

---

## 4.3 Main-thread and bundle optimization

1. **Bundle audit per route**
   - Identify heavy client bundles and unnecessary imports.

2. **Lazy-load heavy interactive modules**
   - Dynamic import for non-critical or below-the-fold widgets.

3. **Animation constraints**
   - Limit animations to `transform` and `opacity` whenever possible.
   - Remove animations triggering layout/paint on large trees.

4. **Font optimization**
   - Standardize through `next/font` self-hosting.

5. **Third-party script strategy**
   - Move non-critical scripts to `lazyOnload`.

### Acceptance tests
- Reduced JS execution time in Lighthouse profile on mobile.
- Better INP percentile in field telemetry after rollout.

---

## 5) Image and Media Delivery Strategy (Biggest Rendering Win)

You asked specifically about image storage: keeping many files in `public` is simple but not optimal for high-performance, frequently changing media.

## 5.1 Why current pattern is suboptimal
- `public` assets are not safely long-cacheable by default in Next docs (`max-age=0`) because assets may change.
- This weakens browser cache hit efficiency for frequently viewed media.
- Large image files in original formats increase download + decode time.

## 5.2 Target architecture

### Option A (best fit for Vercel-native stack): **Vercel Blob + `next/image` + Vercel Image Optimization**
- Store user/content images in Blob (public/private based on need).
- Serve through immutable URLs.
- Render via `next/image` for responsive sizes and modern formats.
- Keep only tiny truly-static assets in `public` (icons, logos, immutable tiny art).

### Option B (equally valid): **S3 + CloudFront + `next/image` remote patterns**
- Good if you need broader infra control or multi-environment governance.

### Option C: **Cloudflare Images**
- Strong managed variant pipeline and global delivery.

## 5.3 Image pipeline rules (mandatory)
1. Create responsive variants (`320, 640, 960, 1280, 1920` as needed).
2. Prefer AVIF/WebP with quality tuned by asset type.
3. Provide width/height always to prevent layout shift.
4. Use blur placeholders for large hero/product images.
5. Mark only top LCP hero as `priority`; all others lazy.
6. Use immutable naming/versioning for long cache lifetime.
7. Compress source uploads at ingestion time (not at request only).

## 5.4 Project implementation map
- Configure `next.config.mjs` remote patterns for media host(s).
- Build media helper for upload + metadata + canonical URL.
- Migrate product/gallery/portal thumbnails away from heavy raw public assets.
- Keep `/public` for minimal static assets and branding essentials.

### Acceptance tests
- LCP image byte size reduction >= 35% on mobile.
- Significant repeat-visit cache hit improvements.
- CLS remains <= 0.1 due to fixed dimensions.

---

## 6) Security & API Hardening Plan (Hacker Perspective)

## 6.1 Immediate blocker fixes
1. Remove/secure public debug and PII endpoints.
2. Remove query-parameter-based admin bypass in certificates.
3. Remove client-controlled payment bypass and enforce server-side verification.
4. Lock down PIN setup/account flows and enforce proper challenge.
5. Close SSRF/open proxy behavior in image proxy endpoints.
6. Enforce cron auth fail-closed in production.

## 6.2 Structural hardening
1. Migrate legacy APIs to standardized route wrapper (`withRoute`) with:
   - schema validation
   - auth/role checks
   - consistent rate limiting
   - consistent error model + request IDs
2. Consolidate auth modules into one canonical policy.
3. Use RLS discipline + least privilege for Supabase public schema surfaces.
4. Add abuse-rate controls for sensitive business flows.
5. Add security CI checks: dependency audit gating + endpoint inventory checks.

## 6.3 Financial/data integrity hardening
- Make order + points operations transactional/idempotent.
- Enforce webhook verification and write-side idempotency keys.
- Never swallow DB errors on financial writes.

### Acceptance tests
- Pen-test checklist passes for known critical paths.
- No sensitive endpoint accessible without auth.
- Payment/order consistency tests pass under concurrency.

---

## 7) Admin and Operational Excellence Plan

## 7.1 Admin UX performance
- Add pagination and server-side filtering for large tables.
- Replace N+1 enrichment patterns with batched lookups.
- Preload likely next admin views for frequent workflows.

## 7.2 Health and observability
- Correct health checks to reflect true dependency state.
- Centralize structured logging in all routes.
- Add dashboards for:
  - p75 LCP/INP/CLS
  - route error rate
  - certificate/payment flow failures
  - queue depth and retry counts

## 7.3 CI/CD safety
- Expand CI to include:
  - full lint
  - type-check
  - unit tests
  - deterministic e2e
  - security audit thresholds
  - performance budget checks (Lighthouse CI on key routes)

### Acceptance tests
- CI prevents regressions on performance/security budgets.
- Admin SLOs met for core workflows.

---

## 8) Detailed Implementation Backlog (Project-Matched)

## 8.1 Week 1: Security blockers + measurement foundation

### Tasks
1. Patch critical API exposures and bypasses (as identified in audit report).
2. Add web-vitals reporting component using `useReportWebVitals`.
3. Define SLO dashboards and baseline measurements.
4. Add route transition telemetry: click -> first loading paint -> content ready.

### Deliverables
- `security_hotfix` PR
- `web_vitals_baseline` PR
- Baseline report (before numbers captured)

## 8.2 Week 2: Smooth transition system

### Tasks
1. Add/standardize `loading.tsx` in top route segments.
2. Implement button-level immediate feedback states.
3. Add prefetch for high-probability navigation links.
4. Remove blocking synchronous work from click handlers.
5. Introduce `useTransition` where expensive updates block responsiveness.

### Deliverables
- `smooth_navigation_phase1` PR
- UX validation videos (before/after)

## 8.3 Week 3: Image pipeline migration

### Tasks
1. Choose storage backend (recommend Vercel Blob for current stack match).
2. Add upload pipeline + metadata + variant policy.
3. Move heavy visual assets from `/public` to object storage.
4. Update components to `next/image` best practices.
5. Tune hero image priorities and placeholders.

### Deliverables
- `media_pipeline_phase1` PR
- LCP/image byte-size comparison report

## 8.4 Week 4: Bundle + animation optimization

### Tasks
1. Route-by-route bundle analysis and split plan.
2. Dynamic import non-critical client modules.
3. Animation audit and rewrite expensive properties.
4. Script loading strategy cleanup.

### Deliverables
- `bundle_and_motion_phase1` PR
- INP and JS execution improvements report

## 8.5 Week 5: Admin reliability + scale readiness

### Tasks
1. Remove remaining N+1 patterns.
2. Add transactional integrity to order/points flows.
3. Expand CI quality gates + performance budgets.
4. Final hardening and cleanup of dead routes/code.

### Deliverables
- `admin_scale_reliability` PR
- Production readiness signoff checklist

---

## 9) Definition of Done (DoD)

A phase is “done” only if:

1. **Code merged** with tests.
2. **Metrics improved** vs baseline (not just subjective feel).
3. **No regression** in security checks.
4. **Documented runbook** for admin/ops.
5. **Rollback path verified**.

---

## 10) Risk Register and Mitigations

1. **Risk:** Performance fixes break visual style/motion identity.  
   **Mitigation:** use visual regression checks and design review before merge.

2. **Risk:** Security patches break existing client assumptions.  
   **Mitigation:** compatibility adapter layer + staged deprecations.

3. **Risk:** Image migration causes broken URLs.  
   **Mitigation:** migration map, dual-read period, automated URL validator.

4. **Risk:** CI becomes slower.  
   **Mitigation:** split fast smoke pipeline and nightly deep pipeline.

---

## 11) What We Will Do First (Immediate Action List)

If you approve, the first implementation sprint I will execute is:

1. Lock down critical API/security bypasses.
2. Add route transition responsiveness instrumentation.
3. Add instant loading/skeleton boundaries to key user routes.
4. Add prefetch strategy for high-frequency navigation.
5. Start media backend setup and migrate first high-impact image groups.

---

## 12) Reference Playbook (Official Sources)

### Next.js (routing, loading, caching, image, vitals)
- Loading UI file convention (`loading.js` / `loading.tsx`): https://nextjs.org/docs/app/api-reference/file-conventions/loading
- Prefetching guide: https://nextjs.org/docs/app/guides/prefetching
- Image optimization (`next/image`): https://nextjs.org/docs/app/getting-started/images
- Caching and revalidating: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
- useReportWebVitals: https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
- Public folder caching behavior: https://nextjs.org/docs/app/building-your-application/optimizing/static-assets

### Vercel (CDN + image + storage)
- Vercel CDN cache: https://vercel.com/docs/caching/cdn-cache
- Image optimization on Vercel: https://vercel.com/docs/image-optimization
- Vercel Blob: https://vercel.com/docs/vercel-blob
- Storage overview: https://vercel.com/docs/storage

### Web performance engineering (Core Web Vitals + animations + images)
- INP metric: https://web.dev/inp/
- Optimize INP: https://web.dev/articles/optimize-inp
- LCP metric: https://web.dev/articles/lcp
- Web Vitals overview: https://web.dev/articles/vitals
- Animation performance: https://web.dev/animations-and-performance/
- Responsive images: https://web.dev/learn/design/responsive-images
- Preload responsive images: https://web.dev/articles/preload-responsive-images

### React (responsive state transitions)
- `useTransition`: https://react.dev/reference/react/useTransition
- `Suspense`: https://react.dev/reference/react/Suspense

### Security (API threat model)
- OWASP API Top 10 (2023): https://owasp.org/API-Security/editions/2023/en/0x11-t10/

### Supabase security posture and API hardening guidance
- Securing your API (RLS): https://supabase.com/docs/guides/api/securing-your-api
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Hardening Data API: https://supabase.com/docs/guides/database/hardening-data-api

---

## 13) Final Note

This plan is designed to match your exact ask:
- smoothness first (user feeling)
- speed and rendering quality
- robust image delivery strategy
- hacker-proofing and admin-grade reliability
- measurable, phased, production-safe execution

When you confirm, I will start executing **Phase A + Phase B** directly in the codebase with PR-style incremental changes and keep every step measurable.
