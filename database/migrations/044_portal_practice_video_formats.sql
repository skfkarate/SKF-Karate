-- Karate home practice uses two deliberate lesson presentations:
-- vertical quick drills (YouTube Shorts) and landscape full lessons.

ALTER TABLE portal_videos
  ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'landscape';

UPDATE portal_videos
SET content_format = 'landscape'
WHERE content_format IS NULL OR content_format NOT IN ('landscape', 'short');

ALTER TABLE portal_videos
  DROP CONSTRAINT IF EXISTS portal_videos_content_format_check;

ALTER TABLE portal_videos
  ADD CONSTRAINT portal_videos_content_format_check
  CHECK (content_format IN ('landscape', 'short'));

CREATE INDEX IF NOT EXISTS idx_portal_videos_format
  ON portal_videos (folder_id, content_format, is_published, sort_order);
