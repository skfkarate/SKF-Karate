-- Migrate portal videos to YouTube-backed playback.
-- The app now stores only the 11-character YouTube video ID and derives
-- thumbnails/player URLs at runtime.

ALTER TABLE portal_videos
  ADD COLUMN IF NOT EXISTS youtube_id TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'portal_videos'
      AND column_name = 'source_url'
  ) THEN
    EXECUTE $sql$
      UPDATE portal_videos
      SET youtube_id = COALESCE(
        youtube_id,
        substring(source_url from '(?:[?&]v=|youtu\.be/|youtube\.com/embed/|youtube\.com/shorts/)([A-Za-z0-9_-]{11})'),
        CASE
          WHEN source_url ~ '^[A-Za-z0-9_-]{11}$' THEN source_url
          ELSE NULL
        END
      )
      WHERE youtube_id IS NULL
    $sql$;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM portal_videos
    WHERE youtube_id IS NULL
      OR youtube_id !~ '^[A-Za-z0-9_-]{11}$'
  ) THEN
    RAISE EXCEPTION 'portal_videos contains rows without valid 11-character youtube_id values';
  END IF;
END $$;

ALTER TABLE portal_videos
  ALTER COLUMN youtube_id SET NOT NULL;

ALTER TABLE portal_videos
  DROP CONSTRAINT IF EXISTS portal_videos_youtube_id_format;

ALTER TABLE portal_videos
  ADD CONSTRAINT portal_videos_youtube_id_format
  CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$');

CREATE INDEX IF NOT EXISTS idx_portal_videos_youtube_id
  ON portal_videos (youtube_id);

ALTER TABLE portal_videos
  DROP COLUMN IF EXISTS provider,
  DROP COLUMN IF EXISTS source_url,
  DROP COLUMN IF EXISTS playback_url,
  DROP COLUMN IF EXISTS thumbnail_url;
