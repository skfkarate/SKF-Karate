-- Legacy FeeTrack Google Sheet rows mapped into the current Supabase fee schema.
-- Run after database/pending_supabase_migrations.sql has completed successfully.
-- Old sheet IDs are preserved as business codes only:
--   Credit_ID -> fee_credits.credit_code
--   DEV-xxx   -> development_fund_expenses.expense_code
-- Supabase primary keys remain generated UUIDs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Billing profiles used by the fee console for monthly amount and branch snapshots.
WITH legacy_billing(skf_id, billing_status, monthly_fee, branch_snapshot) AS (
  VALUES
  ('SKF13BL000', 'active', 1000, 'Herohalli'),
  ('SKF20HE001', 'active', 400, 'Herohalli'),
  ('SKF20HE002', 'active', 400, 'Herohalli'),
  ('SKF20HE003', 'active', 400, 'Herohalli'),
  ('SKF21HE001', 'active', 400, 'Herohalli'),
  ('SKF21HE002', 'active', 0, 'Herohalli'),
  ('SKF23HE001', 'active', 400, 'Herohalli'),
  ('SKF23HE002', 'discontinued', 400, 'Herohalli'),
  ('SKF23HE003', 'active', 0, 'Herohalli'),
  ('SKF23HE004', 'active', 400, 'Herohalli'),
  ('SKF23HE005', 'active', 400, 'Herohalli'),
  ('SKF23HE006', 'active', 400, 'Herohalli'),
  ('SKF24HE001', 'active', 400, 'Herohalli'),
  ('SKF25HE001', 'active', 400, 'Herohalli'),
  ('SKF25HE002', 'active', 400, 'Herohalli'),
  ('SKF25HE003', 'active', 500, 'Herohalli'),
  ('SKF26HE001', 'active', 400, 'Herohalli'),
  ('SKF25MP001', 'active', 2000, 'M P Sports Club'),
  ('SKF25MP002', 'active', 0, 'M P Sports Club'),
  ('SKF25MP003', 'active', 2500, 'M P Sports Club'),
  ('SKF25MP004', 'active', 2500, 'M P Sports Club'),
  ('SKF25MP005', 'active', 2000, 'M P Sports Club'),
  ('SKF25MP006', 'active', 2000, 'M P Sports Club'),
  ('SKF25MP007', 'active', 2000, 'M P Sports Club')
)
INSERT INTO student_billing_profiles (
  skf_id,
  billing_status,
  monthly_fee,
  branch_snapshot,
  updated_at
)
SELECT
  skf_id,
  billing_status,
  monthly_fee,
  branch_snapshot,
  now()
FROM legacy_billing
ON CONFLICT (skf_id) DO UPDATE SET
  billing_status = EXCLUDED.billing_status,
  monthly_fee = EXCLUDED.monthly_fee,
  branch_snapshot = EXCLUDED.branch_snapshot,
  updated_at = now();

