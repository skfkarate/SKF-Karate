CREATE TABLE IF NOT EXISTS certificates (
  enrollment_id UUID PRIMARY KEY REFERENCES enrollments(id) ON DELETE CASCADE,
  skf_id TEXT NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verification_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex')
);

CREATE INDEX IF NOT EXISTS idx_certificates_skf_id ON certificates(skf_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_certificates" ON certificates;

CREATE POLICY "service_role_full_certificates" ON certificates
  FOR ALL USING (auth.role() = 'service_role');
