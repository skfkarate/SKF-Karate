-- ⚠️ DEPRECATED: Use /database/schema.sql instead.
-- This file is kept for reference only. Do not modify.
-- 1. auth_sessions
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. programs
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('camp','belt_exam','training','tournament')),
  branch TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. certificate_templates
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  belt_level TEXT,
  template_image_url TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  use_qr_code BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  program_id UUID REFERENCES programs(id),
  belt_level TEXT,
  status TEXT CHECK (status IN ('enrolled','completed','revoked')) DEFAULT 'enrolled',
  completion_date DATE,
  issuer_name TEXT,
  certificate_unlocked BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. certificate_events (audit + analytics)
CREATE TABLE certificate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  enrollment_id UUID REFERENCES enrollments(id),
  event_type TEXT CHECK (event_type IN ('viewed','downloaded_pdf','downloaded_png','verified')),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. video_progress
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  watched_percent INTEGER DEFAULT 0 CHECK (watched_percent BETWEEN 0 AND 100),
  completed BOOLEAN DEFAULT false,
  last_watched TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skf_id, video_id)
);

-- 7. push_subscriptions (for Phase 6 web push)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  branch TEXT,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skf_id)
);

-- 8. otp_attempts (future placeholder)
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Programs: anyone can read active ones
CREATE POLICY "public_read_programs" ON programs FOR SELECT USING (is_active = true);

-- Enrollments: public can only read completed + unlocked (for certificate verification)
CREATE POLICY "public_completed_certs" ON enrollments FOR SELECT
  USING (certificate_unlocked = true AND status = 'completed');

-- All other access goes through service_role (our server API routes) — no other policies needed
-- Server uses supabaseAdmin (service_role) which bypasses RLS
