-- Fix the push_subscriptions table by adding columns that were missed
-- when migration 028 was not applied to the production database.
-- These ALTER TABLE statements are idempotent (IF NOT EXISTS / IF EXISTS).

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS endpoint TEXT,
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS staff_id TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.push_subscriptions
SET endpoint = subscription->>'endpoint'
WHERE endpoint IS NULL
  AND subscription ? 'endpoint';

ALTER TABLE public.push_subscriptions
  ALTER COLUMN skf_id DROP NOT NULL;

ALTER TABLE public.push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_skf_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON public.push_subscriptions(endpoint)
  WHERE endpoint IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_audience
  ON public.push_subscriptions(audience, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_staff
  ON public.push_subscriptions(staff_id, updated_at DESC)
  WHERE staff_id IS NOT NULL;
