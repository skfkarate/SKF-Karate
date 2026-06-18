CREATE TABLE IF NOT EXISTS exam_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (year, month)
);

ALTER TABLE exam_months ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_exam_months" ON exam_months;
CREATE POLICY "service_role_full_exam_months"
ON exam_months
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
