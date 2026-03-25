-- SKF Karate Database Architecture (Supabase / PostgreSQL)
-- Run this entire script in your Supabase SQL Editor to set up the backend.

-- 1. EXTENSIONS
-- Required for generating random UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Table 1: auth_sessions (Student PIN authentication tracking)
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: programs (Certificate programs like Exams and Tournaments)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('camp','belt_exam','training','tournament')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: certificate_templates (Canvas mapping templates for programs)
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  belt_level TEXT,
  template_image_url TEXT NOT NULL,
  fields JSONB NOT NULL,
  use_qr_code BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: enrollments (Track who completed what program)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  belt_level TEXT,
  status TEXT CHECK (status IN ('enrolled','completed','revoked')) DEFAULT 'enrolled',
  completion_date DATE,
  issuer_name TEXT,
  certificate_unlocked BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 5: certificate_events (Analytics & audit log for downloads/views)
CREATE TABLE certificate_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT NOT NULL,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('viewed','downloaded_pdf','downloaded_png','verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 6: otp_attempts (Future placeholder for Phase 6 SMS/WhatsApp login)
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 7: video_progress (Track how much of a practice video a student has watched)
CREATE TABLE video_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skf_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  progress_percent INTEGER DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(skf_id, video_id)
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- auth_sessions: Only authenticated admin or service_role can read/write pins
CREATE POLICY "admin_auth_all" ON auth_sessions USING (auth.role() = 'service_role');

-- programs: Public can read active programs, admin can write
CREATE POLICY "public_programs_read" ON programs FOR SELECT USING (is_active = true);
CREATE POLICY "admin_programs_all" ON programs USING (auth.role() = 'service_role');

-- certificate_templates: Public can read, admin can write
CREATE POLICY "public_templates_read" ON certificate_templates FOR SELECT USING (true);
CREATE POLICY "admin_templates_all" ON certificate_templates USING (auth.role() = 'service_role');

-- enrollments: Public can read if unlocked and completed (for verification scanning).
-- Note: SKF ID is public info for verification purposes, no PII is stored here.
CREATE POLICY "public_completed_enrollments" ON enrollments FOR SELECT 
  USING (certificate_unlocked = true AND status = 'completed');
CREATE POLICY "admin_enrollments_all" ON enrollments USING (auth.role() = 'service_role');

-- certificate_events: Anyone can insert (triggered by anon client on download click)
CREATE POLICY "public_event_insert" ON certificate_events FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_events_all" ON certificate_events USING (auth.role() = 'service_role');

-- video_progress: Students can upsert their own progress via API route holding service_role
CREATE POLICY "service_role_video_progress" ON video_progress USING (auth.role() = 'service_role');

-- 4. REALTIME SETUP (Optional but useful for admin dashboard)
alter publication supabase_realtime add table enrollments;
