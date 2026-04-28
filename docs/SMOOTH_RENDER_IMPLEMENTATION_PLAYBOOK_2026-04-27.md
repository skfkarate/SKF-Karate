# SKF Karate Website: Smooth Rendering + Security + Admin Reliability Implementation Playbook

**Date:** 2026-04-27  
**Audience:** Product owner, engineering, operations  
**Goal:** Make the site feel instant and premium for users, while being secure and production-stable for admins and attackers’ threat model.

---

## 0) Quick Summary (Read This First)

You are feeling a real UX issue: after a click, there is a dead pause before loading UI appears.  
This is a responsiveness problem (interaction latency), not only a backend speed problem.

### What we are doing
1. **Instant feedback at click time** (no dead click gap).
2. **Prefetch likely next routes/data** so navigation is warm before click.
3. **Consistent route loading boundaries (`loading.tsx`) and skeleton continuity**.
4. **Move heavy media from `/public` to object storage + CDN strategy**.
5. **Reduce main-thread and JS pressure** where interactions currently stall.
6. **Close security/auth/payment bypass risks first** so performance improvements don’t ship on unsafe foundations.

### What is already done now in code
- Added **inline pending feedback** for navigation clicks via `useLinkStatus`.
- Added **manual prefetch warming** for high-frequency routes (`/classes`, `/book-trial`, `/events`, `/rankings`, etc.).
- Added these changes to:
  - `components/navigation/LinkPendingIndicator.tsx`
  - `app/_components/Navbar.tsx`
  - `app/_components/Navbar.css`
  - `app/_components/pages/home/HomeHeroActions.tsx`

### Phase B implementation progress (now completed in code)
- Added reusable smart navigation wrapper for intent prefetch + pending status:
  - `components/navigation/PrefetchLink.tsx`
- Expanded smooth transitions across:
  - footer navigation and legal links
  - home funnel sections (`classes`, `senseis`, `top athletes`, `first class`, contact popup, hero/trial CTAs)
  - classes funnel (`/classes`, city pages, branch detail pages)
  - events funnel (`timeline cards`, event detail navigation, athlete profile links)
  - shop funnel (`listing`, `product detail`, `cart`, `checkout`, `success`, `orders`)
- Added route-level loading coverage for verification flow:
  - `app/verify/loading.tsx`
  - `app/verify/[skfId]/[enrollmentId]/loading.tsx`
- Removed artificial verification delay that was intentionally slowing navigation:
  - `app/verify/page.tsx`
- Added route transition telemetry capture:
  - `components/navigation/routeTransitionTelemetry.ts`
  - `components/navigation/RouteTransitionClickCapture.tsx`
  - `components/FirstPartyAnalyticsTracker.tsx` now attaches transition metrics to `page_view` metadata
  - Captures `click -> loading visible -> destination settled` timing where available

### Phase C implementation progress (iteration 1)
- Converted remaining homepage `background-image` hotspots to optimized `next/image` rendering:
  - `app/_components/pages/home/HomeBookTrialCTA.tsx`
  - `app/_components/pages/home/HomeSenseisTeaser.tsx`
- Replaced large avatar/background selections with lighter source assets and responsive sizing.
- Added dynamic-route loading boundaries to remove blank navigation gaps:
  - `app/classes/[city]/loading.tsx`
  - `app/classes/[city]/[branch]/loading.tsx`
  - `app/events/[slug]/loading.tsx`
  - `app/shop/[productId]/loading.tsx`
  - `app/shop/cart/loading.tsx`
  - `app/shop/checkout/loading.tsx`
  - `app/shop/orders/loading.tsx`
  - `app/shop/success/loading.tsx`
- Tuned global Next image output for modern formats and better cache behavior:
  - `next.config.mjs` (`images.formats` + `images.minimumCacheTTL`)

### Phase C implementation progress (iteration 2)
- Removed always-on mock portal videos from API payload (including the large local `.webm` path) to avoid accidental heavy media delivery in user flows:
  - `app/api/portal/videos/route.js`
- Added lazy/eager/fetch-priority/decoding hints to remaining portal `<img>` usage for better network scheduling and decode behavior:
  - `app/portal/videos/page.js`
  - `app/portal/notices/page.js`
  - `app/portal/timetable/TimetableClient.js`
- Added global top-edge route progress feedback so clicks immediately acknowledge navigation before content swap completes:
  - `components/navigation/GlobalRouteProgress.tsx`
  - `components/navigation/RouteTransitionClickCapture.tsx` updated for earlier pointer/key capture
  - `components/navigation/routeTransitionTelemetry.ts` now emits lifecycle events (`start`, `loading`, `settled`)
  - mounted in `app/layout.tsx` within `Suspense` for static-route compatibility
