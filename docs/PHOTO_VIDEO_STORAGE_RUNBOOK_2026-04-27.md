# SKF Karate Photo/Video Storage Runbook (Free-First, Production-Ready)

**Date:** 2026-04-27  
**Scope:** End-to-end media handling for ingestion, optimization, delivery, security, and operations.

---

## 1) Quick Summary

1. Do not use Google Drive links as direct production media URLs.
2. Keep Drive only as an intake/source location for the content team.
3. Publish optimized media to canonical URLs (local `public/` now, CDN origin later via `NEXT_PUBLIC_MEDIA_CDN_ORIGIN`).
4. Enforce media size budgets in CI (`audit:assets:ci`, `audit:media-manifest:ci`).
5. Keep all media versioned, immutable, and rollback-safe.

---

## 2) Current Repository Status (Validated)

1. `public/` total: ~17.40 MB.
2. Images in `public/`: ~16.52 MB.
3. Videos in `public/`: ~891.8 KB.
4. Files `>= 1MB`: 0.
5. Files `>= 10MB`: 0.
6. Legacy HEIC links are compatibility-mapped to JPEG via `next.config.mjs` rewrites.

---

## 3) Final Recommendation on Google Drive

### Use Drive for intake only

- Good for team upload/review.
- Not good as production delivery infrastructure.

### Why Drive hotlinks are risky

1. Rate limiting/quota behavior under real traffic is unpredictable.
2. Cache-control and edge delivery controls are weak for web performance.
3. URL durability and access behavior can drift with permission changes.
4. No robust image/video transformation layer for responsive variants.

### Enforced in this repo

- `scripts/audit-media-manifest.mjs` blocks Drive-hosted URLs in canonical media manifest entries.

---

## 4) Standard Media Lifecycle (Team Process)

1. Upload source media to intake (Drive/internal shared folder).
2. Pull source media into local staging folder.
3. Convert HEIC/HEIF to JPEG when needed:
   - `npm run convert:heic`
4. Optimize oversized images:
   - `npm run optimize:images`
5. Validate static asset budgets:
   - `npm run audit:assets:ci`
6. Register canonical media keys in:
   - `data/media/manifest.json`
7. Validate manifest policy:
   - `npm run audit:media-manifest:ci`
8. Run quality gates:
   - `npm run type-check`
   - `npm run test:unit`
   - `npm run build:ci`
9. Ship and monitor route/media timing telemetry.

---

## 5) Image Handling Standard

1. Keep original source assets outside `public/` (archive/scratch).
2. Publish web-safe optimized formats in `public/` or CDN origin path.
3. Prefer responsive sizing and lazy loading for non-LCP assets.
4. Keep canonical fallbacks lightweight.
5. Use immutable naming/versioning for cache safety:
   - Example: `hero.v20260427.jpeg`

---

## 6) Video Handling Standard

1. Keep raw master files out of `public/`.
2. Publish compressed delivery files only.
3. Use `+faststart` MP4 for better start latency.
4. Keep compatibility files small (target sub-1MB for short loop/demo assets).
5. Longer media should move to segmented delivery (HLS) once volume grows.

---

## 7) Security and Abuse Controls

1. Never expose private intake URLs directly.
2. Keep public media paths non-sensitive and non-auth-bearing.
3. Do not allow user-supplied arbitrary proxy fetches for media without allowlists.
4. Apply per-endpoint rate limits for metadata/image proxy routes.
5. Keep CI checks mandatory before release.

---

## 8) Admin and Operations Checklist

1. Weekly: run asset audit and track drift.
2. Before release: run `type-check`, `test:unit`, `build:ci`, both media audits.
3. If media quality complaints occur: re-encode source with lower CRF or higher target resolution and republish versioned key.
4. If broken links occur: add compatibility alias in `next.config.mjs` rewrites.
5. Keep rollback simple: retain previous versioned media files until rollout is stable.

---

## 9) Immediate Next Steps (Execution Order)

1. Move remaining heavy gallery images from local `public/` to CDN-backed origin keys.
2. Keep media references on manifest keys only (avoid direct hardcoded file paths in components).
3. Add route-level synthetic checks for media 404/latency.
4. Introduce adaptive video packaging (HLS) for longer clips.
5. Close remaining critical security endpoints before production launch.

