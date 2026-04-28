# SKF Karate: Free-First Production Rendering + Media Plan

**Date:** 2026-04-27  
**Goal:** Keep the platform as close to zero-cost as possible while making interactions feel immediate, media delivery reliable, and production operations safe for users, admins, and security posture.

---

## 1) Quick Summary (2-minute read)

1. **Do not use Google Drive links as live production image/video hosting.** Keep Drive only for internal intake/review.
2. **Use object storage + CDN delivery** for production media URLs (free-first path: Cloudflare R2 + CDN fronting).
3. **Keep app navigation instantly responsive** with immediate transition feedback, prefetching, and loading boundaries.
4. **Treat performance and security as one program**: fast UX is useless if auth/payment paths are bypassable.
5. **Run with budgets and guardrails** (asset limits, Core Web Vitals targets, CI checks) so performance stays good as content grows.

---

## 2) Direct Answer: Should we host images/videos via Google Drive links?

### Recommendation
**No, not for production delivery.**

### Why
1. Drive is not a CDN-first media delivery layer.
2. API and serving are quota/rate-limit constrained and may return throttling errors under traffic.
3. Cache behavior, URL durability, and transformation pipeline control are weak compared to CDN/object storage workflows.
4. Operational ownership is harder (invalidations, variants, access patterns, monitoring).

### Best use of Drive
Use Drive as **editorial intake only**:
- team uploads raw assets to Drive folder,
- a pipeline pulls/validates/optimizes,
- optimized variants are published to canonical production storage.

---

## 3) Free-First Architecture That Matches This Repo

## A) Application Runtime
1. Keep Next.js app deployment where currently stable (existing pipeline).
2. Maintain server rendering and route-level loading states for dynamic pages.
3. Keep first-party analytics + route transition telemetry to detect regressions.

## B) Media Delivery (images + videos)
1. Canonical media source: object storage bucket (R2-style).
2. Public delivery domain: `media.<your-domain>` or equivalent CDN URL.
3. Immutable versioned file keys (e.g. `/images/home/hero.v20260427.avif`).
4. Long cache headers for immutable assets.
5. Avoid shipping large originals in `public/` once migrated.

## C) Optional Rendering Layers
1. Image transform layer for responsive variants if required.
2. Pre-generated video renditions (HLS ladder) for fast start and adaptive playback.

---

## 4) What Has Already Been Implemented in This Repository

1. Expanded link prefetch and pending indicators across primary funnels.
2. Added route transition telemetry instrumentation and analytics attachment.
3. Added many route-level `loading.tsx` boundaries (including dynamic segments).
4. Removed artificial verify-page navigation delay.
5. Reduced heavy default image fallbacks to lighter alternatives.
6. Added static asset audit tooling and CI integration.
7. Added global route transition progress bar and earlier click capture to reduce perceived dead-click gaps.
8. Added a media manifest + resolver layer with optional `NEXT_PUBLIC_MEDIA_CDN_ORIGIN` override for CDN cutover without app-wide rewrites.
9. Added media manifest policy audit script to block unsupported hosting patterns (for example Drive hotlinks) in canonical media definitions.
10. Added an automated oversized-image optimizer script and used it to significantly shrink existing public image payloads.
11. Pruned unreferenced heavy static HEIC/MP4 artifacts from live `public/` and added legacy HEIC URL aliases to converted JPEGs.
12. Reduced the remaining compatibility MP4 to sub-1MB and validated CI asset gates with zero files above 1MB.

## 4.1 Current Baseline Snapshot (validated)

1. `public/` total payload: **~17.40 MB**.
2. `images` in `public/`: **~16.52 MB**.
3. `videos` in `public/`: **~891.8 KB**.
4. Files `>= 1MB`: **0**.
5. Files `>= 10MB`: **0**.

---

## 5) Full Detailed Execution Plan

## Phase 0: Guardrails and Baseline (must keep)

1. Enforce media budgets in CI:
- max single image size (target <= 400 KB for standard images; <= 120 KB for thumbnails),
- max single video source artifact in repo (ban large local files in `public/`),
- max total `public/` size threshold.

2. Track Core Web Vitals and route timing:
- INP target: <= 200ms (p75 mobile),
- LCP target: <= 2.5s (p75 mobile),
- CLS target: <= 0.1.

3. Add weekly asset drift report to ops routine.

## Phase 1: Media Storage Migration (Drive intake -> CDN delivery)

1. **Define canonical media path scheme**
- `/images/<section>/<slug>.<version>.<format>`
- `/videos/<feature>/<slug>/<rendition>.m3u8` + segment files.

2. **Ingest pipeline**
- collect source from Drive/internal uploads,
- virus/mime/extension validation,
- transform to AVIF/WebP derivatives + fallback JPEG/PNG when needed,
- generate width variants (`320/640/960/1280/1920`).

3. **Upload + publish**
- upload optimized variants to object storage,
- emit `media-manifest.json` mapping logical key -> CDN URLs,
- update app content references to manifest keys.