- Added static asset audit tooling to keep media growth visible and CI-enforceable:
  - `scripts/audit-static-assets.mjs`
  - `package.json` scripts: `audit:assets`, `audit:assets:ci`
- Wired asset-audit visibility into CI pipeline:
  - `.github/workflows/backend-quality.yml`
- Added portal route-level loading boundary for smoother in-portal navigation:
  - `app/portal/loading.js`
  - `app/portal/portal.css` (loading skeleton styles)
- Switched widespread default/fallback image path from `/gallery/In Dojo.jpeg` (~1.11 MB) to `/gallery/Training.jpeg` (~132 KB) across classes/sensei/admin seed + runtime fallbacks:
  - `lib/server/repositories/classes-live.ts`
  - `lib/server/repositories/senseis-live.ts`
  - `lib/classesData.ts`
  - `app/classes/[city]/page.tsx`
  - `app/classes/[city]/[branch]/BranchDetailClient.tsx`
  - `app/about/page.tsx`
  - and related admin/seed scripts/data defaults

### Phase C implementation progress (iteration 3)
- Added centralized media manifest and resolver utilities for CDN migration without wide code rewrites:
  - `data/media/manifest.json`
  - `data/media/manifest.ts`
  - `lib/media/resolveMediaUrl.ts`
- Wired homepage cinematic/high-impact visual surfaces to manifest keys:
  - `data/constants/homeContent.ts`
  - `app/_components/pages/home/HomeBookTrialCTA.tsx`
  - `app/_components/pages/home/HomeSenseisTeaser.tsx`
  - `app/_components/pages/home/HomePathsOfMastery.tsx`
  - `app/_components/CinematicValues.tsx`
- Added media manifest policy audit and CI hook:
  - `scripts/audit-media-manifest.mjs`
  - `package.json` scripts: `audit:media-manifest`, `audit:media-manifest:ci`
  - `.github/workflows/backend-quality.yml` now includes media-manifest audit step
- Added `NEXT_PUBLIC_MEDIA_CDN_ORIGIN` support for runtime CDN origin swap:
  - `.env.example`
  - `next.config.mjs` dynamic `images.remotePatterns` extension
- Added in-place oversized image optimization tooling and applied it to current `public/` assets:
  - `scripts/optimize-public-images.mjs`
  - `package.json` scripts: `optimize:images`, `optimize:images:dry`
  - Current run saved ~98 MB across large `jpg/jpeg/png/webp` assets.
- Removed untracked non-product 1.05 GB local `.webm` from `public/` by moving it to `scratch/media/` (keeps local file, removes static-delivery risk).

### Phase C implementation progress (iteration 4)
- Removed unreferenced heavy assets from live `public/` delivery surface (archived under `scratch/media/orphaned-public/`):
  - 5 `.HEIC` gallery sources
  - 1 local `.mp4` artifact (`train_the_elite_compressed.mp4`)
- Added HEIC conversion pipeline for portable JPEG derivation using `heic-convert` + `sharp`:
  - `scripts/convert-heic-images.mjs`
  - `package.json` scripts: `convert:heic`, `convert:heic:dry`
- Generated JPEG replacements for archived HEIC assets back into `public/gallery`:
  - `Belt Exam.jpeg`
  - `In dojo1.jpeg`
  - `In dojo2.jpeg`
  - `In dojo starred.jpeg`
  - `Kumite Training - Fun Day starred.jpeg`
- Added legacy path alias rewrites so any stale `.HEIC` URLs continue resolving to new `.jpeg` assets:
  - `next.config.mjs` (`legacyAssetAliases` + `rewrites`)
- Tightened CI asset gate from reporting mode to fail-capable mode:
  - `.github/workflows/backend-quality.yml` now runs `npm run audit:assets:ci`
- Re-encoded compatibility MP4 to keep smooth playback while reducing transfer cost:
  - `public/train the elite/train_the_elite_compressed.mp4` now ~891.8 KB (30 fps)
- Latest asset baseline after optimization/pruning:
  - `public/` total ~17.40 MB (from ~1.17 GB initial baseline at audit start)
  - `images` in `public/`: ~16.52 MB
  - `videos` in `public/`: ~891.8 KB
  - files `>=1MB`: 0
  - files `>=10MB`: 0

### Outcome target (mobile p75)
- INP <= 200ms
- LCP <= 2.5s
- CLS <= 0.1
- Click to visual feedback <= 100ms

