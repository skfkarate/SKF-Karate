-- Canonical certificate registry.
-- Keeps enrollments as the completion workflow, while certificates become the
-- permanent public verification records shown on QR scans.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SEQUENCE IF NOT EXISTS certificate_registration_seq START 1;

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS certificate_serial BIGINT,
  ADD COLUMN IF NOT EXISTS certificate_number TEXT,
  ADD COLUMN IF NOT EXISTS certificate_type TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'issued',
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES certificate_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS issued_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS render_hash TEXT,
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS preview_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_reason TEXT;

ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificates_status_check;

ALTER TABLE certificates
  ADD CONSTRAINT certificates_status_check
  CHECK (status IN ('draft', 'issued', 'revoked'));

UPDATE certificates
SET certificate_serial = nextval('certificate_registration_seq')
WHERE certificate_serial IS NULL;

DO $$
DECLARE
  max_serial BIGINT;
BEGIN
  SELECT MAX(certificate_serial) INTO max_serial FROM certificates;

  IF max_serial IS NOT NULL THEN
    PERFORM setval('certificate_registration_seq', max_serial, true);
  ELSE
    PERFORM setval('certificate_registration_seq', 1, false);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION assign_certificate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_serial IS NULL THEN
    NEW.certificate_serial := nextval('certificate_registration_seq');
  END IF;

  IF NEW.certificate_number IS NULL OR btrim(NEW.certificate_number) = '' THEN
    NEW.certificate_number := 'SKF-C-' || lpad(NEW.certificate_serial::text, 6, '0');
  END IF;

  IF NEW.verification_code IS NULL OR btrim(NEW.verification_code) = '' THEN
    NEW.verification_code := encode(gen_random_bytes(16), 'hex');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_certificate_registration_number ON certificates;

CREATE TRIGGER trg_assign_certificate_registration_number
BEFORE INSERT OR UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION assign_certificate_registration_number();

UPDATE certificates
SET certificate_number = 'SKF-C-' || lpad(certificate_serial::text, 6, '0')
WHERE certificate_number IS NULL OR btrim(certificate_number) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_serial ON certificates(certificate_serial);
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(certificate_type);

INSERT INTO certificates (
  enrollment_id,
  skf_id,
  program_id,
  certificate_type,
  status,
  issued_at
)
SELECT
  enrollments.id,
  enrollments.skf_id,
  enrollments.program_id,
  CASE
    WHEN lower(COALESCE(enrollments.belt_level, '')) LIKE '%dan%'
      OR lower(COALESCE(programs.name, '')) LIKE '%black belt%'
      OR lower(COALESCE(programs.name, '')) LIKE '%dan grading%'
      THEN 'black_belt_exam'
    WHEN programs.type = 'belt_exam' THEN 'belt_exam'
    WHEN programs.type = 'camp' THEN 'camp'
    WHEN lower(COALESCE(programs.name, '')) LIKE '%seminar%' THEN 'seminar'
    WHEN programs.type = 'tournament' THEN 'tournament'
    WHEN programs.type = 'training' THEN 'special_program'
    ELSE 'general'
  END,
  'issued',
  COALESCE(enrollments.updated_at, NOW())
FROM enrollments
LEFT JOIN programs ON programs.id = enrollments.program_id
WHERE enrollments.status = 'completed'
  AND enrollments.certificate_unlocked = true
ON CONFLICT (enrollment_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS certificate_template_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  belt_level TEXT NOT NULL,
  template_id UUID NOT NULL REFERENCES certificate_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, belt_level)
);

CREATE INDEX IF NOT EXISTS idx_cert_template_assignments_program
  ON certificate_template_assignments(program_id);

ALTER TABLE certificate_template_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_certificate_template_assignments" ON certificate_template_assignments;

CREATE POLICY "service_role_full_certificate_template_assignments" ON certificate_template_assignments
  FOR ALL USING (auth.role() = 'service_role');
