-- Karate syllabi can be arranged as parent areas and child sections, for
-- example Kata > Heian Shodan, or Kumite > Sparring drills.
ALTER TABLE portal_practice_folders
  ADD COLUMN IF NOT EXISTS parent_folder_id TEXT REFERENCES portal_practice_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_portal_practice_folders_parent
  ON portal_practice_folders (parent_folder_id);
