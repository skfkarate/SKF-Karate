-- Supabase-backed fee ledger. Google Sheets should remain for lead/contact logs only.

CREATE TABLE IF NOT EXISTS fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'due'
    CHECK (status IN ('paid', 'due', 'overdue')),
  paid_date TIMESTAMPTZ,
  receipt_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (skf_id, month, year)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_records_receipt_id
  ON fee_records (receipt_id)
  WHERE receipt_id IS NOT NULL AND receipt_id <> '';

CREATE INDEX IF NOT EXISTS idx_fee_records_skf_year
  ON fee_records (skf_id, year);

CREATE INDEX IF NOT EXISTS idx_fee_records_status
  ON fee_records (status, year);

ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_records" ON fee_records;

CREATE POLICY "service_role_full_fee_records"
ON fee_records
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
