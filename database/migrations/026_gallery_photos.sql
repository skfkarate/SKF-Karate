CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  title TEXT NOT NULL,
  cat TEXT NOT NULL DEFAULT 'In Dojo',
  pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_public
  ON gallery_photos (is_published, pinned, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_category
  ON gallery_photos (cat, is_published, sort_order);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_gallery_photos" ON gallery_photos;

CREATE POLICY "service_role_full_gallery_photos"
ON gallery_photos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

INSERT INTO storage.buckets (
  id,
  name,
  public,
  allowed_mime_types
)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "service_role_full_gallery_photos_storage" ON storage.objects;

CREATE POLICY "service_role_full_gallery_photos_storage"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'gallery-photos')
WITH CHECK (bucket_id = 'gallery-photos');
