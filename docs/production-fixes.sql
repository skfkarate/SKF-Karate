-- ============================================================
-- 1. Herohalli Branch — Fix branch_scope
-- ============================================================
SELECT username, branch_scope FROM staff_accounts;
UPDATE staff_accounts SET branch_scope = 'all'
WHERE username = '<your-feetrack-username>';

-- ============================================================
-- 2. Push Subscriptions — Add missing columns (idempotent)
-- ============================================================
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS endpoint TEXT,
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS staff_id TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ============================================================
-- 3. SKF25HE003 — Monthly fee correction 500 → 400
-- ============================================================
UPDATE student_billing_profiles SET monthly_fee = 400, updated_at = NOW()
WHERE skf_id = 'SKF25HE003';

UPDATE athletes SET monthly_fee = 400, updated_at = NOW()
WHERE skf_id = 'SKF25HE003';

UPDATE fee_records SET amount = 400, updated_at = NOW()
WHERE skf_id = 'SKF25HE003' AND amount = 500;

-- ============================================================
-- 4. SKF21HE003 — Revert mistaken June 2026 payment
-- ============================================================
UPDATE fee_records
SET status = 'due',
    paid_date = NULL,
    receipt_id = NULL,
    payment_method = NULL,
    verified_by = NULL,
    verified_at = NULL,
    updated_at = NOW()
WHERE skf_id = 'SKF21HE003'
  AND fee_type = 'monthly'
  AND month = 'June'
  AND year = 2026
  AND status = 'paid';

-- ============================================================
-- 5. SKF26HE002 — Make monthly fees zero
-- ============================================================
UPDATE athletes SET monthly_fee = 0, updated_at = NOW()
WHERE skf_id = 'SKF26HE002';

UPDATE student_billing_profiles SET monthly_fee = 0, updated_at = NOW()
WHERE skf_id = 'SKF26HE002';

UPDATE fee_records SET amount = 0, updated_at = NOW()
WHERE skf_id = 'SKF26HE002' AND fee_type = 'monthly' AND amount = 500;

-- ============================================================
-- 6. Cleanup legacy SKF17BL000 alias
-- ============================================================
DELETE FROM bb_candidates WHERE skf_id IN ('SKF17BL000', 'SKF17BL0000', 'SKF17BL00');
DELETE FROM fee_payment_proofs WHERE skf_id IN ('SKF17BL000', 'SKF17BL0000', 'SKF17BL00');
DELETE FROM fee_records WHERE skf_id IN ('SKF17BL000', 'SKF17BL0000', 'SKF17BL00');
DELETE FROM student_billing_profiles WHERE skf_id IN ('SKF17BL000', 'SKF17BL0000', 'SKF17BL00');
DELETE FROM athletes WHERE skf_id IN ('SKF17BL000', 'SKF17BL0000', 'SKF17BL00');

-- ============================================================
-- 7. Add teaching_hours column to bb_candidates
-- ============================================================
ALTER TABLE bb_candidates ADD COLUMN IF NOT EXISTS teaching_hours INTEGER DEFAULT 0;
NOTIFY pgrst, 'reload schema';
