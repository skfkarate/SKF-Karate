-- Private storage bucket for athlete-portal training videos.
-- The application signs short-lived URLs server-side using the service-role client.
-- File-size limits are left at the Supabase project default because free/lower-tier
-- projects reject higher per-bucket limits.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  allowed_mime_types
)
VALUES (
  'training-videos',
  'training-videos',
  false,
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "service_role_full_training_videos" ON storage.objects;

CREATE POLICY "service_role_full_training_videos"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'training-videos')
WITH CHECK (bucket_id = 'training-videos');
