-- Custom removals ledger to track money taken out of the master ledger
-- for equipment purchases, supplies, or any organisational expense.

CREATE TABLE IF NOT EXISTS fee_removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  removal_code TEXT UNIQUE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_fee_removals_period
  ON fee_removals (year, month);

ALTER TABLE fee_removals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_removals" ON fee_removals;

CREATE POLICY "service_role_full_fee_removals"
ON fee_removals
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
