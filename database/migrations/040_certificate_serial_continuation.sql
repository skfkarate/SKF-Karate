-- Continue the SKF certificate registry after the historically distributed
-- certificate range. SKF-C-000001 through SKF-C-010000 are reserved; the
-- QR-backed digital register began at SKF-C-010001 and has distributed through
-- SKF-C-010015, so the next generated number must be SKF-C-010016.

CREATE SEQUENCE IF NOT EXISTS certificate_registration_seq START 10016;

ALTER TABLE programs
  DROP CONSTRAINT IF EXISTS programs_type_check;

ALTER TABLE programs
  ADD CONSTRAINT programs_type_check
  CHECK (type IN (
    'camp',
    'belt_exam',
    'training',
    'tournament',
    'seminar',
    'special_program',
    'participation',
    'achievement'
  ));

ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificates_status_check;

ALTER TABLE certificates
  ADD CONSTRAINT certificates_status_check
  CHECK (status IN ('draft', 'issued', 'reissued', 'void', 'revoked'));

WITH parsed_certificate_numbers AS (
  SELECT
    enrollment_id,
    substring(upper(btrim(certificate_number)) FROM '^SKF-C-([0-9]{6,})$')::BIGINT AS visible_serial
  FROM certificates
  WHERE upper(btrim(COALESCE(certificate_number, ''))) ~ '^SKF-C-[0-9]{6,}$'
)
UPDATE certificates
SET certificate_serial = parsed_certificate_numbers.visible_serial
FROM parsed_certificate_numbers
WHERE certificates.enrollment_id = parsed_certificate_numbers.enrollment_id
  AND certificates.certificate_serial IS DISTINCT FROM parsed_certificate_numbers.visible_serial;

DO $$
DECLARE
  max_serial BIGINT;
BEGIN
  SELECT GREATEST(COALESCE(MAX(certificate_serial), 10015), 10015)
  INTO max_serial
  FROM certificates;

  PERFORM setval('certificate_registration_seq', max_serial, true);
END $$;

CREATE OR REPLACE FUNCTION assign_certificate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
  visible_serial BIGINT;
BEGIN
  IF NEW.certificate_number IS NOT NULL AND btrim(NEW.certificate_number) <> '' THEN
    NEW.certificate_number := upper(btrim(NEW.certificate_number));

    IF NEW.certificate_number !~ '^SKF-C-[0-9]{6,}$' THEN
      RAISE EXCEPTION 'Invalid SKF certificate number: %', NEW.certificate_number;
    END IF;

    visible_serial := substring(NEW.certificate_number FROM '^SKF-C-([0-9]{6,})$')::BIGINT;
    NEW.certificate_serial := visible_serial;
  END IF;

  IF NEW.certificate_serial IS NULL THEN
    NEW.certificate_serial := nextval('certificate_registration_seq');
  END IF;

  IF NEW.certificate_serial <= 10000 THEN
    RAISE EXCEPTION 'Certificate serials 1 through 10000 are reserved for historical SKF certificates.';
  END IF;

  IF NEW.certificate_number IS NULL OR btrim(NEW.certificate_number) = '' THEN
    NEW.certificate_number := 'SKF-C-' || lpad(NEW.certificate_serial::text, 6, '0');
  END IF;

  IF NEW.verification_code IS NULL OR btrim(NEW.verification_code) = '' THEN
    NEW.verification_code := encode(gen_random_bytes(16), 'hex');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
