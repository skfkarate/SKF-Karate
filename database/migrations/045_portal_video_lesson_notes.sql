-- Instructor notes appear beneath an authorised Home Practice lesson.
-- They are kept with the lesson so FeeTrack controls the athlete-facing copy.

ALTER TABLE portal_videos
  ADD COLUMN IF NOT EXISTS lesson_note TEXT NOT NULL DEFAULT '';

ALTER TABLE portal_videos
  DROP CONSTRAINT IF EXISTS portal_videos_lesson_note_length;

ALTER TABLE portal_videos
  ADD CONSTRAINT portal_videos_lesson_note_length
  CHECK (char_length(lesson_note) <= 3000);
