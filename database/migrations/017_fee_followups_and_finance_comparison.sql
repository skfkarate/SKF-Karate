-- Fee follow-up tracking for overdue and rejected rows.

CREATE TABLE IF NOT EXISTS fee_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  fee_type TEXT NOT NULL DEFAULT 'monthly',
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  contacted_by TEXT NOT NULL,
  contacted_by_role TEXT,
  contact_method TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fee_followups
  DROP CONSTRAINT IF EXISTS fee_followups_fee_type_check;

ALTER TABLE fee_followups
  ADD CONSTRAINT fee_followups_fee_type_check
  CHECK (fee_type IN ('monthly', 'admission', 'dress', 'credit_adjustment'));

ALTER TABLE fee_followups
  DROP CONSTRAINT IF EXISTS fee_followups_contact_method_check;

ALTER TABLE fee_followups
  ADD CONSTRAINT fee_followups_contact_method_check
  CHECK (contact_method IN ('whatsapp', 'call', 'in_person', 'sms', 'other'));

CREATE INDEX IF NOT EXISTS idx_fee_followups_skf_period
  ON fee_followups (skf_id, fee_type, year, month, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_followups_created_at
  ON fee_followups (created_at DESC);

ALTER TABLE fee_followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_followups" ON fee_followups;

CREATE POLICY "service_role_full_fee_followups"
ON fee_followups
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