---

## 1) Evidence Snapshot From Your Current Project

### 1.1 Current stack and architecture
- Framework: Next.js App Router (`next@16.1.6`) + React 19.
- Client-heavy navigation shell in `app/_components/Navbar.tsx`.
- Route-level loading files exist in many sections (`app/**/loading.tsx`).

### 1.2 Why users feel "delay before loading"
- The site had no explicit **link-pending micro-feedback** before route state visibly changes.
- Prefetch behavior was mostly default-only; default prefetch is **production-only** and not always enough for high-motion UX expectations.
- Some interactions/screens remain client-heavy, so main-thread pressure can delay visible response.

### 1.3 Media pressure findings
- `public/` total in current workspace audit: **~1.17 GB**.
- Files > 1 MB in `public/`: **26**.
- Biggest files currently include:
  - `public/Samay Raina - STILL ALIVE (Full Special).webm` (~1.05 GB)
  - `public/news/ishaan.png` (~33.8 MB)
  - `public/news/roshan.png` (~33.2 MB)
  - Multiple gallery files in ~1.1–4.0 MB range
- This is a major source of render/network/decode delay risk.

---

## 2) Root Cause Model For Your Exact Complaint

Your reported flow: **click -> pause -> loading page appears -> content appears**.

This usually happens when one or more of these conditions occur:
1. Navigation starts, but no immediate local UI acknowledgment exists.
2. Prefetch wasn’t completed (or route is dynamic and needs server round trip).
3. Main thread is busy (JavaScript, handlers, layout work), delaying visible update.
4. Destination depends on heavy media/data before meaningful first paint.

To feel "Apple-like smooth", we must optimize both:
- **Actual speed** (network/CPU/data/image).
- **Perceived speed** (instant acknowledgment + stable progressive loading).

---

## 3) Best-Site Playbook (Mapped To This Repo)

These are the patterns high-polish sites consistently use:

1. **Immediate acknowledgment**
- A click always gets visual confirmation in <= 100ms.
- Implemented via `useLinkStatus` indicator now, and should be expanded to key CTA links.

2. **Predictive warm-up**
- Prefetch on viewport/hover/intent for likely next routes.
- Implemented for primary nav + hero CTAs; expand to funnel links (shop, athlete search, events detail).

3. **Fast shell, progressive content**
- Keep layout interactive while new segment streams.
- Enforce `loading.tsx` + useful skeletons for all important route groups.

4. **Media pipeline (not raw files in app static folder)**
- Variants, modern formats, immutable URLs, long-lived CDN caching.
- Move frequent/heavy assets out of `/public`.

5. **Main-thread discipline**
- Break long tasks, reduce rerenders, and avoid expensive synchronous work in hot click paths.

6. **Budgets + guardrails**
- No "hope-driven" performance: enforce Core Web Vitals and security gates in CI.

---

## 4) What Was Implemented Immediately (This Iteration)

### 4.1 Link pending feedback
- Added `components/navigation/LinkPendingIndicator.tsx`:
  - Uses `useLinkStatus` from `next/link`.
  - Shows fixed-size pending dot without layout shift.

### 4.2 Route intent prefetching
- `app/_components/Navbar.tsx`:
  - Added prefetch for core routes in `useEffect` and intent handlers (`onMouseEnter`, `onFocus`, `onTouchStart`).
- `app/_components/pages/home/HomeHeroActions.tsx`:
  - Added route prefetch warm-up for `/classes` and `/book-trial`.

### 4.3 UX styling for non-jarring pending state
- `app/_components/Navbar.css`:
  - Added `.link-pending-indicator` styles with subtle, lightweight transitions.

### 4.4 Validation status
- `npm run type-check`: **pass**.
- `npm run lint`: repo has large pre-existing error baseline unrelated to this patch (hundreds of existing violations).

---

## 5) Full Detailed Execution Plan (Project-Matched)

## Phase A: Stabilize Security + Instrumentation (Week 1)

### A1. Security blockers first
- Fix/close critical issues from audit (auth bypass, payment verification trust boundaries, proxy hardening, sensitive endpoint exposure).
- Ensure all sensitive write flows are server-verified and fail-closed.

### A2. Add field telemetry
- Create a minimal Web Vitals reporter component using `useReportWebVitals`.
- Send INP/LCP/CLS + route-change custom timings to your analytics pipeline.
- Add correlation IDs in API responses/logs.

### A3. Baseline dashboards
- Dashboard slices:
  - User: INP, LCP, CLS by route/device/network.
  - Admin: error rate, API latency, queue failures.
  - Security: auth failures, rate-limit hits, suspicious patterns.

