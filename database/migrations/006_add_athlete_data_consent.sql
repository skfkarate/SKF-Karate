-- Store parent/guardian data-processing consent for student records.
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;
