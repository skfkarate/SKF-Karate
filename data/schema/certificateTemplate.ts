import type { EntitySchema } from './types'

/**
 * Schema: certificate_templates
 * Source: SUPABASE_SCHEMA.sql (table 3) + database/supabase_certificates.sql
 * Purpose: Stores template images and field coordinate configs for certificate rendering
 */
export const certificateTemplateSchema: EntitySchema = {
  entity: 'CertificateTemplate',
  tableName: 'certificate_templates',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:                 { type: 'uuid',    supabaseType: 'UUID',    required: true,  default: 'gen_random_uuid()' },
    program_id:         { type: 'uuid',    supabaseType: 'UUID',    required: true,  references: 'programs.id', description: 'FK → programs. ON DELETE CASCADE' },
    belt_level:         { type: 'string',  supabaseType: 'TEXT',    required: false, description: 'NULL for non-belt programs. white|yellow|orange|green|blue|purple|brown|black' },
    template_image_url: { type: 'string',  supabaseType: 'TEXT',    required: true },
    fields:             { type: 'json',    supabaseType: 'JSONB',   required: true,  default: '[]', description: 'Array of TemplateFieldConfig objects with x,y coords' },
    use_qr_code:        { type: 'boolean', supabaseType: 'BOOLEAN', required: false, default: false },
    created_at:         { type: 'date',    supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
    updated_at:         { type: 'date',    supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  indexes: ['idx_template_program_belt ON (program_id, COALESCE(belt_level, \'__NULL__\'))'],
  notes: 'Unique constraint: one template per program+belt combination. RLS: public can read.',
}
