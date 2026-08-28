# SKF Karate — Digital Platform

**Deployed at [www.skfkarate.org](https://www.skfkarate.org)** · Sports Karate Do Fitness & Self-Defence Association® · Bangalore, India

*"Nothing is Impossible."*

We are a KIO-affiliated karate association running five dojo branches across Karnataka — **M P Sports Club, Herohalli, Kunigal, Tumkur, and Udupi** — with hundreds of students training, grading, and competing every month. This repository is the platform that runs all of it: our public website, our athlete portal, and our entire back-office operations.

Not long ago, every admission form, grading record, fee entry, and certificate lived on paper, WhatsApp threads, and a patchwork of spreadsheets. Today, a student can scan the QR code on their black belt certificate and watch it verify itself against our registry in under a second. That is the difference this platform makes.

---

## Flagship systems

These are the parts of the platform we believe genuinely stand out. They weren't bought off a shelf — every one of them was designed and built specifically for how our dojo actually operates.

### Certificate Tracking & Verification System
Every certificate SKF issues lives in a tamper-evident digital registry. Each one carries a unique SKF ID and a generated QR code; anyone — a parent, a school, a tournament official — can scan it or visit `www.skfkarate.org/verify/<id>` and instantly confirm it's genuine. Certificates render through a canvas pipeline with PDF export, backed by indexed lookup endpoints so verification stays fast even as the registry grows.

### Points & Rankings Engine
A live, server-computed leaderboard across the association. Students earn points for competitions, gradings, and participation; the engine tracks balances, full histories, and redemptions — every movement settled atomically inside Postgres, so points can never be double-counted or lost to a race condition.

### FeeTrack — Transparent Fee Management
Fees used to be the most awkward conversation in any dojo. Now every student sees their own ledger: what's due, what's paid, receipts generated as PDFs with embedded QR codes. Students upload payment proofs, staff approve them through a review workflow, and push notifications with automated reminders keep everyone ahead of due dates. There's even a dedicated service worker that caches fee receipts for offline access — your receipt works even when your connection doesn't.

### Dojo Stream — The Home Practice Library
Our technique and kata videos, presented like a streaming service. Shelves organised by belt level and category, folder-based progress cards, resume-where-you-left playback, and per-video progress that syncs to each athlete's account. Built mobile-first and hardened specifically for iOS/Safari video quirks, because that's what most of our students train on.

### The Athlete Portal
An installable PWA — students add SKF to their home screen and it behaves like a native app. Inside: their belt journey from white belt through dan-level black belt ranks, class credit accounting, notices from their sensei, branch timetables, event schedules, and FeeTrack. The portal is branch-aware too — dojos that run their own fees, timetables, and credits operate independently inside the same app.

### Admissions & Trial Pipeline
A parent books a free trial on the website, the lead lands in our queue, the sensei follows up, and an approved application becomes a full athlete record with portal access — one connected flow instead of five phone calls and a notebook.

### Operations Console
Our admin team runs the whole association from one place: admissions review, athlete records and grading history, certificate issuance against the registry, fee approvals, event and result publishing, and shop catalogue management. Critical events reach our team instantly through Telegram alerts.

### The public face
A fast, animated marketing site with cinematic hero video, testimonial carousels, instructor and gallery pages, tournament events and results with detail pages, honours, blog, and a complete SEO layer — dynamic sitemap, JSON-LD structured data, Open Graph images, canonical URLs. Underneath sit the unglamorous essentials done right: privacy policy, terms of service, and cookie consent — because we're handling the data of young athletes and their families.

---

## Architecture

This platform was designed **schema-first** and **security-first** by [Krishna C](https://github.com/kr1shnac), commissioned by SKF. Nothing here is glue code borrowed from a template — every layer was drawn before it was written.

### The big picture

```
                        www.skfkarate.org  ·  Vercel Edge Network
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   Public Site          Athlete Portal (PWA)      Admin Console     │
│        │                     │                       │             │
│        └────────────── Next.js App Router ─────────────┘            │
│                              │                                     │
│                     proxy.ts — CSP, host routing                   │
│                          & route protection                        │
│                              │                                     │
│                    Route Handlers (REST API)                       │
│                              │                                     │
│              ┌───── src/server/services ─────┐                     │
│              │  admission · fee-ledger       │                     │
│              │  certificates · portal-auth   │   ← application     │
│              │  points · notifications …     │     layer           │
│              └───────────────┬───────────────┘                     │
│                              │                                     │
│              ┌── lib/server/repositories ────┐                     │
│              │  the only code that touches   │   ← data access     │
│              │  the database                 │     layer           │
└──────────────┴───────────────┬───────────────┴─────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Supabase Postgres  │
                    │  RLS on every table  │
                    │  Atomic points RPCs  │
                    │  Private buckets     │
                    └──────────────────────┘
```

### Layered request flow

Every request walks the same disciplined path:

1. **Edge middleware (`proxy.ts`)** applies a strict Content-Security-Policy with nonces, protects portal/admin routes before they ever render, and handles host canonicalisation.
2. **Route handlers** accept the request and immediately validate payloads against **Zod schemas** shared between client and server — malformed data never reaches business logic.
3. **Services** (`src/server/services/`) hold the application rules — admission workflows, fee ledgers, certificate issuance, point calculations, notification dispatch.
4. **Repositories** (`lib/server/repositories/`) are the single doorway to Supabase. No component, page, or service queries tables directly.
5. **Postgres has the final say** through row-level security and database functions, so even a compromised client key cannot touch another athlete's data.

### Data model & integrity

- `database/schema.sql` (~2,000 lines) is the canonical snapshot — designed before a line of app code was written.
- **63 row-level security policies** cover every table; the browser only ever holds the anonymous key.
- **Atomic RPCs** move points and issue certificates inside the database, immune to race conditions.
- Training videos live in a **private storage bucket** — signed URLs only.
- All change ships as numbered migrations under `database/migrations/`, applied strictly in order. Deprecated schema files were deliberately deleted so stale policies can never resurface.

### Security posture

- Strict Content-Security-Policy with per-request nonces, enforced at the edge before pages render
- Upstash Redis rate limiting on auth, contact, and lead routes
- bcrypt password hashing and signed JWT session cookies with safe redirect handling
- A validated environment contract (`npm run check:env`) — anything prefixed `NEXT_PUBLIC_` must be browser-safe by definition

### Performance engineering

- Bundle-size guardrails (`check:bundle`) and Lighthouse budgets (`check:lighthouse`) wired into CI
- Automated image optimisation and HEIC conversion pipelines
- Media manifest audits so no orphaned or oversized assets ever ship
- Resource hint injection and skeleton loading states throughout

### Observability

- Sentry across client, server, and edge runtimes
- Structured JSON logging for every critical path
- Web Vitals collected from real users in production
- First-party analytics — visitor insight without shipping our families' data to third-party trackers

### Testing strategy

Vitest unit suites over the domains that can't afford regressions — fees, admissions, certificates, points, rate limits — plus Playwright end-to-end flows covering real user journeys like trial booking and portal authentication. Zero-warning ESLint and strict TypeScript gate every merge.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) · React 19 |
| Language | TypeScript, end to end |
| Styling | Tailwind CSS v4 + hand-crafted CSS |
| Animation | Framer Motion |
| Database | Supabase (Postgres · Storage · RLS) |
| Validation | Zod |
| Email | Resend |
| Payments | Razorpay (feature-flagged until launch) |
| Push | Web Push + dedicated receipt service worker |
| PWA | Installable portal · offline fee receipts |
| Monitoring | Sentry · Web Vitals · Lighthouse CI |
| Testing | Vitest · Playwright |
| Deployment | Vercel |

## Project structure

```
app/
  _components/     shared and feature UI for App Router pages
  admin/           operations console
  api/             route handlers (certificates, points, portal, …)
  portal/          athlete portal — dashboard, videos, fees, journey
  shop/            catalogue & checkout
components/        cross-route React components (certificates, video, nav)
data/              constants, seed data, types, factories
database/
  schema.sql       canonical schema snapshot
  migrations/      ordered production migrations
lib/
  server/repositories/   database access layer
  server/auth/           portal session guards
src/server/
  services/        application services
  config/env.ts    validated environment contract
  lib/             errors, logging, rate limits
public/            assets, icons, service workers, flags
proxy.ts           CSP, route protection, host routing
```

---

## Running it locally

**Prerequisites:** Node.js 20+ and a Supabase project.

```bash
git clone https://github.com/skfkarate/SKF-Karate.git
cd SKF-Karate
npm install

cp .env.example .env.local    # fill in your values
npm run check:env             # validates the environment contract
npm run check:supabase        # verifies tables, RLS & storage readiness

npm run dev
```

Production builds reserve extra heap headroom — already wired into the scripts:

```bash
npm run build && npm run start
```

### Feature flags

| Flag | Purpose |
|---|---|
| `SHOP_ENABLED` / `PAYMENTS_ENABLED` | Shop & Razorpay checkout stay off until keys are configured |
| `CERTIFICATES_ENABLED` | Public certificate registry & verification |
| `PUBLIC_TECHNIQUE_VIDEOS_ENABLED` | Opt-in public technique library |
| `TREASURY_COLLECTION_MODE` | `manual` or `gateway` fee collection |

## Quality gates & deployment

Before anything reaches production:

```bash
npm run check:env && npm run check:supabase && npm run lint \
  && npm run type-check && npm run test:unit \
  && npm audit --omit=dev --audit-level=high \
  && npm run check:bundle && npm run build && npm run test:e2e
```

Deployments run on **Vercel** straight from the main branch. Migrations apply in order via the Supabase SQL editor or migration runner before the new build goes live.

---

## Acknowledgements

This platform was **architected, designed, and built by [Krishna C](https://github.com/kr1shnac)** as commissioned client work for SKF — from the original database schema to the last pixel of the portal, including a full ground-up rebuild after the first prototype was wiped.

What we didn't expect when we brought him on board was just how much of himself he'd pour into this. Krishna treated SKF not as a client file but like his own dojo — countless late nights, weekends lost to iOS video bugs nobody asked him to fix, a schema redesigned from scratch because "good enough" wasn't in his vocabulary. When something broke at odd hours, there was exactly one person we called, and he always picked up. For everything technical under this roof — architecture, security, design, deployment — there was one name, and one name only: Krishna.

We came looking for a developer. We got a partner who cared about our students' journey as much as we do.

- Codebase enquiries: [github.com/kr1shnac](https://github.com/kr1shnac)
- Classes, admissions & branches: [www.skfkarate.org](https://www.skfkarate.org)

© Sports Karate Do Fitness & Self-Defence Association®. All rights reserved.
