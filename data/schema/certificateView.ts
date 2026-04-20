import type { EntitySchema } from './types'

/**
 * Schema: certificate_views
 * Source: database/supabase_certificates.sql (NOT in main SUPABASE_SCHEMA.sql)
 * Purpose: Tracks certificate view and download events for analytics
 */
export const certificateViewSchema: EntitySchema = {
  entity: 'CertificateView',
  tableName: 'certificate_views',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:              { type: 'uuid',   supabaseType: 'UUID',        required: true,  default: 'uuid_generate_v4()' },
    skf_id:          { type: 'string', supabaseType: 'TEXT',        required: true },
    enrollment_id:   { type: 'uuid',   supabaseType: 'UUID',        required: true,  references: 'enrollments.id', description: 'FK → enrollments. ON DELETE CASCADE' },
    viewed_at:       { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
    downloaded_at:   { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false },
    download_format: { type: 'enum',   supabaseType: 'TEXT',        required: false, enumValues: ['pdf', 'png'] },
  },
  indexes: [
    'idx_cert_views_skf ON (skf_id)',
    'idx_cert_views_date ON (viewed_at)',
  ],
  notes: 'RLS: Service role only. Mirrors lib/types/certificates.ts CertificateView interface.',
}
