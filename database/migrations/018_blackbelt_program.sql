-- ══════════════════════════════════════
-- Migration 018: Black Belt Examination Program
-- Creates tables for managing BB candidates, programs,
-- and their progress through the 5-month examination runway.
-- ══════════════════════════════════════

-- 1. Program definition (one row per exam cycle)
CREATE TABLE IF NOT EXISTS bb_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT DEFAULT '',
  exam_date DATE,
  program_start DATE,
  program_end DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  exam_components JSONB DEFAULT '[]',
  wkf_documents JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_bb_programs" ON bb_programs;

CREATE POLICY "service_role_full_bb_programs" ON bb_programs
  FOR ALL USING (auth.role() = 'service_role');

-- 2. Candidate enrollment & progress tracking
CREATE TABLE IF NOT EXISTS bb_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES bb_programs(id) ON DELETE CASCADE,
  skf_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_code TEXT,
  photo_url TEXT,
  weapon_group TEXT NOT NULL
    CHECK (weapon_group IN ('bo_staff', 'nunchaku')),
  bunkai_group TEXT NOT NULL
    CHECK (bunkai_group IN ('group_a', 'group_b')),
  self_defense_day TEXT NOT NULL
    CHECK (self_defense_day IN ('tuesday', 'friday', 'saturday')),

  -- Gate statuses
  first_aid_status TEXT DEFAULT 'not_started'
    CHECK (first_aid_status IN ('not_started', 'in_progress', 'completed')),
  first_aid_cert_date DATE,

  marketing_status TEXT DEFAULT 'in_progress'
    CHECK (marketing_status IN ('in_progress', 'enrolled')),
  enrolled_student_name TEXT,
  enrolled_student_date DATE,

  -- Tournament results
  tournament_kata_status TEXT DEFAULT 'not_won'
    CHECK (tournament_kata_status IN ('not_won', 'won')),
  tournament_kata_event TEXT,
  tournament_kata_date DATE,
  tournament_kumite_status TEXT DEFAULT 'not_won'
    CHECK (tournament_kumite_status IN ('not_won', 'won')),
  tournament_kumite_event TEXT,
  tournament_kumite_date DATE,

  -- Fitness
  fitness_baseline_done BOOLEAN DEFAULT false,
  fitness_baseline_data JSONB DEFAULT '{}',
  fitness_retest_done BOOLEAN DEFAULT false,
  fitness_retest_data JSONB DEFAULT '{}',
  fitness_improved BOOLEAN,

  -- WKF Reading
  wkf_kumite_status TEXT DEFAULT 'not_started'
    CHECK (wkf_kumite_status IN ('not_started', 'reading', 'quiz_passed')),
  wkf_kata_status TEXT DEFAULT 'not_started'
    CHECK (wkf_kata_status IN ('not_started', 'reading', 'quiz_passed')),
  wkf_referee_status TEXT DEFAULT 'not_started'
    CHECK (wkf_referee_status IN ('not_started', 'in_progress', 'reviewed')),

  -- Weapon & Bunkai
  weapon_status TEXT DEFAULT 'not_started'
    CHECK (weapon_status IN ('not_started', 'in_progress', 'exam_ready')),
  bunkai_status TEXT DEFAULT 'not_done'
    CHECK (bunkai_status IN ('not_done', 'internal_demo', 'taught_to_kids')),

  -- Self-defense monthly checkmarks
  self_defense_months JSONB DEFAULT '{"month_1":false,"month_2":false,"month_3":false,"month_4":false}',

  -- Video log
  video_count INTEGER DEFAULT 0,
  video_target INTEGER DEFAULT 16,

  -- Teaching
  teaching_status TEXT DEFAULT 'active'
    CHECK (teaching_status IN ('active', 'ongoing', 'flagged')),

  -- Mock exam
  mock_exam_done BOOLEAN DEFAULT false,

  -- Overall readiness
  readiness TEXT DEFAULT 'attention_needed'
    CHECK (readiness IN ('on_track', 'attention_needed', 'exam_ready')),

  -- Exam result (populated after exam)
  exam_score NUMERIC,
  exam_result TEXT
    CHECK (exam_result IS NULL OR exam_result IN ('pass', 'conditional', 'defer')),
  exam_component_scores JSONB DEFAULT '{}',

  -- Instructor private notes
  instructor_notes TEXT DEFAULT '',

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(program_id, skf_id)
);

CREATE INDEX IF NOT EXISTS idx_bb_candidates_program ON bb_candidates(program_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_bb_candidates_skf ON bb_candidates(skf_id);

ALTER TABLE bb_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_bb_candidates" ON bb_candidates;

CREATE POLICY "service_role_full_bb_candidates" ON bb_candidates
  FOR ALL USING (auth.role() = 'service_role');

-- 3. Progress entries / activity timeline
CREATE TABLE IF NOT EXISTS bb_progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES bb_candidates(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL
    CHECK (entry_type IN (
      'tournament', 'video_approved', 'video_retake',
      'self_defense', 'weapon_milestone', 'bunkai_milestone',
      'first_aid', 'marketing', 'fitness', 'teaching_note',
      'wkf_quiz', 'mock_exam', 'general', 'instructor_note'
    )),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  month_number INTEGER,
  entry_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bb_progress_candidate ON bb_progress_entries(candidate_id, entry_date DESC);

ALTER TABLE bb_progress_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_bb_progress" ON bb_progress_entries;

CREATE POLICY "service_role_full_bb_progress" ON bb_progress_entries
  FOR ALL USING (auth.role() = 'service_role');
