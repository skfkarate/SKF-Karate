-- SKF Karate Supabase repair bundle
-- Generated for paste into Supabase SQL Editor if another environment still has pending objects.
-- The current configured Supabase project was rechecked and has no pending schema items.
-- If you run this anyway, it is written to be repeat-safe where existing-policy conflicts were known.
-- Source directory: /home/krish/SKF Karate/website/SKF-Karate/database/migrations

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 004_atomic_points_rpc.sql
-- ============================================================

-- Atomic points mutations.
-- Apply this migration before deploying lib/points/pointsService.ts changes.

CREATE OR REPLACE FUNCTION public.skf_points_tier(p_total_earned INTEGER)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_total_earned >= 40000 THEN 'black'
    WHEN p_total_earned >= 20000 THEN 'brown'
    WHEN p_total_earned >= 10000 THEN 'blue'
    WHEN p_total_earned >= 5000 THEN 'green'
    WHEN p_total_earned >= 2500 THEN 'orange'
    WHEN p_total_earned >= 1000 THEN 'yellow'
    ELSE 'white'
  END;
$$;

CREATE OR REPLACE FUNCTION public.award_points(
  p_skf_id TEXT,
  p_reason TEXT,
  p_points INTEGER,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_total_earned INTEGER;
  v_new_balance INTEGER;
  v_new_total_earned INTEGER;
  v_new_tier TEXT;
BEGIN
  IF p_skf_id IS NULL OR btrim(p_skf_id) = '' THEN
    RAISE EXCEPTION 'SKF_ID_REQUIRED';
  END IF;

  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'POINTS_MUST_BE_POSITIVE';
  END IF;

  INSERT INTO student_points (skf_id, current_balance, total_earned, total_redeemed, tier)
  VALUES (upper(btrim(p_skf_id)), 0, 0, 0, 'white')
  ON CONFLICT (skf_id) DO NOTHING;

  SELECT current_balance, total_earned
  INTO v_current_balance, v_total_earned
  FROM student_points
  WHERE skf_id = upper(btrim(p_skf_id))
  FOR UPDATE;

  v_new_balance := COALESCE(v_current_balance, 0) + p_points;
  v_new_total_earned := COALESCE(v_total_earned, 0) + p_points;
  v_new_tier := skf_points_tier(v_new_total_earned);

  INSERT INTO point_transactions (
    skf_id,
    type,
    reason,
    points,
    balance_before,
    balance_after,
    metadata
  )
  VALUES (
    upper(btrim(p_skf_id)),
    'EARN',
    p_reason,
    p_points,
    COALESCE(v_current_balance, 0),
    v_new_balance,
    COALESCE(p_metadata, '{}'::JSONB)
  );

  UPDATE student_points
  SET
    current_balance = v_new_balance,
    total_earned = v_new_total_earned,
    tier = v_new_tier,
    updated_at = NOW()
  WHERE skf_id = upper(btrim(p_skf_id));

  RETURN jsonb_build_object(
    'new_balance', v_new_balance,
    'points_awarded', p_points,
    'tier', v_new_tier
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_points(
  p_skf_id TEXT,
  p_reason TEXT,
  p_points INTEGER,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_total_redeemed INTEGER;
  v_new_balance INTEGER;
BEGIN
  IF p_skf_id IS NULL OR btrim(p_skf_id) = '' THEN
    RAISE EXCEPTION 'SKF_ID_REQUIRED';
  END IF;

  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'POINTS_MUST_BE_POSITIVE';
  END IF;

  SELECT current_balance, total_redeemed
  INTO v_current_balance, v_total_redeemed
  FROM student_points
  WHERE skf_id = upper(btrim(p_skf_id))
  FOR UPDATE;

  IF NOT FOUND OR COALESCE(v_current_balance, 0) < p_points THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  v_new_balance := COALESCE(v_current_balance, 0) - p_points;

  INSERT INTO point_transactions (
    skf_id,
    type,
    reason,
    points,
    balance_before,
    balance_after,
    metadata
  )
  VALUES (
    upper(btrim(p_skf_id)),
    'REDEEM',
    p_reason,
    -p_points,
    COALESCE(v_current_balance, 0),
    v_new_balance,
    COALESCE(p_metadata, '{}'::JSONB)
  );

  UPDATE student_points
  SET
    current_balance = v_new_balance,
    total_redeemed = COALESCE(v_total_redeemed, 0) + p_points,
    updated_at = NOW()
  WHERE skf_id = upper(btrim(p_skf_id));

  RETURN jsonb_build_object(
    'new_balance', v_new_balance,
    'points_redeemed', p_points
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.skf_points_tier(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_points(TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.redeem_points(TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.skf_points_tier(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_points(TEXT, TEXT, INTEGER, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.redeem_points(TEXT, TEXT, INTEGER, JSONB) TO service_role;


-- ============================================================
-- 005_certificates_lookup_table.sql
-- ============================================================

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


-- ============================================================
-- 006_add_athlete_data_consent.sql
-- ============================================================

-- Store parent/guardian data-processing consent for student records.
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;


-- ============================================================
-- 010_ranking_snapshots.sql
-- ============================================================

-- Persist ranking history so leaderboard movement is calculated from records,
-- not generated in the UI.

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

DROP POLICY IF EXISTS "service_role_full_ranking_snapshots" ON ranking_snapshots;

CREATE POLICY "service_role_full_ranking_snapshots" ON ranking_snapshots
  FOR ALL USING (auth.role() = 'service_role');


-- ============================================================
-- 011_rename_registration_number_to_skf_id.sql
-- ============================================================

-- Use SKF ID as the only athlete profile identifier.
-- Older deployments stored the same value as registration_number; this migrates
-- that column and normalizes common old formats into SKF{YY}{BRANCH}{NNN}.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'athletes'
      AND column_name = 'registration_number'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'athletes'
      AND column_name = 'skf_id'
  ) THEN
    ALTER TABLE public.athletes RENAME COLUMN registration_number TO skf_id;
  END IF;
END $$;

ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS skf_id TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'athletes'
      AND column_name = 'registration_number'
  ) THEN
    UPDATE public.athletes
    SET skf_id = COALESCE(NULLIF(BTRIM(skf_id), ''), registration_number)
    WHERE skf_id IS NULL OR BTRIM(skf_id) = '';

    ALTER TABLE public.athletes DROP COLUMN registration_number;
  END IF;
END $$;

WITH branch_first AS (
  SELECT
    id,
    REGEXP_MATCH(
      UPPER(REGEXP_REPLACE(skf_id, '[^A-Z0-9]', '', 'g')),
      '^([A-Z]{2})([0-9]{2})([0-9]{1,})$'
    ) AS parts
  FROM public.athletes
  WHERE skf_id IS NOT NULL
    AND UPPER(skf_id) !~ '^SKF'
)
UPDATE public.athletes AS athletes
SET skf_id = 'SKF' || branch_first.parts[2] || branch_first.parts[1] || LPAD((branch_first.parts[3])::INT::TEXT, 3, '0')
FROM branch_first
WHERE athletes.id = branch_first.id
  AND branch_first.parts IS NOT NULL;

WITH legacy_skf AS (
  SELECT
    id,
    branch_name,
    REGEXP_MATCH(
      UPPER(REGEXP_REPLACE(skf_id, '[^A-Z0-9]', '', 'g')),
      '^SKF([0-9]{4})([0-9]{1,})$'
    ) AS parts
  FROM public.athletes
  WHERE skf_id IS NOT NULL
)
UPDATE public.athletes AS athletes
SET skf_id =
  'SKF' ||
  RIGHT(legacy_skf.parts[1], 2) ||
  CASE
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%sunkadakatte%' THEN 'SK'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%rajajinagar%' THEN 'RJ'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%malleshwaram%' THEN 'ML'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%herohalli%' THEN 'HE'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%kunigal%' THEN 'KG'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%tumkur%' THEN 'TK'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%udupi%' THEN 'UD'
    ELSE 'MP'
  END ||
  LPAD((legacy_skf.parts[2])::INT::TEXT, 3, '0')
FROM legacy_skf
WHERE athletes.id = legacy_skf.id
  AND legacy_skf.parts IS NOT NULL;

UPDATE public.athletes
SET skf_id = id
WHERE skf_id IS NULL OR BTRIM(skf_id) = '';

DROP INDEX IF EXISTS public.idx_athletes_registration;
CREATE UNIQUE INDEX IF NOT EXISTS idx_athletes_skf_id_unique ON public.athletes(skf_id);
CREATE INDEX IF NOT EXISTS idx_athletes_skf_id ON public.athletes(skf_id);
ALTER TABLE public.athletes ALTER COLUMN skf_id SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ranking_snapshots'
      AND column_name = 'registration_number'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ranking_snapshots'
      AND column_name = 'skf_id'
  ) THEN
    ALTER TABLE public.ranking_snapshots RENAME COLUMN registration_number TO skf_id;
  END IF;
END $$;

ALTER TABLE public.ranking_snapshots ADD COLUMN IF NOT EXISTS skf_id TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ranking_snapshots'
      AND column_name = 'registration_number'
  ) THEN
    UPDATE public.ranking_snapshots
    SET skf_id = COALESCE(NULLIF(BTRIM(skf_id), ''), registration_number)
    WHERE skf_id IS NULL OR BTRIM(skf_id) = '';

    ALTER TABLE public.ranking_snapshots DROP COLUMN registration_number;
  END IF;
END $$;

WITH branch_first AS (
  SELECT
    id,
    REGEXP_MATCH(
      UPPER(REGEXP_REPLACE(skf_id, '[^A-Z0-9]', '', 'g')),
      '^([A-Z]{2})([0-9]{2})([0-9]{1,})$'
    ) AS parts
  FROM public.ranking_snapshots
  WHERE skf_id IS NOT NULL
    AND UPPER(skf_id) !~ '^SKF'
)
UPDATE public.ranking_snapshots AS snapshots
SET skf_id = 'SKF' || branch_first.parts[2] || branch_first.parts[1] || LPAD((branch_first.parts[3])::INT::TEXT, 3, '0')
FROM branch_first
WHERE snapshots.id = branch_first.id
  AND branch_first.parts IS NOT NULL;

WITH legacy_skf AS (
  SELECT
    id,
    branch_name,
    REGEXP_MATCH(
      UPPER(REGEXP_REPLACE(skf_id, '[^A-Z0-9]', '', 'g')),
      '^SKF([0-9]{4})([0-9]{1,})$'
    ) AS parts
  FROM public.ranking_snapshots
  WHERE skf_id IS NOT NULL
)
UPDATE public.ranking_snapshots AS snapshots
SET skf_id =
  'SKF' ||
  RIGHT(legacy_skf.parts[1], 2) ||
  CASE
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%sunkadakatte%' THEN 'SK'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%rajajinagar%' THEN 'RJ'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%malleshwaram%' THEN 'ML'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%herohalli%' THEN 'HE'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%kunigal%' THEN 'KG'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%tumkur%' THEN 'TK'
    WHEN LOWER(COALESCE(legacy_skf.branch_name, '')) LIKE '%udupi%' THEN 'UD'
    ELSE 'MP'
  END ||
  LPAD((legacy_skf.parts[2])::INT::TEXT, 3, '0')
FROM legacy_skf
WHERE snapshots.id = legacy_skf.id
  AND legacy_skf.parts IS NOT NULL;

UPDATE public.ranking_snapshots
SET skf_id = athlete_id
WHERE skf_id IS NULL OR BTRIM(skf_id) = '';

DROP INDEX IF EXISTS public.idx_ranking_snapshots_registration;
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_skf_id
  ON public.ranking_snapshots(skf_id, category_key, created_at DESC);
ALTER TABLE public.ranking_snapshots ALTER COLUMN skf_id SET NOT NULL;


-- ============================================================
-- 012_backfill_initial_white_belt_achievement.sql
-- ============================================================

-- Backfill the default white-belt history entry for existing athlete rows.
-- New and edited athletes are handled by the application repository layer.

UPDATE public.athletes
SET
  achievements =
    jsonb_build_array(
      jsonb_build_object(
        'id', 'ach_initial_white_belt',
        'type', 'enrollment',
        'date', join_date::text,
        'title', 'Joined SKF Karate',
        'description', 'Started SKF Karate as a White Belt.',
        'pointsAwarded', 50,
        'beltEarned', 'white',
        'grade', 'Enrollment',
        'result', 'pass',
        'awardedBy', 'SKF Karate',
        'location', COALESCE(NULLIF(branch_name, ''), 'SKF Karate')
      )
    ) ||
    CASE
      WHEN jsonb_typeof(achievements) = 'array' THEN achievements
      ELSE '[]'::jsonb
    END,
  updated_at = NOW()
WHERE join_date IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(athletes.achievements) = 'array' THEN athletes.achievements
        ELSE '[]'::jsonb
      END
    ) AS achievement
    WHERE achievement->>'id' = 'ach_initial_white_belt'
      OR (
        achievement->>'type' = 'enrollment'
        AND COALESCE(achievement->>'sourceEventId', '') = ''
        AND COALESCE(NULLIF(achievement->>'beltEarned', ''), 'white') = 'white'
      )
  );


-- ============================================================
-- 013_blog_posts.sql
-- ============================================================

-- Supabase-backed blog posts for the public /blog page and admin Blog Studio.
-- Initial article rows are seeded by the application repository when this table is empty.

CREATE TABLE IF NOT EXISTS public.blog_posts (
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
  ON public.blog_posts(status, sort_order, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
  ON public.blog_posts(is_featured, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON public.blog_posts(category);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_blog_posts" ON public.blog_posts;

CREATE POLICY "public_read_published_blog_posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "service_role_full_blog_posts" ON public.blog_posts;

CREATE POLICY "service_role_full_blog_posts" ON public.blog_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 014_admin_event_class_linkage.sql
-- ============================================================

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


-- ============================================================
-- 016_fee_receipts_and_atomic_operations.sql
-- ============================================================

-- Immutable fee receipts and atomic fee operations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE fee_records
  ADD COLUMN IF NOT EXISTS fee_type TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE fee_records
  DROP CONSTRAINT IF EXISTS fee_records_skf_id_month_year_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_records_unique_type_period
  ON fee_records (skf_id, fee_type, month, year);

CREATE TABLE IF NOT EXISTS fee_receipt_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  active_theme_id TEXT NOT NULL DEFAULT 'skf_classic',
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fee_receipt_settings (id, active_theme_id)
VALUES (true, 'skf_classic')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE fee_receipt_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_receipt_settings" ON fee_receipt_settings;

CREATE POLICY "service_role_full_fee_receipt_settings"
ON fee_receipt_settings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS fee_receipts (
  receipt_id TEXT PRIMARY KEY,
  fee_record_id UUID REFERENCES fee_records(id) ON DELETE SET NULL,
  skf_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  fee_type TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  paid_date TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  dojo_address TEXT,
  theme_id TEXT NOT NULL DEFAULT 'skf_classic',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  replacement_receipt_id TEXT REFERENCES fee_receipts(receipt_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_receipts_skf_date
  ON fee_receipts (skf_id, issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_receipts_fee_record
  ON fee_receipts (fee_record_id, issued_at DESC);

ALTER TABLE fee_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_receipts" ON fee_receipts;

CREATE POLICY "service_role_full_fee_receipts"
ON fee_receipts
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION ensure_fee_record(
  p_skf_id TEXT,
  p_fee_type TEXT,
  p_month TEXT,
  p_year INTEGER,
  p_amount NUMERIC,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS fee_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result fee_records;
BEGIN
  INSERT INTO fee_records (
    skf_id,
    fee_type,
    month,
    year,
    amount,
    status,
    metadata,
    updated_at
  )
  VALUES (
    upper(trim(p_skf_id)),
    p_fee_type,
    p_month,
    p_year,
    greatest(coalesce(p_amount, 0), 0),
    'due',
    coalesce(p_metadata, '{}'::jsonb),
    now()
  )
  ON CONFLICT (skf_id, fee_type, month, year)
  DO UPDATE SET
    amount = CASE
      WHEN fee_records.status IN ('paid', 'pending_verification') THEN fee_records.amount
      ELSE EXCLUDED.amount
    END,
    metadata = coalesce(fee_records.metadata, '{}'::jsonb) || coalesce(EXCLUDED.metadata, '{}'::jsonb),
    updated_at = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION apply_fee_credit(
  p_credit_id UUID,
  p_skf_id TEXT,
  p_month TEXT,
  p_year INTEGER,
  p_fee_type TEXT,
  p_actor TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  credit_row fee_credits;
  adjustment_row fee_records;
  credit_amount NUMERIC;
BEGIN
  SELECT *
  INTO credit_row
  FROM fee_credits
  WHERE id = p_credit_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credit not found' USING ERRCODE = 'P0002';
  END IF;

  IF upper(trim(credit_row.skf_id)) <> upper(trim(p_skf_id)) THEN
    RAISE EXCEPTION 'Credit does not belong to student' USING ERRCODE = '22023';
  END IF;

  IF credit_row.status <> 'available' THEN
    RAISE EXCEPTION 'Credit has already been used or cancelled' USING ERRCODE = '23505';
  END IF;

  credit_amount := greatest(coalesce(credit_row.amount, 0), 0);

  INSERT INTO fee_records (
    skf_id,
    fee_type,
    month,
    year,
    amount,
    status,
    paid_date,
    payment_method,
    verified_by,
    verified_at,
    metadata,
    updated_at
  )
  VALUES (
    upper(trim(p_skf_id)),
    'credit_adjustment',
    p_month,
    p_year,
    credit_amount,
    'paid',
    now(),
    'credit adjustment',
    p_actor,
    now(),
    jsonb_build_object(
      'appliedToFeeType', p_fee_type,
      'lastCreditId', p_credit_id::text
    ),
    now()
  )
  ON CONFLICT (skf_id, fee_type, month, year)
  DO UPDATE SET
    amount = fee_records.amount + EXCLUDED.amount,
    status = 'paid',
    paid_date = coalesce(fee_records.paid_date, now()),
    payment_method = 'credit adjustment',
    verified_by = p_actor,
    verified_at = now(),
    metadata = coalesce(fee_records.metadata, '{}'::jsonb) || EXCLUDED.metadata,
    updated_at = now()
  RETURNING * INTO adjustment_row;

  UPDATE fee_credits
  SET
    status = 'used',
    used_fee_record_id = adjustment_row.id,
    used_month = p_month,
    used_year = p_year,
    used_at = now(),
    updated_at = now()
  WHERE id = p_credit_id;

  RETURN jsonb_build_object(
    'credit', to_jsonb(credit_row),
    'adjustment', to_jsonb(adjustment_row)
  );
END;
$$;


-- ============================================================
-- 017_fee_followups_and_finance_comparison.sql
-- ============================================================

-- Fee follow-up tracking for overdue and rejected rows.

CREATE TABLE IF NOT EXISTS fee_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  fee_type TEXT NOT NULL DEFAULT 'monthly',
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  contacted_by TEXT NOT NULL,
  contacted_by_role TEXT,
  contact_method TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fee_followups
  DROP CONSTRAINT IF EXISTS fee_followups_fee_type_check;

ALTER TABLE fee_followups
  ADD CONSTRAINT fee_followups_fee_type_check
  CHECK (fee_type IN ('monthly', 'admission', 'dress', 'credit_adjustment'));

ALTER TABLE fee_followups
  DROP CONSTRAINT IF EXISTS fee_followups_contact_method_check;

ALTER TABLE fee_followups
  ADD CONSTRAINT fee_followups_contact_method_check
  CHECK (contact_method IN ('whatsapp', 'call', 'in_person', 'sms', 'other'));

CREATE INDEX IF NOT EXISTS idx_fee_followups_skf_period
  ON fee_followups (skf_id, fee_type, year, month, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_followups_created_at
  ON fee_followups (created_at DESC);

ALTER TABLE fee_followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_followups" ON fee_followups;

CREATE POLICY "service_role_full_fee_followups"
ON fee_followups
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ============================================================
-- 019_fee_collection_workflow.sql
-- ============================================================

-- Fee collection workflow: manual proof intents, payment references, and reminder logs.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS fee_payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  fee_record_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'submitted', 'paid', 'rejected', 'expired', 'cancelled')),
  channel TEXT NOT NULL DEFAULT 'manual_proof'
    CHECK (channel IN ('manual_proof', 'razorpay_link', 'upi_autopay')),
  payment_reference TEXT,
  provider TEXT,
  provider_intent_id TEXT,
  provider_payment_id TEXT,
  provider_link_url TEXT,
  submitted_proof_id UUID REFERENCES fee_payment_proofs(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_payment_intents_skf_status
  ON fee_payment_intents (skf_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_payment_intents_status_created
  ON fee_payment_intents (status, created_at DESC);

ALTER TABLE fee_payment_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_payment_intents" ON fee_payment_intents;

CREATE POLICY "service_role_full_fee_payment_intents"
ON fee_payment_intents
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

ALTER TABLE fee_payment_proofs
  ADD COLUMN IF NOT EXISTS payment_intent_id UUID REFERENCES fee_payment_intents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_fee_payment_proofs_intent
  ON fee_payment_proofs (payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_fee_payment_proofs_reference
  ON fee_payment_proofs (payment_reference)
  WHERE payment_reference IS NOT NULL AND payment_reference <> '';

CREATE TABLE IF NOT EXISTS fee_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  fee_record_id UUID REFERENCES fee_records(id) ON DELETE SET NULL,
  fee_type TEXT NOT NULL DEFAULT 'monthly',
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'sms', 'email', 'in_app', 'manual')),
  template_key TEXT NOT NULL DEFAULT 'monthly_due',
  recipient_name TEXT,
  recipient_phone TEXT,
  message_body TEXT NOT NULL,
  message_url TEXT,
  provider TEXT NOT NULL DEFAULT 'manual_whatsapp',
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'prepared'
    CHECK (status IN ('prepared', 'opened', 'sent', 'failed', 'skipped')),
  sent_by TEXT,
  sent_by_role TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_reminder_logs_skf_period
  ON fee_reminder_logs (skf_id, fee_type, year, month, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fee_reminder_logs_channel_status
  ON fee_reminder_logs (channel, status, created_at DESC);

ALTER TABLE fee_reminder_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_fee_reminder_logs" ON fee_reminder_logs;

CREATE POLICY "service_role_full_fee_reminder_logs"
ON fee_reminder_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
