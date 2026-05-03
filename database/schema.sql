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

ALTER TABLE otp_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_otp_attempts" ON otp_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 3: Programs & Certificates
-- NOTE: programs.type is for CERTIFICATE PROGRAMS only.
-- It is NOT the same as calendar event types.
-- Calendar event types: tournament|seminar|belt-exam|grading|camp|fun
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
CREATE POLICY "service_role_full_cert_events" ON certificate_events
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 3B: Website Analytics
-- First-party operational analytics for visits, lead failures,
-- portal login failures, and traffic intelligence.
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'page_view',
      'lead_submit_success',
      'lead_submit_failed',
      'portal_login_success',
      'portal_login_failed'
    )
  ),
  path TEXT,
  page_title TEXT,
  referrer TEXT,
  visitor_id TEXT,
  session_id TEXT,
  skf_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_analytics_created_at
  ON site_analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_type
  ON site_analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_site_analytics_path
  ON site_analytics_events (path);
CREATE INDEX IF NOT EXISTS idx_site_analytics_session_id
  ON site_analytics_events (session_id);

ALTER TABLE site_analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_site_analytics_events" ON site_analytics_events
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 4: Blog Content
-- Public karate guide blocks managed from /admin/blogs.
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Karate',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'SKF Karate',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  read_minutes INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 999,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_sort
  ON blog_posts(status, sort_order, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
  ON blog_posts(is_featured, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON blog_posts(category);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_published_blog_posts" ON blog_posts
  FOR SELECT USING (status = 'published');
CREATE POLICY "service_role_full_blog_posts" ON blog_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 5: Athlete Profiles & Search
-- Powers the public athlete pages, rankings, honours board, and
-- the mirrored admin-athlete records that must survive deployment.
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS athletes (
  id TEXT PRIMARY KEY,
  skf_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL DEFAULT 'male'
    CHECK (gender IN ('male', 'female', 'other')),
  photo_url TEXT,
  branch_name TEXT NOT NULL,
  current_belt TEXT NOT NULL,
  join_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'alumni')),
  parent_name TEXT,
  phone TEXT,
  email TEXT,
  batch TEXT,
  monthly_fee NUMERIC DEFAULT 0,
  photo_consent BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  achievements JSONB DEFAULT '[]',
  points_history JSONB DEFAULT '[]',
  points_balance NUMERIC DEFAULT 0,
  points_lifetime NUMERIC DEFAULT 0,
  attendance_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athletes_skf_id ON athletes(skf_id);
CREATE INDEX IF NOT EXISTS idx_athletes_branch_status ON athletes(branch_name, status);
CREATE INDEX IF NOT EXISTS idx_athletes_public ON athletes(is_public, is_featured);

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_athletes" ON athletes
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS batch TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS photo_consent BOOLEAN DEFAULT false;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS ranking_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_key TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'manual',
  source_type TEXT,
  source_id TEXT,
  category_key TEXT NOT NULL DEFAULT 'general',
  athlete_id TEXT NOT NULL,
  skf_id TEXT NOT NULL,
  athlete_name TEXT NOT NULL,
  branch_name TEXT,
  current_belt TEXT,
  overall_rank INTEGER NOT NULL,
  category_rank INTEGER NOT NULL,
  branch_rank INTEGER DEFAULT 0,
  total_points NUMERIC DEFAULT 0,
  gold_count INTEGER DEFAULT 0,
  silver_count INTEGER DEFAULT 0,
  bronze_count INTEGER DEFAULT 0,
  fight_win_count INTEGER DEFAULT 0,
  tournament_count INTEGER DEFAULT 0,
  total_medals INTEGER DEFAULT 0,
  previous_overall_rank INTEGER,
  previous_category_rank INTEGER,
  previous_branch_rank INTEGER,
  overall_rank_delta INTEGER,
  category_rank_delta INTEGER,
  branch_rank_delta INTEGER,
  overall_movement TEXT NOT NULL DEFAULT 'new'
    CHECK (overall_movement IN ('up', 'down', 'same', 'new')),
  category_movement TEXT NOT NULL DEFAULT 'new'
    CHECK (category_movement IN ('up', 'down', 'same', 'new')),
  branch_movement TEXT NOT NULL DEFAULT 'new'
    CHECK (branch_movement IN ('up', 'down', 'same', 'new')),
  ranking_category JSONB DEFAULT '{}'::jsonb,
  points_breakdown JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_key, category_key, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_created_at
  ON ranking_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_athlete
  ON ranking_snapshots(athlete_id, category_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_skf_id
  ON ranking_snapshots(skf_id, category_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_source
  ON ranking_snapshots(source_type, source_id, created_at DESC);

ALTER TABLE ranking_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_ranking_snapshots" ON ranking_snapshots
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 5: Classes, Cities & Training Centres
-- Powers the public classes pages and the admin classes management flow.
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS class_cities (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Karnataka',
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS senseis (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  dan TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'Karate Instruction',
  experience TEXT DEFAULT '',
  description TEXT NOT NULL,
  full_bio TEXT NOT NULL,
  achievements JSONB DEFAULT '[]',
  quote TEXT DEFAULT '',
  image_url TEXT,
  accent_color TEXT NOT NULL DEFAULT 'gold'
    CHECK (accent_color IN ('gold', 'crimson', 'blue', 'neutral')),
  is_founder BOOLEAN DEFAULT false,
  is_executive_committee BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_assignable BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_senseis_public ON senseis(is_public, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_senseis_assignable ON senseis(is_assignable, is_active, sort_order);

CREATE TABLE IF NOT EXISTS class_branches (
  slug TEXT PRIMARY KEY,
  city_slug TEXT NOT NULL REFERENCES class_cities(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  lead_sensei_id TEXT REFERENCES senseis(id) ON DELETE SET NULL ON UPDATE CASCADE,
  name TEXT NOT NULL,
  is_hq BOOLEAN DEFAULT false,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  sensei TEXT NOT NULL,
  sensei_dan TEXT NOT NULL,
  class_days JSONB DEFAULT '[]',
  class_time TEXT NOT NULL,
  map_url TEXT,
  photos JSONB DEFAULT '[]',
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE class_branches
  ADD COLUMN IF NOT EXISTS lead_sensei_id TEXT REFERENCES senseis(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_class_branches_city ON class_branches(city_slug, sort_order);
CREATE INDEX IF NOT EXISTS idx_class_branches_sensei ON class_branches(lead_sensei_id, city_slug, sort_order);

CREATE TABLE IF NOT EXISTS class_schools (
  id TEXT PRIMARY KEY,
  city_slug TEXT NOT NULL REFERENCES class_cities(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_schools_city ON class_schools(city_slug, sort_order);

ALTER TABLE class_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE senseis ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_class_cities" ON class_cities
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_senseis" ON senseis
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_class_branches" ON class_branches
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_full_class_schools" ON class_schools
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 6: Portal Features
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

CREATE TABLE IF NOT EXISTS fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'due'
    CHECK (status IN ('paid', 'due', 'overdue')),
  paid_date TIMESTAMPTZ,
  receipt_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (skf_id, month, year)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_records_receipt_id
  ON fee_records (receipt_id)
  WHERE receipt_id IS NOT NULL AND receipt_id <> '';

CREATE INDEX IF NOT EXISTS idx_fee_records_skf_year
  ON fee_records (skf_id, year);

CREATE INDEX IF NOT EXISTS idx_fee_records_status
  ON fee_records (status, year);

ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_fee_records" ON fee_records
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS portal_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'techniques',
  duration_label TEXT DEFAULT '',
  youtube_id TEXT NOT NULL CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  branch_slugs JSONB DEFAULT '[]',
  batch_names JSONB DEFAULT '[]',
  belt_levels JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  show_in_techniques BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portal_videos
  ADD COLUMN IF NOT EXISTS show_in_techniques BOOLEAN DEFAULT false;

ALTER TABLE portal_videos
  ADD COLUMN IF NOT EXISTS youtube_id TEXT;

ALTER TABLE portal_videos
  ALTER COLUMN youtube_id SET NOT NULL;

ALTER TABLE portal_videos
  DROP CONSTRAINT IF EXISTS portal_videos_youtube_id_format;

ALTER TABLE portal_videos
  ADD CONSTRAINT portal_videos_youtube_id_format
  CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$');

ALTER TABLE portal_videos
  DROP COLUMN IF EXISTS provider,
  DROP COLUMN IF EXISTS source_url,
  DROP COLUMN IF EXISTS playback_url,
  DROP COLUMN IF EXISTS thumbnail_url;

CREATE INDEX IF NOT EXISTS idx_portal_videos_published
  ON portal_videos (is_published, is_featured, sort_order);

CREATE INDEX IF NOT EXISTS idx_portal_videos_youtube_id
  ON portal_videos (youtube_id);

ALTER TABLE portal_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_portal_videos" ON portal_videos
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS branch_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_slug TEXT NOT NULL REFERENCES class_branches(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  title TEXT NOT NULL DEFAULT 'Official Timetable',
  drive_url TEXT NOT NULL,
  image_url TEXT,
  month_label TEXT,
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branch_timetables_branch_active
  ON branch_timetables (branch_slug, is_active, effective_from DESC, created_at DESC);

ALTER TABLE branch_timetables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_branch_timetables" ON branch_timetables
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
-- SECTION 7: Events & Tournaments
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
  show_in_journey BOOLEAN DEFAULT false,
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
  show_in_journey BOOLEAN DEFAULT false,
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
-- SECTION 8: Points & Rewards
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
-- SECTION 9: Notifications
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
-- SECTION 10: Leads
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
-- SECTION 11: Event Categories
-- Stores admin-created event type options so event forms are not backed
-- by local JSON files in production.
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS event_categories (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_event_categories" ON event_categories
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════
-- SECTION 12: Shop Products (E-Commerce)
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
  FOR SELECT USING (is_public = true);
CREATE POLICY "service_role_full_products" ON skf_products
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS skf_shop_orders (
  order_id TEXT PRIMARY KEY,
  skf_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('athlete', 'guest')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  points_used INTEGER NOT NULL DEFAULT 0,
  promo_code TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (
    status IN (
      'processing',
      'payment-pending',
      'pending-approval',
      'approved',
      'shipped',
      'delivered',
      'cancelled'
    )
  ),
  fulfillment_method TEXT NOT NULL DEFAULT 'shipping' CHECK (
    fulfillment_method IN ('shipping', 'dojo-pickup')
  ),
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skf_shop_orders_customer ON skf_shop_orders(skf_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skf_shop_orders_status ON skf_shop_orders(status, created_at DESC);

ALTER TABLE skf_shop_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_shop_orders" ON skf_shop_orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION place_shop_order(
  p_order_id TEXT,
  p_skf_id TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_type TEXT,
  p_items JSONB,
  p_subtotal INTEGER,
  p_shipping_fee INTEGER,
  p_total INTEGER,
  p_discount INTEGER,
  p_points_used INTEGER,
  p_promo_code TEXT,
  p_status TEXT,
  p_fulfillment_method TEXT,
  p_address JSONB
)
RETURNS skf_shop_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_item JSONB;
  current_product RECORD;
  current_variant JSONB;
  next_variants JSONB;
  variant_found BOOLEAN;
  requested_quantity INTEGER;
  created_order skf_shop_orders;
BEGIN
  FOR requested_item IN
    SELECT value FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb))
  LOOP
    requested_quantity := COALESCE((requested_item->>'quantity')::INTEGER, 0);

    IF requested_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity supplied for shop order.';
    END IF;

    SELECT id, variants
    INTO current_product
    FROM skf_products
    WHERE id = requested_item->>'productId'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Shop product % was not found.', requested_item->>'productId';
    END IF;

    next_variants := '[]'::jsonb;
    variant_found := FALSE;

    FOR current_variant IN
      SELECT value FROM jsonb_array_elements(COALESCE(current_product.variants, '[]'::jsonb))
    LOOP
      IF current_variant->>'id' = requested_item->>'variantId' THEN
        variant_found := TRUE;

        IF COALESCE((current_variant->>'stock')::INTEGER, 0) < requested_quantity THEN
          RAISE EXCEPTION 'Insufficient stock for variant %.', requested_item->>'variantId';
        END IF;

        current_variant := jsonb_set(
          current_variant,
          '{stock}',
          to_jsonb(COALESCE((current_variant->>'stock')::INTEGER, 0) - requested_quantity)
        );
      END IF;

      next_variants := next_variants || jsonb_build_array(current_variant);
    END LOOP;

    IF NOT variant_found THEN
      RAISE EXCEPTION 'Shop variant % was not found.', requested_item->>'variantId';
    END IF;

    UPDATE skf_products
    SET
      variants = next_variants,
      updated_at = NOW()
    WHERE id = current_product.id;
  END LOOP;

  INSERT INTO skf_shop_orders (
    order_id,
    skf_id,
    customer_name,
    customer_phone,
    customer_type,
    items,
    subtotal,
    shipping_fee,
    total,
    discount,
    points_used,
    promo_code,
    status,
    fulfillment_method,
    address,
    created_at,
    updated_at
  ) VALUES (
    p_order_id,
    NULLIF(p_skf_id, ''),
    p_customer_name,
    p_customer_phone,
    p_customer_type,
    COALESCE(p_items, '[]'::jsonb),
    COALESCE(p_subtotal, 0),
    COALESCE(p_shipping_fee, 0),
    COALESCE(p_total, 0),
    COALESCE(p_discount, 0),
    COALESCE(p_points_used, 0),
    NULLIF(p_promo_code, ''),
    p_status,
    p_fulfillment_method,
    COALESCE(p_address, '{}'::jsonb),
    NOW(),
    NOW()
  )
  RETURNING * INTO created_order;

  RETURN created_order;
END;
$$;

REVOKE EXECUTE ON FUNCTION place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) FROM anon;
REVOKE EXECUTE ON FUNCTION place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) FROM authenticated;
GRANT EXECUTE ON FUNCTION place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) TO service_role;
