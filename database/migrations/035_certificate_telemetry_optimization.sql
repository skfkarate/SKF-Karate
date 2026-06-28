-- Keep certificate telemetry useful but bounded for the Supabase free plan.
-- Views are stored as one row per student/certificate. Download audit events
-- remain append-only, with an explicit cleanup function for old rows.

WITH ranked_certificate_views AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY skf_id, enrollment_id
      ORDER BY
        downloaded_at DESC NULLS LAST,
        viewed_at DESC NULLS LAST,
        id
    ) AS row_number
  FROM certificate_views
)
DELETE FROM certificate_views
USING ranked_certificate_views
WHERE certificate_views.id = ranked_certificate_views.id
  AND ranked_certificate_views.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cert_views_unique_certificate
  ON certificate_views (skf_id, enrollment_id);

CREATE INDEX IF NOT EXISTS idx_cert_events_created_at
  ON certificate_events (created_at);

CREATE OR REPLACE FUNCTION cleanup_certificate_telemetry(retention_days INTEGER DEFAULT 180)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM certificate_events
  WHERE created_at < NOW() - make_interval(days => GREATEST(retention_days, 30));

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
