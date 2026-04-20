import type { EntitySchema } from './types'

/**
 * Schema: programs
 * Source: SUPABASE_SCHEMA.sql (table 2) + database/supabase_certificates.sql
 * Purpose: Certificate program categories (camp, belt_exam, training, tournament)
 */
export const programSchema: EntitySchema = {
  entity: 'Program',
  tableName: 'programs',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:                { type: 'uuid',    supabaseType: 'UUID',    required: true,  default: 'gen_random_uuid()' },
    name:              { type: 'string',  supabaseType: 'TEXT',    required: true },
    type:              { type: 'enum',    supabaseType: 'TEXT',    required: true,  enumValues: ['camp', 'belt_exam', 'training', 'tournament'] },
    branch:            { type: 'string',  supabaseType: 'TEXT',    required: false },
    has_belt_subtypes: { type: 'boolean', supabaseType: 'BOOLEAN', required: false, default: false, description: 'From supabase_certificates.sql — not in main schema' },
    is_active:         { type: 'boolean', supabaseType: 'BOOLEAN', required: false, default: true },
    created_at:        { type: 'date',    supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  notes: 'RLS: public can read active programs. Service role has full access.',
}
