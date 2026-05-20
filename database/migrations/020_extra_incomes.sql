-- Extra incomes ledger to track additional revenue like summer camps, donations, etc.

CREATE TABLE IF NOT EXISTS fee_extra_incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  income_code TEXT UNIQUE NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL DEFAULT 'Both',
  amount NUMERIC NOT NULL DEFAULT 0,
  created_by TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_extra_incomes_period
  ON fee_extra_incomes (year, month);

ALTER TABLE fee_extra_incomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_extra_incomes" ON fee_extra_incomes;

CREATE POLICY "service_role_full_fee_extra_incomes"
ON fee_extra_incomes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
