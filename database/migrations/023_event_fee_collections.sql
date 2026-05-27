-- Paid event collections: belt exams, tournaments, seminars, camps, and settlement tracking.

ALTER TABLE fee_records
  ADD COLUMN IF NOT EXISTS source_key TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS source_label TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS branch_snapshot TEXT;

UPDATE fee_records
SET source_key = COALESCE(NULLIF(source_key, ''), '')
WHERE source_key IS NULL;

ALTER TABLE fee_records
  DROP CONSTRAINT IF EXISTS fee_records_fee_type_check;

ALTER TABLE fee_records
  ADD CONSTRAINT fee_records_fee_type_check
  CHECK (fee_type IN (
    'monthly',
    'admission',
    'dress',
    'credit_adjustment',
    'belt_exam',
    'tournament',
    'event',
    'other'
  ));

ALTER TABLE fee_records
  DROP CONSTRAINT IF EXISTS fee_records_skf_id_month_year_key;

DROP INDEX IF EXISTS idx_fee_records_unique_type_period;
DROP INDEX IF EXISTS idx_fee_records_source_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_records_unique_type_period_source
  ON fee_records (skf_id, fee_type, month, year, source_key);

CREATE INDEX IF NOT EXISTS idx_fee_records_source
  ON fee_records (source_type, source_id, status);

CREATE INDEX IF NOT EXISTS idx_fee_records_due_date
  ON fee_records (due_date)
  WHERE due_date IS NOT NULL;

ALTER TABLE fee_followups
  DROP CONSTRAINT IF EXISTS fee_followups_fee_type_check;

ALTER TABLE fee_followups
  ADD CONSTRAINT fee_followups_fee_type_check
  CHECK (fee_type IN (
    'monthly',
    'admission',
    'dress',
    'credit_adjustment',
    'belt_exam',
    'tournament',
    'event',
    'other'
  ));

CREATE TABLE IF NOT EXISTS event_fee_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_name TEXT,
  event_type TEXT,
  event_date DATE,
  fee_category TEXT NOT NULL DEFAULT 'event'
    CHECK (fee_category IN ('belt_exam', 'tournament', 'event', 'other')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'settled')),
  targeting_mode TEXT NOT NULL DEFAULT 'branch_and_eligibility'
    CHECK (targeting_mode IN ('branch_and_eligibility', 'participants_only', 'manual_selection')),
  pricing_mode TEXT NOT NULL DEFAULT 'fixed'
    CHECK (pricing_mode IN ('fixed', 'branch', 'belt', 'branch_belt', 'student')),
  default_amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  branch_scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  belt_scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  branch_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  belt_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  branch_belt_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  student_overrides JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  last_generated_at TIMESTAMPTZ,
  last_generated_by TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_fee_configs_category_date
  ON event_fee_configs (fee_category, event_date DESC);

ALTER TABLE event_fee_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_event_fee_configs" ON event_fee_configs;

