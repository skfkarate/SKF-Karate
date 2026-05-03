-- Backfill the default white-belt history entry for existing athlete rows.
-- New and edited athletes are handled by the application repository layer.

UPDATE public.athletes
SET
  achievements =
    jsonb_build_array(
      jsonb_build_object(
        'id', 'ach_initial_white_belt',
        'type', 'enrollment',
        'date', join_date::text,
        'title', 'Joined SKF Karate',
        'description', 'Started SKF Karate as a White Belt.',
        'pointsAwarded', 50,
        'beltEarned', 'white',
        'grade', 'Enrollment',
        'result', 'pass',
        'awardedBy', 'SKF Karate',
        'location', COALESCE(NULLIF(branch_name, ''), 'SKF Karate')
      )
    ) ||
    CASE
      WHEN jsonb_typeof(achievements) = 'array' THEN achievements
      ELSE '[]'::jsonb
    END,
  updated_at = NOW()
WHERE join_date IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(athletes.achievements) = 'array' THEN athletes.achievements
        ELSE '[]'::jsonb
      END
    ) AS achievement
    WHERE achievement->>'id' = 'ach_initial_white_belt'
      OR (
        achievement->>'type' = 'enrollment'
        AND COALESCE(achievement->>'sourceEventId', '') = ''
        AND COALESCE(NULLIF(achievement->>'beltEarned', ''), 'white') = 'white'
      )
  );
