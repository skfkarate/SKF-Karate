-- Event-driven certificate lifecycle for FeeTrack.
-- Draft certificates can be prepared for printer QR generation, while public
-- verification stays locked until the official certificate publication day.

ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS source_event_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_programs_source_event_id
  ON programs(source_event_id)
  WHERE source_event_id IS NOT NULL;

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_by TEXT;

ALTER TABLE certificates
  ALTER COLUMN status SET DEFAULT 'draft';

UPDATE certificates
SET
  prepared_at = COALESCE(prepared_at, issued_at, NOW()),
  published_at = COALESCE(published_at, issued_at)
WHERE status = 'issued';

UPDATE enrollments
SET skf_id = upper(btrim(skf_id))
WHERE skf_id <> upper(btrim(skf_id));

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY program_id, skf_id
      ORDER BY
        CASE WHEN status = 'completed' THEN 0 ELSE 1 END,
        certificate_unlocked DESC,
        updated_at DESC NULLS LAST,
        enrolled_at DESC NULLS LAST,
        id
    ) AS rn
  FROM enrollments
)
DELETE FROM enrollments
USING ranked
WHERE enrollments.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_program_skf_unique
  ON enrollments(program_id, skf_id);

CREATE INDEX IF NOT EXISTS idx_certificates_program_status
  ON certificates(program_id, status);

CREATE INDEX IF NOT EXISTS idx_certificates_published_at
  ON certificates(published_at)
  WHERE published_at IS NOT NULL;