4. **Deprecate direct `public/` heavy files**
- keep only critical tiny static brand assets locally,
- move gallery/news heavy media off app bundle.

5. **Fallback strategy**
- if manifest key missing, return known lightweight fallback image,
- log missing-key metric to analytics.

## Phase 2: UX Smoothness and Render Responsiveness

1. **Navigation responsiveness**
- keep immediate route feedback (progress bar + pending indicators),
- ensure all custom `router.push` flows call transition start function,
- verify every major dynamic route has `loading.tsx`.

2. **Main-thread discipline**
- reduce client-side work in click handlers,
- split heavy rendering work into smaller tasks,
- eliminate unnecessary rerenders in repeated lists and large sections.

3. **Image priority correctness**
- mark true LCP image with `priority` / `fetchPriority="high"`,
- keep below-the-fold images lazy.

4. **Animation policy**
- keep cinematic motion but avoid long blocking work,
- use transform/opacity-based animations where possible,
- honor `prefers-reduced-motion`.

## Phase 3: Security + Admin + Reliability Hardening

1. Close any unauthenticated data exposure endpoints.
2. Remove/lock dangerous proxy behavior (SSRF patterns).
3. Ensure payment/order completion is server-verified only.
4. Make critical writes idempotent and concurrency-safe.
5. Add per-route rate limits for sensitive public endpoints.
6. Standardize API wrapper usage to avoid fragmented auth/validation behavior.

## Phase 4: Operational Excellence

1. Deploy health checks and alerting for:
- API 5xx rate,
- checkout failures,
- media 404/5xx rates,
- web-vitals regression.

2. Release safety:
- staged rollout/canary,
- rollback checklist,
- migration rollback strategy for media key changes.

3. Cost safety:
- monthly free-tier usage report,
- automated warning at 70/85/95% quota thresholds.

---

## 6) Content Team Workflow (practical day-to-day)

1. Upload source assets to intake folder (Drive/internal).
2. Run optimizer/publisher job.
3. Review generated variants + quality checks.
4. Publish manifest changes.
5. Verify page performance in staging.
6. Release.

**Never:** paste raw Drive share links directly into live content data for primary website media.

---

## 7) Video and Photo Storage Policy

## Photos
1. Keep source masters in archive storage (not in web path).
2. Serve AVIF/WebP variants by breakpoint.
3. Keep fallback JPEG only where needed.
4. Use immutable versioned URLs for cache safety.

## Videos
1. Encode HLS renditions for adaptive playback.
2. Use poster images and lazy player initialization.
3. Avoid bundling giant raw `.webm` or `.mp4` in `public/`.
4. Track startup delay and rebuffer metrics.

---

## 8) Security Perspective (hacker/admin/user)

## User perspective
1. Immediate click response and stable loading states.
2. No broken images, no janky transitions, consistent behavior.

## Admin perspective
1. Predictable publishing process with rollback.
2. Fewer incidents from quota spikes and broken hotlinks.
3. Clear telemetry for regressions.

## Hacker perspective
1. Minimized open endpoints and SSRF/abuse vectors.
2. Strict authz checks for private data.
3. Rate limits + structured logging for abuse detection.

---

## 9) Definition of Done (production acceptance)

1. No critical security blockers open.
2. All top routes meet p75 mobile vitals targets for two consecutive weeks.
3. Media delivery no longer depends on Drive links.
4. CI enforces asset budgets and type/lint/build gates.
5. Runbook exists for publish, rollback, and incident handling.

---

## 10) References (official/primary)

1. Next.js Image Component (App Router docs): https://nextjs.org/docs/app/api-reference/components/image
2. Next.js Prefetching Guide: https://nextjs.org/docs/app/guides/prefetching
3. Next.js `useReportWebVitals`: https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
4. Cloudflare R2 Pricing and free-tier details: https://developers.cloudflare.com/r2/pricing/
5. Cloudflare Images Pricing (free plan transformations): https://developers.cloudflare.com/images/pricing/
6. Cloudflare Pages Limits (free plan constraints): https://developers.cloudflare.com/pages/platform/limits/
7. Cloudflare Pages/Functions pricing linkage to Workers quota: https://developers.cloudflare.com/pages/functions/pricing/
8. Cloudflare CDN cache-control behavior: https://developers.cloudflare.com/cache/concepts/cdn-cache-control/
9. Google Drive API usage limits and quota/rate limiting: https://developers.google.com/workspace/drive/api/guides/limits
10. web.dev INP optimization guidance: https://web.dev/articles/optimize-inp
11. web.dev Fetch Priority guidance: https://web.dev/articles/fetch-priority
12. MDN Cache-Control header reference (`immutable` examples): https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control

---

## 11) Immediate Next Actions (recommended order)

1. Finalize media hosting decision and set canonical delivery domain.
2. Execute migration of top 20 heaviest user-facing assets first.
3. Validate Core Web Vitals improvements after migration.
4. Continue closing remaining critical/high audit blockers in API/auth/payment paths.
5. Lock CI thresholds to prevent regression.
