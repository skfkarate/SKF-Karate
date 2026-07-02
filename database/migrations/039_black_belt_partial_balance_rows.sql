-- Preserve historical regular-fee payments made before the temporary black belt
-- installment override, and create a separate pending balance for the remainder.

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
approved_partial_payments AS (
  SELECT DISTINCT ON (fee_records.id)
    fee_records.id AS fee_record_id,
    fee_records.skf_id,
    fee_records.month,
    fee_records.year,
    fee_records.metadata,
    fee_payment_proofs.id AS proof_id,
    fee_payment_proofs.amount AS proof_amount,
    fee_payment_proofs.reviewed_by,
    fee_payment_proofs.reviewed_at,
    fee_payment_proofs.submitted_at,
    fee_payment_proofs.payment_reference,
    fee_receipts.receipt_id
  FROM fee_records
  JOIN installment_candidates candidates ON candidates.skf_id = fee_records.skf_id
  JOIN installment_months months ON months.month_name = fee_records.month
  JOIN fee_payment_proofs ON fee_payment_proofs.fee_record_id = fee_records.id
  LEFT JOIN fee_receipts ON fee_receipts.fee_record_id = fee_records.id
  WHERE fee_records.fee_type = 'monthly'
    AND fee_records.year = 2026
    AND fee_payment_proofs.status = 'approved'
    AND fee_payment_proofs.amount > 0
    AND fee_payment_proofs.amount < 2000
  ORDER BY fee_records.id, fee_payment_proofs.reviewed_at DESC NULLS LAST, fee_payment_proofs.submitted_at DESC
),
restored_paid_rows AS (
  UPDATE fee_records
  SET
    amount = approved_partial_payments.proof_amount,
    status = 'paid',
    paid_date = COALESCE(approved_partial_payments.reviewed_at, approved_partial_payments.submitted_at, fee_records.paid_date),
    receipt_id = COALESCE(fee_records.receipt_id, approved_partial_payments.receipt_id),
    payment_method = COALESCE(
      fee_records.payment_method,
      CONCAT_WS(' • ', 'UPI QR - screenshot verified', NULLIF(approved_partial_payments.payment_reference, ''))
    ),
    verified_by = COALESCE(fee_records.verified_by, approved_partial_payments.reviewed_by),
    verified_at = COALESCE(fee_records.verified_at, approved_partial_payments.reviewed_at, approved_partial_payments.submitted_at),
    source_label = NULL,
    metadata = (COALESCE(fee_records.metadata, '{}'::jsonb) - 'temporaryOverride' - 'baseAmountBeforeOverride')
      || jsonb_build_object(
        'blackBeltInstallmentPartialPayment', true,
        'blackBeltInstallmentAmount', 2000,
        'blackBeltInstallmentPaidAmount', approved_partial_payments.proof_amount,
        'blackBeltInstallmentBalanceAmount', 2000 - approved_partial_payments.proof_amount,
        'correctedBy', '039_black_belt_partial_balance_rows'
      ),
    updated_at = NOW()
  FROM approved_partial_payments
  WHERE fee_records.id = approved_partial_payments.fee_record_id
  RETURNING
    fee_records.id AS fee_record_id,
    fee_records.skf_id,
    fee_records.month,
    fee_records.year,
    approved_partial_payments.proof_id,
    approved_partial_payments.proof_amount
)
INSERT INTO fee_records (
  skf_id,
  fee_type,
  month,
  year,
  amount,
  status,
  source_key,
  source_type,
  source_id,
  source_label,
  due_date,
  notes,
  metadata,
  updated_at
)
SELECT
  skf_id,
  'other',
  month,
  year,
  2000 - proof_amount,
  'due',
  CONCAT('black_belt_balance:', skf_id, ':', year, ':', month),
  'black_belt_installment_balance',
  proof_id::text,
  'Black Belt Exam Installment Balance',
  make_date(
    year,
    CASE month
      WHEN 'June' THEN 6
      WHEN 'July' THEN 7
      WHEN 'August' THEN 8
      WHEN 'September' THEN 9
      WHEN 'October' THEN 10
      ELSE 1
    END,
    1
  ),
  'Remaining balance after approved regular monthly fee payment.',
  jsonb_build_object(
    'temporaryOverride', 'black_belt_exam_installment_2026',
    'balanceForFeeRecordId', fee_record_id,
    'approvedProofId', proof_id,
    'approvedAmount', proof_amount,
    'installmentAmount', 2000,
    'correctedBy', '039_black_belt_partial_balance_rows'
  ),
  NOW()
FROM restored_paid_rows
WHERE 2000 - proof_amount > 0
ON CONFLICT (skf_id, fee_type, month, year, source_key) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = CASE
    WHEN fee_records.status = 'paid' THEN fee_records.status
    ELSE EXCLUDED.status
  END,
  source_type = EXCLUDED.source_type,
  source_id = EXCLUDED.source_id,
  source_label = EXCLUDED.source_label,
  due_date = EXCLUDED.due_date,
  notes = COALESCE(fee_records.notes, EXCLUDED.notes),
  metadata = COALESCE(fee_records.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();
