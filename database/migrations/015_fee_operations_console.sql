-- Private fee operations console.
-- Fees are intentionally not exposed through public athlete pages.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Keep this migration safe even if the earlier fee migration was not applied.
CREATE TABLE IF NOT EXISTS fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'due',
  paid_date TIMESTAMPTZ,
  receipt_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (skf_id, month, year)
);

ALTER TABLE fee_records
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS skf_id TEXT,
  ADD COLUMN IF NOT EXISTS month TEXT,
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'due',
  ADD COLUMN IF NOT EXISTS paid_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS receipt_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'fee_records'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE fee_records ADD PRIMARY KEY (id);
  END IF;
END $$;

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

-- Staff accounts for /fee access. The env ADMIN_USERNAME/PASSWORD remains a bootstrap fallback.
CREATE TABLE IF NOT EXISTS staff_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'fee_manager'
    CHECK (role IN ('admin', 'fee_manager', 'fee_viewer')),
  branch_scope TEXT NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_staff_accounts" ON staff_accounts;

CREATE POLICY "service_role_full_staff_accounts"
ON staff_accounts
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Billing profile keeps fee-only controls separate from public athlete profile editing.
CREATE TABLE IF NOT EXISTS student_billing_profiles (
  skf_id TEXT PRIMARY KEY,
  billing_status TEXT NOT NULL DEFAULT 'active'
    CHECK (billing_status IN ('active', 'paused', 'discontinued')),
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  admission_fee NUMERIC NOT NULL DEFAULT 0,
  dress_fee NUMERIC NOT NULL DEFAULT 0,
  dress_cost NUMERIC NOT NULL DEFAULT 0,
  billing_start_date DATE,
  billing_end_date DATE,
  branch_snapshot TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE student_billing_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_student_billing_profiles" ON student_billing_profiles;

CREATE POLICY "service_role_full_student_billing_profiles"
ON student_billing_profiles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Extend the existing ledger to cover monthly, admission, dress, credits, and proof verification.
ALTER TABLE fee_records
  ADD COLUMN IF NOT EXISTS fee_type TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE fee_records
  DROP CONSTRAINT IF EXISTS fee_records_status_check;

ALTER TABLE fee_records
  ADD CONSTRAINT fee_records_status_check
  CHECK (status IN ('paid', 'due', 'overdue', 'pending_verification', 'break', 'waived', 'rejected'));

ALTER TABLE fee_records
  DROP CONSTRAINT IF EXISTS fee_records_fee_type_check;

ALTER TABLE fee_records
  ADD CONSTRAINT fee_records_fee_type_check
  CHECK (fee_type IN ('monthly', 'admission', 'dress', 'credit_adjustment'));

ALTER TABLE fee_records
  DROP CONSTRAINT IF EXISTS fee_records_skf_id_month_year_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_records_unique_type_period
  ON fee_records (skf_id, fee_type, month, year);

CREATE INDEX IF NOT EXISTS idx_fee_records_type_status_year
  ON fee_records (fee_type, status, year);

-- Private proof bucket for QR/UPI screenshots.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  allowed_mime_types
)
VALUES (
  'fee-payment-proofs',
  'fee-payment-proofs',
  false,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "service_role_full_fee_payment_proofs_storage" ON storage.objects;

CREATE POLICY "service_role_full_fee_payment_proofs_storage"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'fee-payment-proofs')
WITH CHECK (bucket_id = 'fee-payment-proofs');

CREATE TABLE IF NOT EXISTS fee_payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_record_id UUID REFERENCES fee_records(id) ON DELETE SET NULL,
  skf_id TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  proof_path TEXT NOT NULL,
  proof_filename TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_fee_payment_proofs_status_date
  ON fee_payment_proofs (status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_payment_proofs_skf
  ON fee_payment_proofs (skf_id, submitted_at DESC);

ALTER TABLE fee_payment_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_payment_proofs" ON fee_payment_proofs;

CREATE POLICY "service_role_full_fee_payment_proofs"
ON fee_payment_proofs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS fee_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_code TEXT UNIQUE NOT NULL,
  skf_id TEXT NOT NULL,
  branch TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'used', 'cancelled')),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_fee_record_id UUID REFERENCES fee_records(id) ON DELETE SET NULL,
  used_month TEXT,
  used_year INTEGER,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_credits_skf_status
  ON fee_credits (skf_id, status);

CREATE INDEX IF NOT EXISTS idx_fee_credits_branch_status
  ON fee_credits (branch, status);

ALTER TABLE fee_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_credits" ON fee_credits;

CREATE POLICY "service_role_full_fee_credits"
ON fee_credits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS development_fund_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_code TEXT UNIQUE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_development_fund_expenses_period
  ON development_fund_expenses (year, month);

ALTER TABLE development_fund_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_development_fund_expenses" ON development_fund_expenses;

CREATE POLICY "service_role_full_development_fund_expenses"
ON development_fund_expenses
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS special_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_token TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_special_days_active
  ON special_days (is_active);

ALTER TABLE special_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_special_days" ON special_days;

CREATE POLICY "service_role_full_special_days"
ON special_days
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS fee_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  skf_id TEXT,
  fee_record_id UUID,
  before JSONB,
  after JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_audit_logs_skf_date
  ON fee_audit_logs (skf_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_audit_logs_action_date
  ON fee_audit_logs (action, created_at DESC);

ALTER TABLE fee_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_audit_logs" ON fee_audit_logs;

CREATE POLICY "service_role_full_fee_audit_logs"
ON fee_audit_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
