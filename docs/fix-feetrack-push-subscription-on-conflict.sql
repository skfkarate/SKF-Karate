-- FeeTrack push subscription production fix
--
-- Run this whole file once in Supabase SQL Editor for the SKF-Karate project.
-- It fixes:
--   1. Missing staff push subscription columns.
--   2. Old skf_id uniqueness that blocks multiple staff devices.
--   3. Duplicate endpoint rows, if production already has any.
--   4. The ON CONFLICT (endpoint) failure used by FeeTrack.
--   5. Removes SKF25MP004 from the current belt exam cycle.
--
-- Error being fixed:
--   42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification

BEGIN;

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS endpoint TEXT,
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS staff_id TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.push_subscriptions
SET endpoint = subscription->>'endpoint'
WHERE endpoint IS NULL
  AND subscription ? 'endpoint';

ALTER TABLE public.push_subscriptions
  ALTER COLUMN skf_id DROP NOT NULL;

ALTER TABLE public.push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_skf_id_key;

-- Keep the newest row for each endpoint before creating the unique index.
WITH ranked_subscriptions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY endpoint
      ORDER BY
        COALESCE(last_seen_at, updated_at, created_at, NOW()) DESC,
        id DESC
    ) AS duplicate_rank
  FROM public.push_subscriptions
  WHERE endpoint IS NOT NULL
)
DELETE FROM public.push_subscriptions target
USING ranked_subscriptions ranked
WHERE target.id = ranked.id
  AND ranked.duplicate_rank > 1;

-- FeeTrack saves subscriptions with:
--   upsert(..., { onConflict: 'endpoint' })
-- That needs a plain unique index/constraint matching endpoint.
DROP INDEX IF EXISTS public.idx_push_subscriptions_endpoint;

CREATE UNIQUE INDEX idx_push_subscriptions_endpoint
  ON public.push_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_audience
  ON public.push_subscriptions(audience, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_staff
  ON public.push_subscriptions(staff_id, updated_at DESC)
  WHERE staff_id IS NOT NULL;

-- Remove SKF25MP004 from the current belt exam cycle.
-- The selected exam is the latest non-settled belt_exam config, preferring
-- an exam where this student is already a participant or already has a fee row.
DROP TABLE IF EXISTS _feetrack_belt_exam_target;
DROP TABLE IF EXISTS _feetrack_removed_belt_exam_fee_records;

CREATE TEMP TABLE _feetrack_belt_exam_target AS
SELECT
  config.event_id,
  COALESCE(config.event_name, events.name) AS event_name,
  COALESCE(config.event_date, events.date) AS event_date,
  config.status
FROM public.event_fee_configs config
LEFT JOIN public.events events ON events.id = config.event_id
WHERE config.fee_category = 'belt_exam'
  AND config.status <> 'settled'
ORDER BY
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM public.fee_records fees
      WHERE upper(trim(fees.skf_id)) = 'SKF25MP004'
        AND fees.fee_type = 'belt_exam'
        AND (
          fees.source_id = config.event_id
          OR fees.source_key = 'event:' || config.event_id
        )
    ) THEN 0
    WHEN EXISTS (
      SELECT 1
      FROM jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(COALESCE(events.participants, '[]'::jsonb)) = 'array'
            THEN COALESCE(events.participants, '[]'::jsonb)
          ELSE '[]'::jsonb
        END
      ) AS participant(entry)
      WHERE upper(trim(COALESCE(
        participant.entry->>'skfId',
        participant.entry->>'skf_id',
        ''
      ))) = 'SKF25MP004'
    ) THEN 0
    ELSE 1
  END,
  COALESCE(config.event_date, events.date) DESC NULLS LAST,
  config.updated_at DESC
LIMIT 1;

-- Keep the student excluded if the belt exam sync/generation runs again.
UPDATE public.event_fee_configs config
SET
  student_overrides = (
    COALESCE((
      SELECT jsonb_agg(override_entry.entry)
      FROM jsonb_array_elements(COALESCE(config.student_overrides, '[]'::jsonb)) AS override_entry(entry)
      WHERE upper(trim(COALESCE(
        override_entry.entry->>'skfId',
        override_entry.entry->>'skf_id',
        ''
      ))) <> 'SKF25MP004'
    ), '[]'::jsonb)
    || jsonb_build_array(jsonb_build_object(
      'skfId', 'SKF25MP004',
      'excluded', true,
      'included', false,
      'waived', false,
      'reason', 'Removed from this belt exam cycle'
    ))
  ),
  updated_at = NOW()
