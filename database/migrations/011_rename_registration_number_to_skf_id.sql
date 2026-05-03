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