### A4. Files to touch
- `app/layout.tsx` (mount vitals collector component)
- `app/_components/**` (optional route timing emitter)
- `app/api/**` (request IDs, structured logs)
- observability configs in CI/deploy pipeline

### A5. Acceptance
- Metrics visible in prod/staging within 24h.
- No high-risk security bypass path remains open.

---

## Phase B: Remove Click Dead Gap + Smooth Transitions (Week 2)

### B1. Extend instant-feedback pattern
- Apply pending indicator pattern to additional high-value link surfaces:
  - `app/_components/MobileStickyCTA.tsx`
  - `app/_components/Footer.tsx`
  - results/events/shop funnel links

### B2. Enforce loading boundaries coverage
- Confirm `loading.tsx` exists and is meaningful (layout-shaped skeleton, not blank spinner) for all critical routes:
  - `/book-trial`, `/classes`, `/events`, `/shop`, `/athlete/search`, `/portal/*`, `/admin/*` (where needed)

### B3. Fix full-page navigations
- Replace internal `<a href="/...">` with `Link` where client-side navigation is intended.
- Confirm no accidental hard navigations in public funnel.

### B4. Transition-safe rendering
- Use `useTransition` for expensive client-side filter/table state changes on hot interactive pages:
  - athlete search, events filters, ranking filters, admin heavy grids.

### B5. Acceptance
- On realistic mobile throttling, click feedback <= 100ms.
- No route exhibits blank dead zone before loading/skeleton feedback.

---

## Phase C: Image/Video Pipeline Migration (Week 3)

### C1. Strategy decision
Recommended for your current stack: **Vercel Blob + `next/image` + Vercel CDN/image optimization**.

Alternative if infra policy requires AWS: S3 + CloudFront + strict cache key/versioning.

### C2. Migration scope
Priority assets to migrate from `/public`:
- `public/news/*` giant files first (~35 MB each).
- `public/gallery/*` files > 1 MB.
- hero/CTA imagery currently used via CSS background URLs.

### C3. Implementation details
1. Add media service module (upload, metadata, signed/private handling as needed).
2. Store canonical metadata in DB (url, width, height, content type, checksum/version).
3. Generate responsive variants and modern formats (AVIF/WebP where useful).
4. Use `next/image` for all render paths that currently rely on raw `background-image` where optimization is needed.
5. Keep `/public` only for tiny, truly static assets.

### C4. Rendering rules
- Always provide dimensions or controlled `fill + sizes`.
- Use blur placeholders for LCP/hero candidates.
- Mark only one critical hero image as `priority` per route.
- Long-lived immutable caching for versioned assets.

### C5. Acceptance
- LCP image transfer size reduction >= 35% on mobile.
- Repeat-visit image cache hit improvement verified.

---

## Phase D: Main-Thread + Bundle + Motion Optimization (Week 4)

### D1. Bundle and script budget
- Create route-level bundle report.
- Lazy-load non-critical widgets and admin-only heavy modules.
- Reduce third-party script impact (`lazyOnload` where safe).

### D2. Interaction performance
- Find and split long tasks in hot routes (search/filter pages).
- Debounce/raf event handlers where relevant.
- Remove avoidable rerenders and expensive derived state in render path.

### D3. Motion system hardening
- Use `transform` and `opacity` animations for most effects.
- Remove or redesign layout-thrashing transitions.
- Respect `prefers-reduced-motion` while preserving style.

### D4. Acceptance
- INP p75 trend improves release-over-release.
- No measurable FPS collapse on scroll/hover-heavy screens.

---

## Phase E: Admin + Ops + Release Safety (Week 5)

### E1. Admin reliability
- Server-side pagination/filtering for large tables.
- Remove N+1 data access in admin dashboards.
- Add idempotency keys for repeat-sensitive actions.

### E2. Deploy and rollback safety
- CI gates:
  - type-check
  - lint (phase in once baseline cleanup starts)
  - unit + e2e smoke
  - security checks
  - performance budgets (Lighthouse CI / custom vitals budget)
- Rollback playbook with feature flags and canary rollout.

### E3. Observability maturity
- Add alerts on:
  - INP/LCP regressions
  - auth anomalies
  - payment/certificate flow failures
  - elevated error rates and p95 latency

### E4. Acceptance
- Admin workflows stable under load tests.
- Release checklist and rollback simulation completed.

---

## 6) User / Hacker / Admin Perspective Coverage

### User perspective
- Immediate click acknowledgment, stable skeleton loading, fewer large-media stalls.
- Better mobile experience on weak networks.