FROM _feetrack_belt_exam_target target
WHERE config.event_id = target.event_id;

-- Remove them from the visible event participant list.
UPDATE public.events events
SET
  participants = COALESCE((
    SELECT jsonb_agg(participant.entry)
    FROM jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(COALESCE(events.participants, '[]'::jsonb)) = 'array'
          THEN COALESCE(events.participants, '[]'::jsonb)
        ELSE '[]'::jsonb
      END
    ) AS participant(entry)
    WHERE upper(trim(COALESCE(
      participant.entry->>'skfId',
      participant.entry->>'skf_id',
      ''
    ))) <> 'SKF25MP004'
  ), '[]'::jsonb),
  updated_at = NOW()
FROM _feetrack_belt_exam_target target
WHERE events.id = target.event_id;

-- Delete only unpaid/non-final fee rows. Paid or pending-verification rows are
-- intentionally left in place so they can be refunded or reviewed manually.
CREATE TEMP TABLE _feetrack_removed_belt_exam_fee_records (
  id UUID,
  skf_id TEXT,
  fee_type TEXT,
  month TEXT,
  year INTEGER,
  amount NUMERIC,
  status TEXT,
  source_key TEXT,
  source_id TEXT,
  source_label TEXT
);

WITH deleted_fee_records AS (
  DELETE FROM public.fee_records fees
  USING _feetrack_belt_exam_target target
  WHERE upper(trim(fees.skf_id)) = 'SKF25MP004'
    AND fees.fee_type = 'belt_exam'
    AND fees.status IN ('due', 'overdue', 'waived', 'rejected')
    AND (
      fees.source_id = target.event_id
      OR fees.source_key = 'event:' || target.event_id
    )
  RETURNING
    fees.id,
    fees.skf_id,
    fees.fee_type,
    fees.month,
    fees.year,
    fees.amount,
    fees.status,
    fees.source_key,
    fees.source_id,
    fees.source_label
)
INSERT INTO _feetrack_removed_belt_exam_fee_records
SELECT * FROM deleted_fee_records;

COMMIT;

-- Verification after COMMIT:
SELECT
  'target_belt_exam' AS check_name,
  *
FROM _feetrack_belt_exam_target;

SELECT
  'removed_unpaid_belt_exam_fee_records' AS check_name,
  COUNT(*) AS removed_count
FROM _feetrack_removed_belt_exam_fee_records;

SELECT
  'remaining_paid_or_pending_belt_exam_fee_records' AS check_name,
  COUNT(*) AS remaining_count
FROM public.fee_records fees
JOIN _feetrack_belt_exam_target target
  ON fees.source_id = target.event_id
  OR fees.source_key = 'event:' || target.event_id
WHERE upper(trim(fees.skf_id)) = 'SKF25MP004'
  AND fees.fee_type = 'belt_exam'
  AND fees.status IN ('paid', 'pending_verification');

SELECT
  'participant_still_present' AS check_name,
  EXISTS (
    SELECT 1
    FROM public.events events
    JOIN _feetrack_belt_exam_target target ON target.event_id = events.id
    CROSS JOIN LATERAL jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(COALESCE(events.participants, '[]'::jsonb)) = 'array'
          THEN COALESCE(events.participants, '[]'::jsonb)
        ELSE '[]'::jsonb
      END
    ) AS participant(entry)
    WHERE upper(trim(COALESCE(
      participant.entry->>'skfId',
      participant.entry->>'skf_id',
      ''
    ))) = 'SKF25MP004'
  ) AS still_present;

SELECT
  'excluded_override_present' AS check_name,
  EXISTS (
    SELECT 1
    FROM public.event_fee_configs config
    JOIN _feetrack_belt_exam_target target ON target.event_id = config.event_id
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(config.student_overrides, '[]'::jsonb)) AS override_entry(entry)
    WHERE upper(trim(COALESCE(
      override_entry.entry->>'skfId',
      override_entry.entry->>'skf_id',
      ''
    ))) = 'SKF25MP004'
      AND COALESCE((override_entry.entry->>'excluded')::boolean, false) = true
  ) AS override_present;

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'push_subscriptions'
  AND indexname IN (
    'idx_push_subscriptions_endpoint',
    'idx_push_subscriptions_audience',
    'idx_push_subscriptions_staff'
  )
ORDER BY indexname;