CREATE POLICY "service_role_full_event_fee_configs"
ON event_fee_configs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS event_fee_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'event_expense',
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  branch_scope TEXT NOT NULL DEFAULT 'Both',
  allocation_method TEXT NOT NULL DEFAULT 'student_branch'
    CHECK (allocation_method IN ('single_branch', 'student_branch', 'custom', 'overall')),
  allocations JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_method TEXT,
  vendor TEXT,
  notes TEXT,
  proof_url TEXT,
  created_by TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_fee_expenses_event
  ON event_fee_expenses (event_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_event_fee_expenses_period
  ON event_fee_expenses (expense_date);

ALTER TABLE event_fee_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_event_fee_expenses" ON event_fee_expenses;

CREATE POLICY "service_role_full_event_fee_expenses"
ON event_fee_expenses
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS event_fee_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  deposit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  branch_scope TEXT NOT NULL DEFAULT 'Both',
  method TEXT NOT NULL DEFAULT 'bank_deposit',
  reference TEXT,
  notes TEXT,
  created_by TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_fee_deposits_event
  ON event_fee_deposits (event_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_event_fee_deposits_period
  ON event_fee_deposits (deposit_date);

ALTER TABLE event_fee_deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_event_fee_deposits" ON event_fee_deposits;

CREATE POLICY "service_role_full_event_fee_deposits"
ON event_fee_deposits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP FUNCTION IF EXISTS ensure_fee_record(TEXT, TEXT, TEXT, INTEGER, NUMERIC, JSONB);

CREATE OR REPLACE FUNCTION ensure_fee_record(
  p_skf_id TEXT,
  p_fee_type TEXT,
  p_month TEXT,
  p_year INTEGER,
  p_amount NUMERIC,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_source_key TEXT DEFAULT '',
  p_source_type TEXT DEFAULT NULL,
  p_source_id TEXT DEFAULT NULL,
  p_source_label TEXT DEFAULT NULL,
  p_due_date DATE DEFAULT NULL,
  p_branch_snapshot TEXT DEFAULT NULL
)
RETURNS fee_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result fee_records;
  normalized_source_key TEXT;
BEGIN
  normalized_source_key := COALESCE(NULLIF(trim(p_source_key), ''), '');

  INSERT INTO fee_records (
    skf_id,
    fee_type,
    month,
    year,
    amount,
    status,
    metadata,
    source_key,
    source_type,
    source_id,
    source_label,
    due_date,
    branch_snapshot,
    updated_at
  )
  VALUES (
    upper(trim(p_skf_id)),
    p_fee_type,
    p_month,
    p_year,
    greatest(coalesce(p_amount, 0), 0),
    'due',
    coalesce(p_metadata, '{}'::jsonb),
    normalized_source_key,
    p_source_type,
    p_source_id,
    p_source_label,
    p_due_date,
    p_branch_snapshot,
    now()
  )
  ON CONFLICT (skf_id, fee_type, month, year, source_key)
  DO UPDATE SET
    amount = CASE
      WHEN fee_records.status IN ('paid', 'pending_verification') THEN fee_records.amount
      ELSE EXCLUDED.amount
    END,
    metadata = coalesce(fee_records.metadata, '{}'::jsonb) || coalesce(EXCLUDED.metadata, '{}'::jsonb),
    source_type = coalesce(EXCLUDED.source_type, fee_records.source_type),
    source_id = coalesce(EXCLUDED.source_id, fee_records.source_id),
    source_label = coalesce(EXCLUDED.source_label, fee_records.source_label),
    due_date = coalesce(EXCLUDED.due_date, fee_records.due_date),
    branch_snapshot = coalesce(EXCLUDED.branch_snapshot, fee_records.branch_snapshot),
    updated_at = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION apply_fee_credit(
  p_credit_id UUID,
  p_skf_id TEXT,
  p_month TEXT,
  p_year INTEGER,
  p_fee_type TEXT,
  p_actor TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  credit_row fee_credits;
  adjustment_row fee_records;
  credit_amount NUMERIC;
BEGIN
  SELECT *
  INTO credit_row
  FROM fee_credits
  WHERE id = p_credit_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credit not found' USING ERRCODE = 'P0002';
  END IF;

  IF upper(trim(credit_row.skf_id)) <> upper(trim(p_skf_id)) THEN
    RAISE EXCEPTION 'Credit does not belong to student' USING ERRCODE = '22023';
  END IF;

  IF credit_row.status <> 'available' THEN
    RAISE EXCEPTION 'Credit has already been used or cancelled' USING ERRCODE = '23505';
  END IF;

  credit_amount := greatest(coalesce(credit_row.amount, 0), 0);

  INSERT INTO fee_records (
    skf_id,
    fee_type,
    month,
    year,
    amount,
    status,
    paid_date,
    payment_method,
    verified_by,
    verified_at,
    metadata,
    source_key,
    updated_at
  )
  VALUES (
    upper(trim(p_skf_id)),
    'credit_adjustment',
    p_month,
    p_year,
    credit_amount,
    'paid',
    now(),
    'credit adjustment',
    p_actor,
    now(),
    jsonb_build_object(
      'appliedToFeeType', p_fee_type,
      'lastCreditId', p_credit_id::text
    ),
    '',
    now()
  )
  ON CONFLICT (skf_id, fee_type, month, year, source_key)
  DO UPDATE SET
    amount = fee_records.amount + EXCLUDED.amount,
    status = 'paid',
    paid_date = coalesce(fee_records.paid_date, now()),
    payment_method = 'credit adjustment',
    verified_by = p_actor,
    verified_at = now(),
    metadata = coalesce(fee_records.metadata, '{}'::jsonb) || EXCLUDED.metadata,
    updated_at = now()
  RETURNING * INTO adjustment_row;

  UPDATE fee_credits
  SET
    status = 'used',
    used_fee_record_id = adjustment_row.id,
    used_month = p_month,
    used_year = p_year,
    used_at = now(),
    updated_at = now()
  WHERE id = p_credit_id;

  RETURN jsonb_build_object(
    'credit', to_jsonb(credit_row),
    'adjustment', to_jsonb(adjustment_row)
  );
END;
$$;
