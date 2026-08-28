-- Family Groups: RLS policies + backfill existing same-phone athletes
--
-- 1. Enable RLS and create service_role-only policies
-- 2. Backfill: group all existing athletes with same phone into family_groups
-- 3. Create a function to auto-ensure family groups on new admissions

-- ──────────────────────────────────────────────────────────────
-- PART 1: RLS policies
-- ──────────────────────────────────────────────────────────────

ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_group_members ENABLE ROW LEVEL SECURITY;

-- Only service_role can access (bypasses RLS)
CREATE POLICY "service_role_only_family_groups" ON family_groups
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_only_family_group_members" ON family_group_members
  FOR ALL USING (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- PART 2: Backfill existing same-phone athletes
-- ──────────────────────────────────────────────────────────────

-- Helper: normalize phone to last 10 digits
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT)
RETURNS TEXT AS $$
  SELECT regexp_replace(COALESCE(phone, ''), '\D', '', 'g');
$$ LANGUAGE sql IMMUTABLE;

-- Helper: get last 10 chars of normalized phone
CREATE OR REPLACE FUNCTION phone_last10(phone TEXT)
RETURNS TEXT AS $$
  SELECT RIGHT(regexp_replace(COALESCE(phone, ''), '\D', '', 'g'), 10);
$$ LANGUAGE sql IMMUTABLE;

-- Create family groups for all athletes sharing a phone number
-- Only processes phones with 2+ athletes and skips athletes already in a group
DO $$
DECLARE
  rec RECORD;
  group_id TEXT;
  athlete_rec RECORD;
  phone_group RECORD;
BEGIN
  -- Find all phone numbers that have 2+ active athletes
  FOR phone_group IN
    SELECT phone_last10(phone) AS normalized_phone, COUNT(*) AS athlete_count
    FROM athletes
    WHERE phone IS NOT NULL AND phone != ''
      AND status IN ('active', 'Active')
    GROUP BY phone_last10(phone)
    HAVING COUNT(*) >= 2
  LOOP
    -- Skip if any athlete in this phone group is already in a family group
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM family_group_members fgm
      JOIN athletes a ON a.skf_id = fgm.skf_id
      WHERE phone_last10(a.phone) = phone_group.normalized_phone
      LIMIT 1
    );

    -- Create a new family group
    group_id := 'fam_' || phone_group.normalized_phone || '_' || to_char(now(), 'yyyymmddhh24miss');

    INSERT INTO family_groups (id, created_by, notes)
    VALUES (group_id, 'system', 'Auto-created from phone-based backfill');

    -- Insert all athletes with this phone into the group
    FOR athlete_rec IN
      SELECT skf_id, phone FROM athletes
      WHERE phone_last10(phone) = phone_group.normalized_phone
        AND status IN ('active', 'Active')
    LOOP
      INSERT INTO family_group_members (group_id, skf_id, guardian_phone)
      VALUES (group_id, athlete_rec.skf_id, COALESCE(athlete_rec.phone, ''))
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ──────────────────────────────────────────────────────────────
-- PART 3: Function to ensure family group on new admission
-- ──────────────────────────────────────────────────────────────

-- Called after a new athlete is created. Links them to an existing family
-- group if their phone matches, or creates a new group.
CREATE OR REPLACE FUNCTION ensure_family_group_on_admission(
  p_skf_id TEXT,
  p_phone TEXT
)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
  existing_group_id TEXT;
  new_group_id TEXT;
BEGIN
  IF p_phone IS NULL OR p_phone = '' THEN
    RETURN NULL;
  END IF;

  normalized := phone_last10(p_phone);

  -- Find if any existing athlete with this phone is already in a family group
  SELECT fgm.group_id INTO existing_group_id
  FROM family_group_members fgm
  JOIN athletes a ON a.skf_id = fgm.skf_id
  WHERE phone_last10(a.phone) = normalized
    AND a.status IN ('active', 'Active')
  LIMIT 1;

  IF existing_group_id IS NOT NULL THEN
    -- Add to existing group
    INSERT INTO family_group_members (group_id, skf_id, guardian_phone)
    VALUES (existing_group_id, p_skf_id, p_phone)
    ON CONFLICT DO NOTHING;
    RETURN existing_group_id;
  END IF;

  -- Check if there are other athletes with this phone (not yet in any group)
  IF EXISTS (
    SELECT 1 FROM athletes
    WHERE phone_last10(phone) = normalized
      AND skf_id != p_skf_id
      AND status IN ('active', 'Active')
  ) THEN
    -- Create a new family group and add all matching athletes
    new_group_id := 'fam_' || normalized || '_' || to_char(now(), 'yyyymmddhh24miss');

    INSERT INTO family_groups (id, created_by, notes)
    VALUES (new_group_id, 'system', 'Auto-created on admission');

    -- Add all matching athletes (including the new one)
    INSERT INTO family_group_members (group_id, skf_id, guardian_phone)
    SELECT new_group_id, a.skf_id, a.phone
    FROM athletes a
    WHERE phone_last10(a.phone) = normalized
      AND a.status IN ('active', 'Active')
    ON CONFLICT DO NOTHING;

    RETURN new_group_id;
  END IF;

  -- No other athletes with this phone. Create a solo group (ready for future siblings).
  new_group_id := 'fam_' || normalized || '_' || to_char(now(), 'yyyymmddhh24miss');

  INSERT INTO family_groups (id, created_by, notes)
  VALUES (new_group_id, 'system', 'Solo group, created on admission');

  INSERT INTO family_group_members (group_id, skf_id, guardian_phone)
  VALUES (new_group_id, p_skf_id, p_phone);

  RETURN new_group_id;
END;
$$ LANGUAGE plpgsql;
