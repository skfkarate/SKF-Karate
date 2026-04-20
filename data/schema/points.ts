import type { EntitySchema } from './types'

/**
 * Schema: student_points
 * Source: Inferred from lib/points/pointsService.ts (NOT in SUPABASE_SCHEMA.sql — needs migration)
 * Purpose: Aggregated point balance per student
 */
export const studentPointsSchema: EntitySchema = {
  entity: 'StudentPoints',
  tableName: 'student_points',
  primaryKey: 'skf_id',
  storage: 'supabase',
  rls: false,
  fields: {
    skf_id:          { type: 'string',  supabaseType: 'TEXT',        required: true,  unique: true, description: 'Student SKF ID — primary key and upsert conflict target' },
    current_balance: { type: 'number',  supabaseType: 'INTEGER',     required: true,  default: 0 },
    total_earned:    { type: 'number',  supabaseType: 'INTEGER',     required: true,  default: 0 },
    total_redeemed:  { type: 'number',  supabaseType: 'INTEGER',     required: true,  default: 0 },
    tier:            { type: 'string',  supabaseType: 'TEXT',        required: false, description: 'Computed from TIERS in pointsService.ts based on total_earned' },
    updated_at:      { type: 'date',    supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  notes: 'MIGRATION NEEDED — this table is used by pointsService.ts but does not exist in SUPABASE_SCHEMA.sql. Must be created in Supabase before points features work.',
}

/**
 * Schema: point_transactions
 * Source: Inferred from lib/points/pointsService.ts (NOT in SUPABASE_SCHEMA.sql — needs migration)
 * Purpose: Audit log of every point earn/redeem operation
 */
export const pointTransactionSchema: EntitySchema = {
  entity: 'PointTransaction',
  tableName: 'point_transactions',
  primaryKey: 'id',
  storage: 'supabase',
  rls: false,
  fields: {
    id:             { type: 'uuid',   supabaseType: 'UUID',        required: true,  default: 'gen_random_uuid()' },
    skf_id:         { type: 'string', supabaseType: 'TEXT',        required: true },
    type:           { type: 'enum',   supabaseType: 'TEXT',        required: true,  enumValues: ['EARN', 'REDEEM'] },
    reason:         { type: 'string', supabaseType: 'TEXT',        required: true,  description: 'Key from POINT_RULES (ATTENDANCE, GRADING_PASS, etc.)' },
    points:         { type: 'number', supabaseType: 'INTEGER',     required: true,  description: 'Positive for earn, negative for redeem' },
    balance_before: { type: 'number', supabaseType: 'INTEGER',     required: true },
    balance_after:  { type: 'number', supabaseType: 'INTEGER',     required: true },
    metadata:       { type: 'json',   supabaseType: 'JSONB',       required: false, default: '{}' },
    created_at:     { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  indexes: ['ON (skf_id)', 'ON (created_at)'],
  notes: 'MIGRATION NEEDED — used by pointsService.ts awardPoints() and redeemPoints(). Must be created in Supabase.',
}
