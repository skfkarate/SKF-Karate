-- Keep Ganvith Ishan (SKF25MP002) on a zero monthly fee for the July 2026
-- upcoming portal period without changing any other student.

UPDATE athletes
SET
  monthly_fee = 0,
  updated_at = NOW()
WHERE skf_id = 'SKF25MP002';

INSERT INTO student_billing_profiles (
  skf_id,
  billing_status,
  monthly_fee,
  branch_snapshot,
  updated_at
)
VALUES (
  'SKF25MP002',
  'active',
  0,
  'M P Sports Club',
  NOW()
)
ON CONFLICT (skf_id) DO UPDATE SET
  monthly_fee = 0,
  branch_snapshot = COALESCE(student_billing_profiles.branch_snapshot, EXCLUDED.branch_snapshot),
  updated_at = NOW();

UPDATE fee_records
SET
  amount = 0,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('source', '037_skf25mp002_zero_upcoming_fee'),
  updated_at = NOW()
WHERE skf_id = 'SKF25MP002'
  AND fee_type = 'monthly'
  AND status IN ('due', 'overdue', 'pending_verification', 'rejected')
  AND (
    year > 2026
    OR (year = 2026 AND month IN ('June', 'July', 'August', 'September', 'October', 'November', 'December'))
  );

INSERT INTO fee_records (
  skf_id,
  fee_type,
  month,
  year,
  amount,
  status,
  source_key,
  due_date,
  branch_snapshot,
  notes,
  metadata,
  updated_at
)
VALUES (
  'SKF25MP002',
  'monthly',
  'July',
  2026,
  0,
  'due',
  '',
  DATE '2026-07-01',
  'M P Sports Club',
  'Monthly fee kept at 0 for SKF25MP002 upcoming July 2026 period.',
  jsonb_build_object('source', '037_skf25mp002_zero_upcoming_fee'),
  NOW()
)
ON CONFLICT (skf_id, fee_type, month, year, source_key) DO UPDATE SET
  amount = 0,
  due_date = EXCLUDED.due_date,
  branch_snapshot = COALESCE(fee_records.branch_snapshot, EXCLUDED.branch_snapshot),
  notes = COALESCE(fee_records.notes, EXCLUDED.notes),
  metadata = COALESCE(fee_records.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();
