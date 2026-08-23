-- Rename the Kunigal branch slug from 'kunigal-main' to 'kunigal' so the
-- public URLs become /classes/kunigal/kunigal and /admission/kunigal.
-- Legacy 'kunigal-main' links are redirected in the app layer (next.config).
--
-- Run this BEFORE deploying the app build that switches to the new slug,
-- otherwise /admission/kunigal resolves to nothing until this runs.
-- Idempotent: re-running is a no-op.

-- 1) Admission branch settings (guarded against unique-constraint conflicts
--    in case a 'kunigal' row was created manually beforehand).
UPDATE admission_branch_settings
SET
  branch_slug = 'kunigal',
  updated_at = NOW()
WHERE branch_slug = 'kunigal-main'
  AND NOT EXISTS (SELECT 1 FROM admission_branch_settings WHERE branch_slug = 'kunigal');

DELETE FROM admission_branch_settings
WHERE branch_slug = 'kunigal-main'
  AND EXISTS (SELECT 1 FROM admission_branch_settings WHERE branch_slug = 'kunigal');

-- 2) Class branches catalog (drives /classes pages and the sitemap).
UPDATE class_branches
SET slug = 'kunigal'
WHERE slug = 'kunigal-main'
  AND NOT EXISTS (SELECT 1 FROM class_branches WHERE slug = 'kunigal');

DELETE FROM class_branches
WHERE slug = 'kunigal-main'
  AND EXISTS (SELECT 1 FROM class_branches WHERE slug = 'kunigal');
