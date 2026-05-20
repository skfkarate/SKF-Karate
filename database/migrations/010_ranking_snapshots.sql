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
