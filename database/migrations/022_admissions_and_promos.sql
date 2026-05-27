-- Branch admission workflow, promo codes, and approved profile photos.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS admission_branch_settings (
  branch_slug TEXT PRIMARY KEY,
  branch_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  show_public_cta BOOLEAN NOT NULL DEFAULT false,
  default_monthly_fee NUMERIC NOT NULL DEFAULT 0,
  default_admission_fee NUMERIC NOT NULL DEFAULT 0,
  default_dress_fee NUMERIC NOT NULL DEFAULT 0,
  default_dress_cost NUMERIC NOT NULL DEFAULT 0,
  batch_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  notes
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
    'Admission payment covers admission only. EARLYBIRDMP reduces admission to Rs. 1,500. Dress is ordered through Shop. Monthly fee is collected in FeeTrack.'
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
    'Admission payment is Rs. 2,000 and includes dress. Monthly fee is collected in FeeTrack.'
  )
ON CONFLICT (branch_slug) DO NOTHING;

ALTER TABLE admission_branch_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_admission_branch_settings" ON admission_branch_settings;

CREATE POLICY "service_role_full_admission_branch_settings"
ON admission_branch_settings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS admission_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  code_key TEXT NOT NULL,
  name TEXT,
  branch_slug TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  discount_type TEXT NOT NULL
    CHECK (discount_type IN ('percent', 'fixed', 'fee_override', 'admission_waiver')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  applies_to TEXT NOT NULL DEFAULT 'monthly'
    CHECK (applies_to IN ('monthly', 'admission', 'dress', 'joining_total')),
  valid_from DATE,
  valid_until DATE,
  max_uses INTEGER,
  max_uses_per_phone INTEGER,
  notes TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admission_promo_codes_code_branch
  ON admission_promo_codes (code_key, COALESCE(branch_slug, '__all__'));

CREATE INDEX IF NOT EXISTS idx_admission_promo_codes_status_branch
  ON admission_promo_codes (status, branch_slug);

ALTER TABLE admission_promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_admission_promo_codes" ON admission_promo_codes;

CREATE POLICY "service_role_full_admission_promo_codes"
ON admission_promo_codes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

INSERT INTO admission_promo_codes (
  code,
  code_key,
  name,
  branch_slug,
  status,
  discount_type,
  discount_value,
  applies_to,
  notes
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
  'Reduces M P Sports Club admission payment from Rs. 2,500 to Rs. 1,500. Dress is ordered through Shop.'
WHERE NOT EXISTS (
  SELECT 1
  FROM admission_promo_codes
  WHERE code_key = 'EARLYBIRDMP'
    AND branch_slug = 'mp-sports-club'
);

CREATE TABLE IF NOT EXISTS admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_slug TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  preferred_batch TEXT,
  expected_join_date DATE,

  student_name TEXT NOT NULL,
  student_name_key TEXT NOT NULL,
  student_dob DATE NOT NULL,
  student_gender TEXT NOT NULL DEFAULT 'male'
    CHECK (student_gender IN ('male', 'female', 'other')),
  school_class TEXT,

  guardian_name TEXT NOT NULL,
  guardian_relationship TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  guardian_whatsapp TEXT,
  guardian_email TEXT,
  secondary_guardian_name TEXT,
  secondary_guardian_relationship TEXT,
  secondary_guardian_phone TEXT,

  emergency_name TEXT NOT NULL,
  emergency_relationship TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,

  has_medical_condition BOOLEAN NOT NULL DEFAULT false,
  medical_details TEXT,
  medications TEXT,
  special_requirements TEXT,

  has_previous_training BOOLEAN NOT NULL DEFAULT false,
  martial_arts_style TEXT,
  training_duration TEXT,
  previous_dojo TEXT,
  current_belt TEXT,
  training_notes TEXT,

  referral_source TEXT,
  referrer_name TEXT,
  referrer_contact TEXT,

  photo_consent BOOLEAN NOT NULL DEFAULT false,
  data_consent BOOLEAN NOT NULL DEFAULT false,
  participation_consent BOOLEAN NOT NULL DEFAULT false,
  accuracy_consent BOOLEAN NOT NULL DEFAULT false,
  consent_given_at TIMESTAMPTZ,

  promo_code_id UUID REFERENCES admission_promo_codes(id) ON DELETE SET NULL,
  promo_code TEXT,
  promo_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  quoted_monthly_fee NUMERIC NOT NULL DEFAULT 0,
  quoted_admission_fee NUMERIC NOT NULL DEFAULT 0,
  quoted_dress_fee NUMERIC NOT NULL DEFAULT 0,
  quoted_joining_total NUMERIC NOT NULL DEFAULT 0,

  parent_photo_drive_file_id TEXT,
  parent_photo_drive_url TEXT,
  parent_photo_filename TEXT,
  parent_photo_mime_type TEXT,
  parent_photo_size INTEGER,

  duplicate_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note TEXT,
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  approved_skf_id TEXT,
  final_photo_url TEXT,
  fee_setup JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admission_applications_status_branch
  ON admission_applications (status, branch_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admission_applications_student_match
  ON admission_applications (student_name_key, student_dob);

CREATE INDEX IF NOT EXISTS idx_admission_applications_guardian_phone
  ON admission_applications (guardian_phone);

ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_admission_applications" ON admission_applications;

CREATE POLICY "service_role_full_admission_applications"
ON admission_applications
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS admission_promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES admission_promo_codes(id) ON DELETE CASCADE,
  application_id UUID REFERENCES admission_applications(id) ON DELETE SET NULL,
  skf_id TEXT,
  branch_slug TEXT NOT NULL,
  guardian_phone TEXT,
  discount_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admission_promo_redemptions_code
  ON admission_promo_redemptions (promo_code_id, redeemed_at DESC);

CREATE INDEX IF NOT EXISTS idx_admission_promo_redemptions_phone
  ON admission_promo_redemptions (promo_code_id, guardian_phone);

ALTER TABLE admission_promo_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_admission_promo_redemptions" ON admission_promo_redemptions;

CREATE POLICY "service_role_full_admission_promo_redemptions"
ON admission_promo_redemptions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

INSERT INTO storage.buckets (
  id,
  name,
  public,
  allowed_mime_types
)
VALUES (
  'athlete-profile-photos',
  'athlete-profile-photos',
  true,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "service_role_full_athlete_profile_photos_storage" ON storage.objects;

CREATE POLICY "service_role_full_athlete_profile_photos_storage"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'athlete-profile-photos')
WITH CHECK (bucket_id = 'athlete-profile-photos');

INSERT INTO storage.buckets (
  id,
  name,
  public,
  allowed_mime_types
)
VALUES (
  'admission-photos',
  'admission-photos',
  false,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "service_role_full_admission_photos_storage" ON storage.objects;

CREATE POLICY "service_role_full_admission_photos_storage"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'admission-photos')
WITH CHECK (bucket_id = 'admission-photos');
