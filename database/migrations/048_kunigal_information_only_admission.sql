-- Kunigal uses the public admission form for athlete intake only.
-- Fee collection and class allocation stay with the local branch.

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
VALUES (
  'kunigal',
  'Kunigal',
  true,
  true,
  0,
  0,
  0,
  0,
  '[]'::jsonb,
  'Student information is collected here. Fees are handled directly by the Kunigal branch.',
  NOW()
)
ON CONFLICT (branch_slug) DO UPDATE
SET
  branch_name = EXCLUDED.branch_name,
  is_enabled = EXCLUDED.is_enabled,
  show_public_cta = EXCLUDED.show_public_cta,
  default_monthly_fee = 0,
  default_admission_fee = 0,
  default_dress_fee = 0,
  default_dress_cost = 0,
  batch_options = '[]'::jsonb,
  notes = EXCLUDED.notes,
  updated_at = NOW();