### Hacker perspective
- Stronger authz boundaries, hardened APIs, reduced exposed attack surface.
- Better logging + alerting for abuse and anomaly detection.

### Admin perspective
- Faster admin pages, safer operational actions, clear health/incident visibility.

---

## 7) Specific Repo-Level Actions Queue (Granular)

### Navigation smoothness queue
- `app/_components/Navbar.tsx` (done initial pass)
- `app/_components/pages/home/HomeHeroActions.tsx` (done initial pass)
- `app/_components/MobileStickyCTA.tsx` (pending)
- `app/_components/Footer.tsx` (pending)

### Media queue
- `app/_components/pages/home/HomeBookTrialCTA.tsx` (CSS background image to optimized image strategy)
- `app/_components/pages/home/HomeSenseisTeaser.tsx` (background-image usage)
- `app/about/page.tsx`, `app/shop/**`, `app/gallery/page.tsx` (optimize image usage, `sizes`, placeholders, priority rules)

### Interaction heavy routes queue
- `app/athlete/search/page.tsx`
- `app/events/EventsPageClient.tsx`
- `app/_components/results/ResultsTable.tsx`
- `app/admin/**` tables/forms where client updates are expensive

### Security queue
- Critical findings in `PRODUCTION_AUDIT_REPORT_2026-04-27.md` (execute by severity order)

---

## 8) Risks and Mitigations

1. **Risk:** Performance work changes visual character.  
   **Mitigation:** Visual QA + animation token constraints + regression snapshots.

2. **Risk:** Media migration breaks URLs/content references.  
   **Mitigation:** dual-read migration, redirect mapping, automated asset checker.

3. **Risk:** Security fixes break existing client assumptions.  
   **Mitigation:** staged rollout with feature flags + fallback adapters.

4. **Risk:** CI slows down too much.  
   **Mitigation:** split fast PR checks and deeper scheduled/nightly checks.

---

## 9) Definition of Done (Strict)

A phase is complete only if:
1. Code merged with tests.
2. Metrics improved against baseline (not subjective feel only).
3. No security regression introduced.
4. Operational runbook updated.
5. Rollback path validated.

---

## 10) Recommended Immediate Next Execution Order

1. Expand pending feedback + intent prefetch to remaining key links.
2. Add web-vitals/reporting component and baseline dashboards.
3. Start media migration with top 10 heaviest files in `/public`.
4. Execute critical security fixes from audit report before broader rollout.

---

## 11) Reference Sources (Current Official Guidance)

### Next.js (routing, loading, prefetching, performance)
- Prefetching guide (App Router): https://nextjs.org/docs/app/guides/prefetching
- `loading.js` / `loading.tsx`: https://nextjs.org/docs/app/api-reference/file-conventions/loading
- `useLinkStatus`: https://nextjs.org/docs/app/api-reference/functions/use-link-status
- `useReportWebVitals`: https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
- `public` file convention and caching note: https://nextjs.org/docs/basic-features/static-file-serving
- Image optimization getting started: https://nextjs.org/docs/app/getting-started/images

### Web performance (Core Web Vitals + practical optimization)
- INP metric: https://web.dev/inp/
- Optimize INP: https://web.dev/articles/optimize-inp
- Web Vitals overview: https://web.dev/articles/vitals
- Animation performance guidance: https://web.dev/animations-and-performance/
- Responsive images: https://web.dev/learn/design/responsive-images
- Preload responsive images: https://web.dev/articles/preload-responsive-images

### Real-world performance case studies
- Trendyol INP reduction + business impact: https://web.dev/case-studies/trendyol-inp
- redBus INP improvement + sales impact: https://web.dev/case-studies/redbus-inp

### Vercel storage/CDN/image delivery
- Vercel Blob: https://vercel.com/docs/vercel-blob
- Vercel image optimization: https://vercel.com/docs/image-optimization
- Vercel CDN cache: https://vercel.com/docs/caching/cdn-cache

### Security baseline references
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- Supabase: Securing your API: https://supabase.com/docs/guides/api/securing-your-api
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Data API hardening: https://supabase.com/docs/guides/database/hardening-data-api

---

## 12) Final Position

This system is **not yet production-ready** at the level you want (ultra-smooth + hardened + admin-reliable), but it is on a clear and feasible path.

The right path is **security-gated performance rollout**, not performance-only rollout:
- Security blockers fixed first.
- Smoothness and rendering improvements shipped in measured phases.
- Media architecture migrated from oversized static asset pattern to optimized storage + delivery.
- CI and observability enforcing quality continuously.
