-- =======================================================
-- SKF Karate Certificate System — Supabase Schema
-- =======================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- This creates all tables required for the certificate system.
-- =======================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- TABLE: programs
-- Stores certificate program categories
-- =======================================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('camp', 'belt_exam', 'training', 'tournament')),
  branch TEXT,
  has_belt_subtypes BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================  
-- TABLE: certificate_templates
-- Stores template images and field coordinate configurations
-- =======================================================
CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  belt_level TEXT,  -- NULL for non-belt programs. 'white'|'yellow'|'orange'|'green'|'blue'|'brown'|'black'
  template_image_url TEXT NOT NULL,
  fields JSONB DEFAULT '[]'::jsonb,
  use_qr_code BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one template per program+belt combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_template_program_belt 
  ON certificate_templates (program_id, COALESCE(belt_level, '__NULL__'));

-- =======================================================
-- TABLE: enrollments
-- Links students (by SKF ID) to programs
-- =======================================================
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

-- Index for fast lookups by SKF ID
CREATE INDEX IF NOT EXISTS idx_enrollment_skf_id ON enrollments (skf_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_program ON enrollments (program_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON enrollments (status);

-- =======================================================
-- TABLE: certificate_views
-- Tracks certificate view and download events for analytics
-- =======================================================
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

-- =======================================================
-- TABLE: certificate_events (optional — detailed telemetry)
-- Logs every certificate interaction for detailed tracking
-- =======================================================
CREATE TABLE IF NOT EXISTS certificate_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL,
  skf_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'viewed', 'downloaded_pdf', 'downloaded_png', 'shared'
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_events_skf ON certificate_events (skf_id);

-- =======================================================
-- ROW LEVEL SECURITY (RLS)
-- =======================================================

-- Enable RLS on all tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_events ENABLE ROW LEVEL SECURITY;

-- Programs: Public can read active programs
CREATE POLICY "Public can read active programs" ON programs
  FOR SELECT USING (is_active = true);

-- Programs: Service role has full access (admin via API)
CREATE POLICY "Service role full access on programs" ON programs
  FOR ALL USING (auth.role() = 'service_role');

-- Templates: Public can read (needed for certificate rendering)
CREATE POLICY "Public can read templates" ON certificate_templates
  FOR SELECT USING (true);

-- Templates: Service role has full access
CREATE POLICY "Service role full access on templates" ON certificate_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Enrollments: Public can read completed & unlocked ones only
CREATE POLICY "Public can read unlocked enrollments" ON enrollments
  FOR SELECT USING (certificate_unlocked = true AND status = 'completed');

-- Enrollments: Service role has full access
CREATE POLICY "Service role full access on enrollments" ON enrollments
  FOR ALL USING (auth.role() = 'service_role');

-- Certificate views: Service role only
CREATE POLICY "Service role full access on views" ON certificate_views
  FOR ALL USING (auth.role() = 'service_role');

-- Certificate events: Service role only (write), public can insert
CREATE POLICY "Anyone can insert events" ON certificate_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access on events" ON certificate_events
  FOR ALL USING (auth.role() = 'service_role');

-- =======================================================
-- SEED DATA (Optional — for testing)
-- Remove these in production
-- =======================================================

-- INSERT INTO programs (name, type, has_belt_subtypes, is_active)
-- VALUES 
--   ('Yellow Belt Exam 2025', 'belt_exam', true, true),
--   ('Summer Camp 2025', 'camp', false, true),
--   ('State Championship 2025', 'tournament', false, true);
