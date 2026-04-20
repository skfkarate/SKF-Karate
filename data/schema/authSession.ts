import type { EntitySchema } from './types'

/**
 * Schema: auth_sessions
 * Source: SUPABASE_SCHEMA.sql (table 1)
 * Purpose: Stores portal PIN auth sessions (legacy flow — primary login uses DOB)
 */
export const authSessionSchema: EntitySchema = {
  entity: 'AuthSession',
  tableName: 'auth_sessions',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:              { type: 'uuid',    supabaseType: 'UUID',         required: true,  default: 'gen_random_uuid()' },
    skf_id:          { type: 'string',  supabaseType: 'TEXT',         required: true,  unique: true, description: 'SKF membership ID (format: SKF-YYYY-XXXX)' },
    pin_hash:        { type: 'string',  supabaseType: 'TEXT',         required: true,  description: 'bcrypt hash of 4-digit PIN. NEVER log or expose.' },
    failed_attempts: { type: 'number',  supabaseType: 'INTEGER',      required: false, default: 0 },
    locked_until:    { type: 'date',    supabaseType: 'TIMESTAMPTZ',  required: false },
    created_at:      { type: 'date',    supabaseType: 'TIMESTAMPTZ',  required: false, default: 'NOW()' },
    updated_at:      { type: 'date',    supabaseType: 'TIMESTAMPTZ',  required: false, default: 'NOW()' },
  },
  notes: 'Used by /api/auth/portal/set-pin/route.js. The primary portal login (/api/auth/portal/route.js) uses SKF ID + dateOfBirth, NOT this table.',
}
