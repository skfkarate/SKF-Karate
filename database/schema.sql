-- ══════════════════════════════════════
-- SKF KARATE — Complete Supabase Schema
-- Run this in Supabase SQL Editor
-- This is the ONE authoritative SQL file.
-- ══════════════════════════════════════

-- SECTION 1: Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════
-- SECTION 2: Auth & Sessions
-- ══════════════════════════════════════

-- NOTE: Portal auth uses SKF ID + Date of Birth (not PIN).
-- This table is retained for future OTP or session tracking.
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT,                    -- DEPRECATED: PIN auth removed. Retained for migration safety.
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
-- SECTION 3: Programs & Certificates
-- NOTE: programs.type is for CERTIFICATE PROGRAMS only.
-- It is NOT the same as calendar event types.
-- Calendar event types: tournament|seminar|pelt-exam|grading|camp|fun
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('camp', 'belt_exam', 'training', 'tournament')),
  branch TEXT,
  has_belt_subtypes BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_active_programs" ON programs
  FOR SELECT USING (is_active = true);
CREATE POLICY "service_role_full_programs" ON programs
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  belt_level TEXT,
  template_image_url TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  use_qr_code BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_program_belt
  ON certificate_templates (program_id, COALESCE(belt_level, '__NULL__'));

ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_templates" ON certificate_templates
  FOR SELECT USING (true);
CREATE POLICY "service_role_full_templates" ON certificate_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT NOT NULL,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  belt_level TEXT,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'revoked')),
  completion_date DATE,
  issuer_name TEXT,
  certificate_unlocked BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollment_skf_id ON enrollments (skf_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_program ON enrollments (program_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON enrollments (status);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_unlocked_enrollments" ON enrollments
  FOR SELECT USING (certificate_unlocked = true AND status = 'completed');
CREATE POLICY "service_role_full_enrollments" ON enrollments
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS certificate_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  downloaded_at TIMESTAMPTZ,
  download_format TEXT CHECK (download_format IS NULL OR download_format IN ('pdf', 'png'))
);

CREATE INDEX IF NOT EXISTS idx_cert_views_skf ON certificate_views (skf_id);
CREATE INDEX IF NOT EXISTS idx_cert_views_date ON certificate_views (viewed_at);

ALTER TABLE certificate_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_views" ON certificate_views
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS certificate_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  skf_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('viewed', 'downloaded_pdf', 'downloaded_png', 'verified', 'shared')),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_events_skf ON certificate_events (skf_id);

ALTER TABLE certificate_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_insert_cert_events" ON certificate_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "service_role_full_cert_events" ON certificate_events
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 4: Portal Features
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  watched_percent INTEGER DEFAULT 0 CHECK (watched_percent BETWEEN 0 AND 100),
  completed BOOLEAN DEFAULT false,
  last_watched TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skf_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_progress_skf ON video_progress (skf_id);

ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_video_progress" ON video_progress
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  branch TEXT,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skf_id)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_push_subs" ON push_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 5: Events & Tournaments
-- These replace the .data/*.json file-based storage
-- which silently fails on Vercel (read-only filesystem).
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  level TEXT,
  date DATE NOT NULL,
  end_date DATE,
  venue TEXT,
  city TEXT,
  state TEXT DEFAULT 'Karnataka',
  description TEXT,
  cover_image_url TEXT,
  affiliated_body TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_results_published BOOLEAN DEFAULT false,
  hosting_branch TEXT,
  participants JSONB DEFAULT '[]',
  results JSONB DEFAULT '[]',
  results_applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_published_events" ON events
  FOR SELECT USING (is_published = true);
CREATE POLICY "service_role_full_events" ON events
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  level TEXT NOT NULL DEFAULT 'district',
  date DATE NOT NULL,
  end_date DATE,
  venue TEXT,
  city TEXT,
  state TEXT DEFAULT 'Karnataka',
  description TEXT,
  cover_image_url TEXT,
  affiliated_body TEXT,
  total_participants INTEGER DEFAULT 0,
  skf_participants INTEGER DEFAULT 0,
  medals JSONB DEFAULT '{"gold":0,"silver":0,"bronze":0}',
  status TEXT NOT NULL DEFAULT 'draft',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  results_applied_at TIMESTAMPTZ,
  participants JSONB DEFAULT '[]',
  winners JSONB DEFAULT '[]',
  results JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_slug ON tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date DESC);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_published_tournaments" ON tournaments
  FOR SELECT USING (is_published = true);
CREATE POLICY "service_role_full_tournaments" ON tournaments
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 6: Points & Rewards
-- Used by lib/points/pointsService.ts
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS student_points (
  skf_id TEXT PRIMARY KEY,
  current_balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  tier TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EARN', 'REDEEM')),
  reason TEXT NOT NULL,
  points INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_tx_skf ON point_transactions(skf_id);
CREATE INDEX IF NOT EXISTS idx_point_tx_date ON point_transactions(created_at DESC);

ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_student_points" ON student_points
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_point_tx" ON point_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 7: Notifications
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  reference_id TEXT,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_skf ON notifications(skf_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 8: Leads
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  branch TEXT,
  source TEXT DEFAULT 'website'
    CHECK (source IN ('website', 'whatsapp', 'referral', 'walk-in')),
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, branch);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 9: Shop Products (E-Commerce)
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS skf_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('uniforms', 'belts', 'gear', 'merchandise')),
  price INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]', -- Array of image URLs
  variants JSONB DEFAULT '[]', -- Array of { id, size, stock, requiresApproval }
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  requires_belt TEXT, -- Optional: 'Yellow', 'Brown', 'Black', etc.
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE skf_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_products" ON skf_products
  FOR SELECT USING (true);
CREATE POLICY "service_role_full_products" ON skf_products
  FOR ALL USING (auth.role() = 'service_role');
