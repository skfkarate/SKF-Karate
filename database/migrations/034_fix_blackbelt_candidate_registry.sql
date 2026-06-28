-- Keep the 2026 Black Belt portal limited to the six official candidate IDs.
-- A legacy Shriroshan row existed as SKF17BL000 after the public ID was corrected
-- to SKF13BL000. Upgrade it when safe; otherwise remove the stale duplicate.

UPDATE bb_candidates legacy
SET skf_id = 'SKF13BL000',
    display_name = COALESCE(NULLIF(display_name, ''), 'Shri Roshan P'),
    updated_at = NOW()
WHERE upper(replace(replace(legacy.skf_id, ' ', ''), '-', '')) = 'SKF17BL000'
  AND NOT EXISTS (
    SELECT 1
    FROM bb_candidates canonical
    WHERE canonical.program_id = legacy.program_id
      AND upper(replace(replace(canonical.skf_id, ' ', ''), '-', '')) = 'SKF13BL000'
  );

DELETE FROM bb_candidates legacy
USING bb_candidates canonical
WHERE legacy.program_id = canonical.program_id
  AND upper(replace(replace(legacy.skf_id, ' ', ''), '-', '')) = 'SKF17BL000'
  AND upper(replace(replace(canonical.skf_id, ' ', ''), '-', '')) = 'SKF13BL000';
