-- Temporary Black Belt 2026 installment correction.
--
-- Applies only to the five installment candidates below for June-October 2026.
-- Shri/Sri Roshan (SKF13BL000 / spaced variants) is intentionally excluded:
-- he remains on normal monthly fees and should receive the examination fee
-- as a separate end-of-program fee, not as a monthly override.

WITH installment_candidates(skf_id) AS (
  VALUES
    ('SKF20HE001'),
    ('SKF20HE002'),
    ('SKF20HE003'),
    ('SKF21HE001'),
    ('SKF21HE003')
),
installment_months(month_name, month_number) AS (
  VALUES
    ('June', 6),
    ('July', 7),
    ('August', 8),
    ('September', 9),
    ('October', 10)
),
candidate_months AS (
  SELECT
    candidates.skf_id,
    months.month_name,
    months.month_number,
    athletes.branch_name
  FROM installment_candidates candidates
  CROSS JOIN installment_months months
  LEFT JOIN athletes ON athletes.skf_id = candidates.skf_id
)
INSERT INTO fee_records (
  skf_id,
  fee_type,
  month,
  year,
  amount,
  status,
  source_key,
  source_label,
  due_date,
  branch_snapshot,
  metadata,
  updated_at
)
SELECT
  skf_id,
  'monthly',
  month_name,
  2026,
  2000,
  'due',
  '',
  'Black Belt Exam Installment',
  make_date(2026, month_number, 1),
  branch_name,
  jsonb_build_object('temporaryOverride', 'black_belt_exam_installment_2026'),
  NOW()
FROM candidate_months
ON CONFLICT (skf_id, fee_type, month, year, source_key) DO NOTHING;

WITH installment_candidates(skf_id) AS (
  VALUES
    ('SKF20HE001'),
    ('SKF20HE002'),
    ('SKF20HE003'),
    ('SKF21HE001'),
    ('SKF21HE003')
),
installment_months(month_name) AS (
  VALUES
    ('June'),
    ('July'),
    ('August'),
    ('September'),
    ('October')
)
UPDATE fee_records
SET
  amount = 2000,
  source_label = 'Black Belt Exam Installment',
  metadata = COALESCE(fee_records.metadata, '{}'::jsonb)
    || CASE
      WHEN COALESCE(fee_records.metadata, '{}'::jsonb) ? 'baseAmountBeforeOverride' THEN '{}'::jsonb
      ELSE jsonb_build_object('baseAmountBeforeOverride', fee_records.amount)
    END
    || jsonb_build_object(
      'temporaryOverride', 'black_belt_exam_installment_2026',
      'correctedBy', '038_black_belt_installment_fee_rows'
    ),
  updated_at = NOW()
FROM installment_candidates candidates
JOIN installment_months months ON TRUE
WHERE fee_records.skf_id = candidates.skf_id
  AND fee_records.fee_type = 'monthly'
  AND fee_records.year = 2026
  AND fee_records.month = months.month_name
  AND fee_records.status IN ('due', 'overdue', 'rejected', 'pending_verification')
  AND (
    fee_records.amount IS DISTINCT FROM 2000
    OR COALESCE(fee_records.source_label, '') IS DISTINCT FROM 'Black Belt Exam Installment'
  );

-- Guardrail for Roshan: do not use installment or exam labels on monthly rows.
WITH roshan_monthly_rows AS (
  SELECT
    fee_records.id,
    COALESCE(student_billing_profiles.monthly_fee, athletes.monthly_fee, fee_records.amount) AS regular_amount
  FROM fee_records
  LEFT JOIN student_billing_profiles ON student_billing_profiles.skf_id = fee_records.skf_id
  LEFT JOIN athletes ON athletes.skf_id = fee_records.skf_id
  WHERE UPPER(REPLACE(REPLACE(fee_records.skf_id, ' ', ''), '-', '')) IN ('SKF13BL000', 'SKF13BL0000')
    AND fee_records.fee_type = 'monthly'
    AND fee_records.year = 2026
    AND fee_records.month IN ('June', 'July', 'August', 'September', 'October')
    AND fee_records.status IN ('due', 'overdue', 'rejected', 'pending_verification')
    AND (
      fee_records.amount IN (2000, 11000)
      OR COALESCE(fee_records.source_label, '') IN ('Black Belt Exam Installment', 'Black Belt Exam Fee')
    )
)
UPDATE fee_records
SET
  amount = roshan_monthly_rows.regular_amount,
  source_label = NULL,
  metadata = (COALESCE(fee_records.metadata, '{}'::jsonb) - 'temporaryOverride' - 'baseAmountBeforeOverride')
    || jsonb_build_object(
      'temporaryOverrideExcluded', 'black_belt_exam_installment_2026',
      'correctedBy', '038_black_belt_installment_fee_rows'
    ),
  updated_at = NOW()
FROM roshan_monthly_rows
WHERE fee_records.id = roshan_monthly_rows.id;
