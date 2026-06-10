-- Migration: Link gallery_photos to events
-- Adds event_id and event_date columns so event photos can be queried and displayed on event pages.

ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS event_date DATE;

CREATE INDEX IF NOT EXISTS idx_gallery_photos_event
  ON gallery_photos (event_id, is_published, pinned, sort_order)
  WHERE event_id IS NOT NULL;
