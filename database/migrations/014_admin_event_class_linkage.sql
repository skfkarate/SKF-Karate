-- Keeps admin Events, Classes, and Event Categories in sync with database/schema.sql.
-- Safe to run repeatedly on existing Supabase projects.

CREATE TABLE IF NOT EXISTS public.class_cities (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Karnataka',
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.senseis (
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
  achievements JSONB DEFAULT '[]'::jsonb,
  quote TEXT DEFAULT '',
  image_url TEXT,
  accent_color TEXT NOT NULL DEFAULT 'gold',
  is_founder BOOLEAN DEFAULT false,
  is_executive_committee BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_assignable BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.senseis
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS dan TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT DEFAULT 'Karate Instruction',
  ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS full_bio TEXT,
  ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quote TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'gold',
  ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_executive_committee BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_assignable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.class_branches (
  slug TEXT PRIMARY KEY,
  city_slug TEXT NOT NULL REFERENCES public.class_cities(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  name TEXT NOT NULL,
  is_hq BOOLEAN DEFAULT false,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  sensei TEXT NOT NULL,
  sensei_dan TEXT NOT NULL,
  class_days JSONB DEFAULT '[]'::jsonb,
  class_time TEXT NOT NULL,
  map_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.class_branches
  ADD COLUMN IF NOT EXISTS lead_sensei_id TEXT REFERENCES public.senseis(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS class_days JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS map_url TEXT,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.class_schools (
  id TEXT PRIMARY KEY,
  city_slug TEXT NOT NULL REFERENCES public.class_cities(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tournaments (
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
  medals JSONB DEFAULT '{"gold":0,"silver":0,"bronze":0}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  show_in_journey BOOLEAN DEFAULT false,
  results_applied_at TIMESTAMPTZ,
  participants JSONB DEFAULT '[]'::jsonb,
  winners JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS short_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS level TEXT,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS venue TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS affiliated_body TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_results_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_journey BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hosting_branch TEXT,
  ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS results_applied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS show_in_journey BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.event_categories (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_branches_city ON public.class_branches(city_slug, sort_order);
CREATE INDEX IF NOT EXISTS idx_class_branches_sensei ON public.class_branches(lead_sensei_id, city_slug, sort_order);
CREATE INDEX IF NOT EXISTS idx_class_schools_city ON public.class_schools(city_slug, sort_order);
CREATE INDEX IF NOT EXISTS idx_senseis_public ON public.senseis(is_public, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_senseis_assignable ON public.senseis(is_assignable, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

ALTER TABLE public.class_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senseis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'class_cities'
      AND policyname = 'service_role_full_class_cities'
  ) THEN
    CREATE POLICY "service_role_full_class_cities" ON public.class_cities
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'senseis'
      AND policyname = 'service_role_full_senseis'
  ) THEN
    CREATE POLICY "service_role_full_senseis" ON public.senseis
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'class_branches'
      AND policyname = 'service_role_full_class_branches'
  ) THEN
    CREATE POLICY "service_role_full_class_branches" ON public.class_branches
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'class_schools'
      AND policyname = 'service_role_full_class_schools'
  ) THEN
    CREATE POLICY "service_role_full_class_schools" ON public.class_schools
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'events'
      AND policyname = 'public_read_published_events'
  ) THEN
    CREATE POLICY "public_read_published_events" ON public.events
      FOR SELECT USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'events'
      AND policyname = 'service_role_full_events'
  ) THEN
    CREATE POLICY "service_role_full_events" ON public.events
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'event_categories'
      AND policyname = 'service_role_full_event_categories'
  ) THEN
    CREATE POLICY "service_role_full_event_categories" ON public.event_categories
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tournaments'
      AND policyname = 'public_read_published_tournaments'
  ) THEN
    CREATE POLICY "public_read_published_tournaments" ON public.tournaments
      FOR SELECT USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tournaments'
      AND policyname = 'service_role_full_tournaments'
  ) THEN
    CREATE POLICY "service_role_full_tournaments" ON public.tournaments
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
