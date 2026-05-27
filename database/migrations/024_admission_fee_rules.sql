-- Final admission fee rules for Herohalli and M P Sports Club.

INSERT INTO admission_branch_settings (
  branch_slug,
  branch_name,
  is_enabled,
  show_public_cta,
  default_monthly_fee,
  default_admission_fee,
  default_dress_fee,
  default_dress_cost,
  batch_options,
  notes,
  updated_at
)
VALUES
  (
    'mp-sports-club',
    'M P Sports Club',
    true,
    true,
    2500,
    2500,
    0,
    0,
    '["5:00 PM - 6:30 PM"]'::jsonb,
    'Admission payment covers admission only. EARLYBIRDMP reduces admission to Rs. 1,500. Dress is ordered through Shop. Monthly fee is collected in FeeTrack.',
    NOW()
  ),
  (
    'herohalli',
    'Herohalli',
    true,
    true,
    500,
    2000,
    0,
    0,
    '["6:00 AM - 7:00 AM"]'::jsonb,
    'Admission payment is Rs. 2,000 and includes dress. Monthly fee is collected in FeeTrack.',
    NOW()
  )
ON CONFLICT (branch_slug) DO UPDATE
SET
  branch_name = EXCLUDED.branch_name,
  is_enabled = EXCLUDED.is_enabled,
  show_public_cta = EXCLUDED.show_public_cta,
  default_monthly_fee = EXCLUDED.default_monthly_fee,
  default_admission_fee = EXCLUDED.default_admission_fee,
  default_dress_fee = EXCLUDED.default_dress_fee,
  default_dress_cost = EXCLUDED.default_dress_cost,
  batch_options = EXCLUDED.batch_options,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO admission_promo_codes (
  code,
  code_key,
  name,
  branch_slug,
  status,
  discount_type,
  discount_value,
  applies_to,
  notes,
  created_at,
  updated_at
)
SELECT
  'EARLYBIRDMP',
  'EARLYBIRDMP',
  'MP Early Bird Admission',
  'mp-sports-club',
  'active',
  'fee_override',
  1500,
  'admission',
  'Reduces M P Sports Club admission payment from Rs. 2,500 to Rs. 1,500. Dress is ordered through Shop.',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM admission_promo_codes
  WHERE code_key = 'EARLYBIRDMP'
    AND branch_slug = 'mp-sports-club'
);

UPDATE admission_promo_codes
SET
  code = 'EARLYBIRDMP',
  name = 'MP Early Bird Admission',
  status = 'active',
  discount_type = 'fee_override',
  discount_value = 1500,
  applies_to = 'admission',
  notes = 'Reduces M P Sports Club admission payment from Rs. 2,500 to Rs. 1,500. Dress is ordered through Shop.',
  updated_at = NOW()
WHERE code_key = 'EARLYBIRDMP'
  AND branch_slug = 'mp-sports-club';
