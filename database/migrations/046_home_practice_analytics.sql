-- Speeds the instructor-only Home Practice analytics window queries.
CREATE INDEX IF NOT EXISTS idx_video_progress_last_watched
  ON video_progress (last_watched DESC);
