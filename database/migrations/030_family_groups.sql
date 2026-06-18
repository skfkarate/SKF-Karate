-- Family Groups — explicit multi-child family relationships
--
-- Previously siblings were discovered implicitly by matching `phone` on the
-- athletes table. This table makes relationships explicit so phone changes
-- don't break the connection and multiple guardian phones are supported.
--
-- Usage:
--   INSERT INTO family_group_members (group_id, skf_id, guardian_phone)
--   VALUES
--     ('fam_001', 'SKF26MP001', '9876543210'),
--     ('fam_001', 'SKF26MP002', '9876543210');
--
-- PortalAuthService.getSiblings() checks this table first, then falls back
-- to implicit phone-based discovery for families not yet migrated.

CREATE TABLE IF NOT EXISTS family_groups (
  id TEXT PRIMARY KEY,
  created_by TEXT NOT NULL DEFAULT 'system',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  skf_id TEXT NOT NULL,
  guardian_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(group_id, skf_id)
);

CREATE INDEX IF NOT EXISTS idx_fgm_skf_id ON family_group_members(skf_id);
CREATE INDEX IF NOT EXISTS idx_fgm_guardian_phone ON family_group_members(guardian_phone);
