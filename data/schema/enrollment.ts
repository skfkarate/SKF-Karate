import type { EntitySchema } from './types'

/**
 * Schema: enrollments
 * Source: SUPABASE_SCHEMA.sql (table 4) + database/supabase_certificates.sql
 * Purpose: Links students (by SKF ID) to certificate programs
 */
export const enrollmentSchema: EntitySchema = {
  entity: 'Enrollment',
  tableName: 'enrollments',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:                   { type: 'uuid',    supabaseType: 'UUID',    required: true,  default: 'gen_random_uuid()' },
    skf_id:               { type: 'string',  supabaseType: 'TEXT',    required: true,  description: 'Student SKF ID (not a FK — students live in Sheets/JSON)' },
    program_id:           { type: 'uuid',    supabaseType: 'UUID',    required: true,  references: 'programs.id', description: 'FK → programs. ON DELETE CASCADE' },
    belt_level:           { type: 'string',  supabaseType: 'TEXT',    required: false },
    status:               { type: 'enum',    supabaseType: 'TEXT',    required: true,  default: 'enrolled', enumValues: ['enrolled', 'completed', 'revoked'] },
    completion_date:      { type: 'date',    supabaseType: 'DATE',    required: false },
    issuer_name:          { type: 'string',  supabaseType: 'TEXT',    required: false },
    certificate_unlocked: { type: 'boolean', supabaseType: 'BOOLEAN', required: false, default: false },
    notification_sent:    { type: 'boolean', supabaseType: 'BOOLEAN', required: false, default: false },
    enrolled_at:          { type: 'date',    supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()', description: 'Called created_at in main schema, enrolled_at in certificates SQL' },
    updated_at:           { type: 'date',    supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  indexes: [
    'idx_enrollment_skf_id ON (skf_id)',
    'idx_enrollment_program ON (program_id)',
    'idx_enrollment_status ON (status)',
  ],
  notes: 'RLS: public can read completed+unlocked rows only (for certificate verification). Service role has full access. The verify route uses skfId + enrollmentId for lookups.',
}