-- 2) Monthly fee ledger rows plus the one used referral-credit adjustment.
WITH legacy_fee_rows(skf_id, fee_type, month, year, amount, status, source_status, source_sheet) AS (
  VALUES
  ('SKF13BL000', 'monthly', 'January', 2026, 1000, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF13BL000', 'monthly', 'February', 2026, 1000, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF13BL000', 'monthly', 'March', 2026, 1000, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF13BL000', 'monthly', 'April', 2026, 1000, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE001', 'monthly', 'January', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE001', 'monthly', 'February', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE001', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE001', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE002', 'monthly', 'January', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE002', 'monthly', 'February', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE002', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE002', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE003', 'monthly', 'January', 2026, 400, 'due', 'Pending', 'Fees_Herohalli'),
  ('SKF20HE003', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF20HE003', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF20HE003', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF21HE001', 'monthly', 'January', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF21HE001', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF21HE001', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF21HE001', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF21HE002', 'monthly', 'January', 2026, 0, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF21HE002', 'monthly', 'February', 2026, 0, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF21HE002', 'monthly', 'March', 2026, 0, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF21HE002', 'monthly', 'April', 2026, 0, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE001', 'monthly', 'January', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE001', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE001', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE001', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE003', 'monthly', 'January', 2026, 0, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE003', 'monthly', 'February', 2026, 0, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE003', 'monthly', 'March', 2026, 0, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE003', 'monthly', 'April', 2026, 0, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE004', 'monthly', 'January', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE004', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE004', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE004', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE005', 'monthly', 'January', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE005', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF23HE005', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE005', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE006', 'monthly', 'January', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE006', 'monthly', 'February', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE006', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE006', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF24HE001', 'monthly', 'January', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF24HE001', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF24HE001', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF24HE001', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE001', 'monthly', 'January', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF25HE001', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF25HE001', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE001', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE002', 'monthly', 'January', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE002', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF25HE002', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE002', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE003', 'monthly', 'January', 2026, 500, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE003', 'monthly', 'February', 2026, 500, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE003', 'monthly', 'March', 2026, 500, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE003', 'monthly', 'April', 2026, 500, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE003', 'monthly', 'May', 2026, 500, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF25HE003', 'monthly', 'June', 2026, 500, 'due', 'Pending', 'Fees_Herohalli'),
  ('SKF26HE001', 'monthly', 'January', 2026, 400, 'due', 'Pending', 'Fees_Herohalli'),
  ('SKF26HE001', 'monthly', 'February', 2026, 400, 'paid', 'Paid', 'Fees_Herohalli'),
  ('SKF26HE001', 'monthly', 'March', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF26HE001', 'monthly', 'April', 2026, 400, 'break', 'Break', 'Fees_Herohalli'),
  ('SKF23HE002', 'monthly', 'January', 2025, 400, 'waived', 'Discontinued', 'Fees_Herohalli'),
  ('SKF25MP001', 'monthly', 'January', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP001', 'monthly', 'February', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP001', 'monthly', 'March', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP001', 'monthly', 'April', 2026, 2000, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP001', 'monthly', 'May', 2026, 2000, 'due', 'Pending', 'Fees_MP'),
  ('SKF25MP002', 'monthly', 'January', 2026, 0, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP002', 'monthly', 'February', 2026, 0, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP002', 'monthly', 'March', 2026, 0, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP002', 'monthly', 'April', 2026, 0, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP002', 'monthly', 'May', 2026, 0, 'due', 'Pending', 'Fees_MP'),
  ('SKF25MP003', 'monthly', 'January', 2026, 2500, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP003', 'monthly', 'February', 2026, 2500, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP003', 'monthly', 'March', 2026, 2500, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP003', 'monthly', 'April', 2026, 2500, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP003', 'monthly', 'May', 2026, 2500, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP004', 'monthly', 'January', 2026, 2500, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP004', 'monthly', 'February', 2026, 2500, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP004', 'monthly', 'March', 2026, 2500, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP004', 'monthly', 'April', 2026, 2500, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP004', 'monthly', 'May', 2026, 2500, 'due', 'Pending', 'Fees_MP'),
  ('SKF25MP005', 'monthly', 'January', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP005', 'monthly', 'February', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP005', 'monthly', 'March', 2026, 2000, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP005', 'monthly', 'April', 2026, 2000, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP005', 'monthly', 'May', 2026, 2000, 'due', 'Pending', 'Fees_MP'),
  ('SKF25MP006', 'monthly', 'January', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP006', 'monthly', 'February', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP006', 'monthly', 'March', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP006', 'monthly', 'April', 2026, 2000, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP006', 'monthly', 'May', 2026, 2000, 'due', 'Pending', 'Fees_MP'),
  ('SKF25MP007', 'monthly', 'January', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP007', 'monthly', 'February', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP007', 'monthly', 'March', 2026, 2000, 'paid', 'Paid', 'Fees_MP'),
  ('SKF25MP007', 'monthly', 'April', 2026, 2000, 'break', 'Break', 'Fees_MP'),
  ('SKF25MP007', 'monthly', 'May', 2026, 2000, 'due', 'Pending', 'Fees_MP'),
  ('SKF25MP006', 'credit_adjustment', 'January', 2026, 500, 'paid', 'Referral credit REF-M-001 used', 'ReferralCredits_MP')
), normalized AS (
  SELECT
    skf_id,
    fee_type,
    month,
    year,
    amount,
    status,
    CASE
      WHEN status = 'paid' THEN make_timestamptz(year, CASE month
        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
        WHEN 'October' THEN 10 WHEN 'November' THEN 11 ELSE 12 END, 10, 9, 0, 0, 'Asia/Kolkata')
      ELSE NULL
    END AS paid_at,
    source_status,
    source_sheet
  FROM legacy_fee_rows
)
INSERT INTO fee_records (
  skf_id,
  fee_type,
  month,
  year,
  amount,
  status,
  paid_date,
  receipt_id,
  payment_method,
  verified_by,
  verified_at,
  notes,
  metadata,
  updated_at
)
SELECT
  skf_id,
  fee_type,
  month,
  year,
  amount,
  status,
  paid_at,
  CASE
    WHEN status = 'paid' AND fee_type <> 'credit_adjustment'
      THEN 'SKF-FEE-' || year || '-' || lpad((CASE month
        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
        WHEN 'October' THEN 10 WHEN 'November' THEN 11 ELSE 12 END)::text, 2, '0') ||
        '-' || CASE fee_type WHEN 'admission' THEN 'ADM' WHEN 'dress' THEN 'DRS' ELSE 'MON' END ||
        '-' || skf_id
    ELSE NULL
  END,
  CASE
    WHEN status = 'paid' AND fee_type = 'credit_adjustment' THEN 'Legacy referral credit'
    WHEN status = 'paid' THEN 'Legacy Google Sheet'
    ELSE NULL
  END,
  CASE WHEN status = 'paid' THEN 'Legacy migration' ELSE NULL END,
  paid_at,
  CASE
    WHEN source_status = 'Discontinued' THEN 'Migrated from legacy Discontinued status; represented as waived in the new ledger.'
    WHEN source_status = 'Pending' THEN 'Migrated from blank/pending legacy sheet cell.'
    ELSE 'Migrated from legacy ' || source_status || ' status.'
  END,
  jsonb_build_object(
    'source', 'legacy_google_sheet_paste',
    'sourceSheet', source_sheet,
    'sourceStatus', source_status
  ),
  now()
FROM normalized
ON CONFLICT (skf_id, fee_type, month, year) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = EXCLUDED.status,
  paid_date = EXCLUDED.paid_date,
  receipt_id = coalesce(fee_records.receipt_id, EXCLUDED.receipt_id),
  payment_method = EXCLUDED.payment_method,
  verified_by = EXCLUDED.verified_by,
  verified_at = EXCLUDED.verified_at,
  notes = EXCLUDED.notes,
  metadata = coalesce(fee_records.metadata, '{}'::jsonb) || coalesce(EXCLUDED.metadata, '{}'::jsonb),
  updated_at = now();

-- 3) Preserve the referral credit code and mark it as used in January 2026.
INSERT INTO fee_credits (
  credit_code,
  skf_id,
  branch,
  amount,
  reason,
  description,
  status,
  earned_at,
  used_fee_record_id,
  used_month,
  used_year,
  used_at,
  updated_at
)
SELECT
  'REF-M-001',
  'SKF25MP006',
  'M P Sports Club',
  500,
  'Purvank P (SKF25MP007)',
  'Legacy referral credit from ReferralCredits_MP sheet.',
  'used',
  '2026-01-17T00:00:00+05:30'::timestamptz,
  fr.id,
  'January',
  2026,
  '2026-01-17T17:35:52.292Z'::timestamptz,
  now()
FROM fee_records fr
WHERE fr.skf_id = 'SKF25MP006'
  AND fr.fee_type = 'credit_adjustment'
  AND fr.month = 'January'
  AND fr.year = 2026
ON CONFLICT (credit_code) DO UPDATE SET
  skf_id = EXCLUDED.skf_id,
  branch = EXCLUDED.branch,
  amount = EXCLUDED.amount,
  reason = EXCLUDED.reason,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  earned_at = EXCLUDED.earned_at,
  used_fee_record_id = EXCLUDED.used_fee_record_id,
  used_month = EXCLUDED.used_month,
  used_year = EXCLUDED.used_year,
  used_at = EXCLUDED.used_at,
  updated_at = now();

-- 4) Development fund expenses. Legacy Month was one-based: 1 = January.
WITH legacy_dev_expenses(expense_code, month, year, title, description, scope, amount, created_on) AS (
  VALUES
  ('DEV-001', 'January', 2026, 'Superman Sunboard', 'Superman themed sunboard with T metal stand (dec)', 'M P Sports Club', 2300, '2025-12-12'),
  ('DEV-002', 'January', 2026, 'New Year 🎁', '7 Stretch bands (Meesho)', 'M P Sports Club', 743, '2026-01-01'),
  ('DEV-003', 'February', 2026, '4000 Flyers', '2000 Jnanavi + 2000 Harsha + 2000 (mistake, free)', 'Herohalli', 5627, '2026-02-01'),
  ('DEV-004', 'February', 2026, 'Stickers & Banner', 'Jnanavi + Harsha + State level winners & banner on metal stand (in home)', 'Herohalli', 1300, '2026-02-02'),
  ('DEV-005', 'February', 2026, 'Valentine ♥️ advertising', 'Foldable heart for valentines
(Cars & bikes)', 'Both', 500, '2026-02-12'),
  ('DEV-006', 'February', 2026, 'AKASA Affliction', 'Payed 3000 to appa and 2000 from raki', 'Both', 3000, '2026-02-17'),
  ('DEV-007', 'January', 2026, 'Jio Recharge', 'In Oct 2025 - 448
In Jan 2026 - 189', 'Mobile Recharge', 637, '2026-02-19'),
  ('DEV-008', 'March', 2026, 'Jio recharge', 'March to May', 'Mobile Recharge', 448, '2026-03-08')
)
INSERT INTO development_fund_expenses (
  expense_code,
  month,
  year,
  title,
  description,
  scope,
  amount,
  created_by,
  created_at,
  updated_at
)
SELECT
  expense_code,
  month,
  year,
  title,
  description,
  scope,
  amount,
  'Legacy migration',
  (created_on || 'T00:00:00+05:30')::timestamptz,
  now()
FROM legacy_dev_expenses
ON CONFLICT (expense_code) DO UPDATE SET
  month = EXCLUDED.month,
  year = EXCLUDED.year,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  scope = EXCLUDED.scope,
  amount = EXCLUDED.amount,
  created_by = EXCLUDED.created_by,
  created_at = EXCLUDED.created_at,
  updated_at = now(),
  deleted_at = NULL;

-- 5) Special-day poster reminders.
WITH legacy_special_days(name, date_token, category, notes) AS (
  VALUES
  ('New Year', '01-Jan', 'Celebration', 'Happy New Year poster'),
  ('Republic Day', '26-Jan', 'National', 'National flag / patriotic poster'),
  ('Women''s Day', '08-Mar', 'Awareness', 'Women empowerment poster'),
  ('Ugadi', '29-Mar', 'Festival', 'Telugu/Kannada New Year'),
  ('Ramadan Begins', '01-Mar', 'Festival', 'Greetings poster'),
  ('Ambedkar Jayanti', '14-Apr', 'National', ''),
  ('Eid ul-Fitr', '31-Mar', 'Festival', 'Eid greetings poster'),
  ('May Day', '01-May', 'Awareness', 'Labour Day'),
  ('International Yoga Day', '21-Jun', 'Sports', 'Yoga & fitness poster'),
  ('Eid ul-Adha', '07-Jun', 'Festival', 'Bakrid greetings'),
  ('Independence Day', '15-Aug', 'National', 'Tricolor / patriotic poster'),
  ('Janmashtami', '25-Aug', 'Festival', 'Krishna Jayanti'),
  ('National Sports Day', '29-Aug', 'Sports', 'Dhyan Chand tribute & sports poster'),
  ('Teachers'' Day', '05-Sep', 'Awareness', 'Guru tribute poster'),
  ('Ganesh Chaturthi', '07-Sep', 'Festival', 'Ganpati poster'),
  ('Gandhi Jayanti', '02-Oct', 'National', 'Mahatma Gandhi tribute'),
  ('Dasara / Dussehra', '12-Oct', 'Festival', 'Victory of good poster'),
  ('World Karate Day', '25-Oct', 'Sports', 'Karate poster — MUST DO!'),
  ('Diwali', '01-Nov', 'Festival', 'Festival of lights poster'),
  ('Children''s Day', '14-Nov', 'Awareness', 'Chacha Nehru / kids poster'),
  ('Guru Nanak Jayanti', '15-Nov', 'Festival', ''),
  ('Christmas', '25-Dec', 'Festival', 'Christmas greetings poster')
), updated AS (
  UPDATE special_days target
  SET
    category = legacy.category,
    notes = legacy.notes,
    is_active = true,
    updated_at = now()
  FROM legacy_special_days legacy
  WHERE target.name = legacy.name
    AND target.date_token = legacy.date_token
  RETURNING target.name, target.date_token
)
INSERT INTO special_days (name, date_token, category, notes, is_active, updated_at)
SELECT legacy.name, legacy.date_token, legacy.category, legacy.notes, true, now()
FROM legacy_special_days legacy
WHERE NOT EXISTS (
  SELECT 1
  FROM updated
  WHERE updated.name = legacy.name
    AND updated.date_token = legacy.date_token
);
