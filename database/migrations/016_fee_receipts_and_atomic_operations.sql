-- Immutable fee receipts and atomic fee operations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE fee_records
  ADD COLUMN IF NOT EXISTS fee_type TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE fee_records
  DROP CONSTRAINT IF EXISTS fee_records_skf_id_month_year_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_records_unique_type_period
  ON fee_records (skf_id, fee_type, month, year);

CREATE TABLE IF NOT EXISTS fee_receipt_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  active_theme_id TEXT NOT NULL DEFAULT 'skf_classic',
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fee_receipt_settings (id, active_theme_id)
VALUES (true, 'skf_classic')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE fee_receipt_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_receipt_settings" ON fee_receipt_settings;

CREATE POLICY "service_role_full_fee_receipt_settings"
ON fee_receipt_settings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS fee_receipts (
  receipt_id TEXT PRIMARY KEY,
  fee_record_id UUID REFERENCES fee_records(id) ON DELETE SET NULL,
  skf_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  fee_type TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  paid_date TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  dojo_address TEXT,
  theme_id TEXT NOT NULL DEFAULT 'skf_classic',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  replacement_receipt_id TEXT REFERENCES fee_receipts(receipt_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_receipts_skf_date
  ON fee_receipts (skf_id, issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_receipts_fee_record
  ON fee_receipts (fee_record_id, issued_at DESC);

ALTER TABLE fee_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_receipts" ON fee_receipts;

CREATE POLICY "service_role_full_fee_receipts"
ON fee_receipts
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION ensure_fee_record(
  p_skf_id TEXT,
  p_fee_type TEXT,
  p_month TEXT,
  p_year INTEGER,
  p_amount NUMERIC,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS fee_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result fee_records;
BEGIN
  INSERT INTO fee_records (
    skf_id,
    fee_type,
    month,
    year,
    amount,
    status,
    metadata,
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
    now()
  )
  ON CONFLICT (skf_id, fee_type, month, year)
  DO UPDATE SET
    amount = CASE
      WHEN fee_records.status IN ('paid', 'pending_verification') THEN fee_records.amount
      ELSE EXCLUDED.amount
    END,
    metadata = coalesce(fee_records.metadata, '{}'::jsonb) || coalesce(EXCLUDED.metadata, '{}'::jsonb),
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
    now()
  )
  ON CONFLICT (skf_id, fee_type, month, year)
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
