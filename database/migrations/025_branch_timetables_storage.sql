-- Public storage bucket for branch timetable images managed from FeeTrack.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  allowed_mime_types
)
VALUES (
  'branch-timetables',
  'branch-timetables',
  true,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "service_role_full_branch_timetables_storage" ON storage.objects;

CREATE POLICY "service_role_full_branch_timetables_storage"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'branch-timetables')
WITH CHECK (bucket_id = 'branch-timetables');
