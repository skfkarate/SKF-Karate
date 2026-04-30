# SKF Karate Website

Next.js App Router platform for SKF Karate, covering the public website, athlete portal, admin operations, certificates, events/results, shop stubs, and Supabase-backed operational data.

## Commands

```bash
npm run dev
npm run lint
npm run type-check
npm run test:unit
npm run test:e2e
npm run check:env
npm run check:supabase
npm run build
npm run start
```

`npm run build` and `npm run build:ci` both use `NODE_OPTIONS=--max-old-space-size=4096` because the production build needs a larger heap.

## Project Structure

```text
app/
  _components/         shared and feature UI used by App Router pages
  admin/               admin panel pages
  api/                 Next.js route handlers
  portal/              athlete portal pages
  shop/                shop/catalog/checkout pages

components/            shared cross-route React components
data/                  static constants, seed data, and route constants
database/
  schema.sql           canonical schema snapshot
  migrations/          ordered production migrations
lib/
  admin/               admin data-shaping helpers
  server/
    auth/              portal auth helpers and NextAuth session guards
    repositories/      server-owned Supabase/domain data access
    validation/        server-side payload validation
  shop/                shop domain logic
src/server/
  api/validators/      Zod route schemas
  config/env.ts        validated environment contract
  lib/                 route wrapper, errors, logging, rate limits
  services/            route-facing application services

public/                static assets
proxy.ts               CSP, route protection, and host routing
```

## Environment

Copy `.env.example` and fill the required production values. `JWT_SECRET` is the canonical athlete portal token secret and must be at least 32 characters.

Validate the documented env contract with:

```bash
npm run check:env
```

Validate live Supabase table/RLS/storage readiness with:

```bash
npm run check:supabase
```

Only `NEXT_PUBLIC_*` variables are bundled client-side. Do not expose `SUPABASE_SERVICE_ROLE_KEY`, Razorpay secrets, Resend keys, Google private keys, or `JWT_SECRET`.

## Database And Migrations

`database/schema.sql` is the canonical schema snapshot. All incremental production changes must be added under `database/migrations/` with a numbered filename.

Apply migrations in order in Supabase SQL Editor or your deployment migration runner. Current security-relevant migrations include atomic points RPCs, certificate lookup indexing, athlete data consent, and the private `training-videos` storage bucket.

The `training-videos` bucket must be private. Its per-file size limit should use the Supabase project default unless the project plan explicitly supports a higher limit.

Deprecated schema files were removed to prevent accidentally applying stale RLS policies.

## Deployment

Use the default build command:

```bash
npm run build
```

Required production checks before deployment:

```bash
npm run check:env
npm run check:supabase
npm run lint
npm run type-check
npm run test:unit
npm audit --omit=dev --audit-level=high
npm run build
npm run test:e2e
```

Razorpay/shop checkout must remain disabled unless `SHOP_ENABLED=true` and all Razorpay keys are configured. Certificates and public technique videos are separately feature-flagged.
