-- ════════════════════════════════════════════════
-- Migration 031: Seed initial Black Belt program + 6 candidates
-- Run in Supabase SQL Editor after deploying.
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT DO NOTHING).
-- ════════════════════════════════════════════════

-- 1. Create the active BB program if none exists
INSERT INTO bb_programs (title, slug, tagline, exam_date, program_start, program_end, status, exam_components, wkf_documents, config)
SELECT 'Black Belt Examination 2026',
       'bb-exam-2026',
       'SKF Karate Black Belt Examination Program',
       '2026-10-19',
       '2026-05-19',
       '2026-10-19',
       'active',
       '[]',
       '[]',
       '{}'
WHERE NOT EXISTS (SELECT 1 FROM bb_programs WHERE status = 'active');

-- Also bump any draft/archived program to active if no active one exists yet
UPDATE bb_programs
SET status = 'active'
WHERE status != 'active'
  AND NOT EXISTS (SELECT 1 FROM bb_programs WHERE status = 'active');

-- 2. Enroll the 6 candidates (ON CONFLICT silently skips existing rows)
INSERT INTO bb_candidates (program_id, skf_id, display_name, display_code, weapon_group, bunkai_group, self_defense_day, sort_order)
SELECT
  (SELECT id FROM bb_programs WHERE status = 'active' ORDER BY created_at DESC LIMIT 1),
  skf_id, display_name, display_code, weapon_group, bunkai_group, self_defense_day, sort_order
FROM (VALUES
  ('SKF13BL000', 'Shri Roshan P',       'BB-01', 'bo_staff',   'group_a', 'saturday', 1),
  ('SKF20HE001', 'Sanjana S',           'BB-02', 'bo_staff',   'group_b', 'saturday', 2),
  ('SKF20HE002', 'Tejashree S',         'BB-03', 'bo_staff',   'group_a', 'saturday', 3),
  ('SKF20HE003', 'Ayush Kashyap G',     'BB-04', 'bo_staff',   'group_b', 'saturday', 4),
  ('SKF21HE001', 'Ishaan Gowda B S',    'BB-05', 'bo_staff',   'group_a', 'saturday', 5),
  ('SKF21HE003', 'Shashank R',          'BB-06', 'bo_staff',   'group_b', 'saturday', 6)
) AS src(skf_id, display_name, display_code, weapon_group, bunkai_group, self_defense_day, sort_order)
ON CONFLICT (program_id, skf_id) DO NOTHING;
