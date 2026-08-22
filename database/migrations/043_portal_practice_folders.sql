-- Organise athlete home-practice content into audience-controlled folders.
-- Existing portal_videos stay intact and simply remain unassigned until an
-- instructor moves them into a folder from FeeTrack.

CREATE TABLE IF NOT EXISTS portal_practice_folders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  branch_slugs JSONB NOT NULL DEFAULT '[]',
  batch_names JSONB NOT NULL DEFAULT '[]',
  belt_levels JSONB NOT NULL DEFAULT '[]',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_practice_folders_published
  ON portal_practice_folders (is_published, is_featured, sort_order);

ALTER TABLE portal_practice_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_portal_practice_folders" ON portal_practice_folders;
CREATE POLICY "service_role_full_portal_practice_folders" ON portal_practice_folders
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

ALTER TABLE portal_videos
  ADD COLUMN IF NOT EXISTS folder_id TEXT REFERENCES portal_practice_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_portal_videos_folder
  ON portal_videos (folder_id, is_published, sort_order);

-- Private practice images are deliberately separate from the public gallery.
CREATE TABLE IF NOT EXISTS portal_practice_photos (
  id TEXT PRIMARY KEY,
  folder_id TEXT REFERENCES portal_practice_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  storage_path TEXT NOT NULL,
  branch_slugs JSONB NOT NULL DEFAULT '[]',
  batch_names JSONB NOT NULL DEFAULT '[]',
  belt_levels JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_practice_photos_folder
  ON portal_practice_photos (folder_id, is_published, sort_order);

ALTER TABLE portal_practice_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_portal_practice_photos" ON portal_practice_photos;
CREATE POLICY "service_role_full_portal_practice_photos" ON portal_practice_photos
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'portal-practice-images',
  'portal-practice-images',
  false,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "service_role_full_portal_practice_images" ON storage.objects;
CREATE POLICY "service_role_full_portal_practice_images"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'portal-practice-images')
WITH CHECK (bucket_id = 'portal-practice-images');
