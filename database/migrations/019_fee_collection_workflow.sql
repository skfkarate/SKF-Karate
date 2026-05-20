-- Fee collection workflow: manual proof intents, payment references, and reminder logs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS fee_payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  fee_record_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'submitted', 'paid', 'rejected', 'expired', 'cancelled')),
  channel TEXT NOT NULL DEFAULT 'manual_proof'
    CHECK (channel IN ('manual_proof', 'razorpay_link', 'upi_autopay')),
  payment_reference TEXT,
  provider TEXT,
  provider_intent_id TEXT,
  provider_payment_id TEXT,
  provider_link_url TEXT,
  submitted_proof_id UUID REFERENCES fee_payment_proofs(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_payment_intents_skf_status
  ON fee_payment_intents (skf_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_payment_intents_status_created
  ON fee_payment_intents (status, created_at DESC);

ALTER TABLE fee_payment_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_payment_intents" ON fee_payment_intents;

CREATE POLICY "service_role_full_fee_payment_intents"
ON fee_payment_intents
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

ALTER TABLE fee_payment_proofs
  ADD COLUMN IF NOT EXISTS payment_intent_id UUID REFERENCES fee_payment_intents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_fee_payment_proofs_intent
  ON fee_payment_proofs (payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_fee_payment_proofs_reference
  ON fee_payment_proofs (payment_reference)
  WHERE payment_reference IS NOT NULL AND payment_reference <> '';

CREATE TABLE IF NOT EXISTS fee_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  fee_record_id UUID REFERENCES fee_records(id) ON DELETE SET NULL,
  fee_type TEXT NOT NULL DEFAULT 'monthly',
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'sms', 'email', 'in_app', 'manual')),
  template_key TEXT NOT NULL DEFAULT 'monthly_due',
  recipient_name TEXT,
  recipient_phone TEXT,
  message_body TEXT NOT NULL,
  message_url TEXT,
  provider TEXT NOT NULL DEFAULT 'manual_whatsapp',
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'prepared'
    CHECK (status IN ('prepared', 'opened', 'sent', 'failed', 'skipped')),
  sent_by TEXT,
  sent_by_role TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_reminder_logs_skf_period
  ON fee_reminder_logs (skf_id, fee_type, year, month, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_reminder_logs_channel_status
  ON fee_reminder_logs (channel, status, created_at DESC);

ALTER TABLE fee_reminder_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_reminder_logs" ON fee_reminder_logs;

CREATE POLICY "service_role_full_fee_reminder_logs"
ON fee_reminder_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
