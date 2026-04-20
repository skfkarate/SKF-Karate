import type { EntitySchema } from './types'

/**
 * Schema: certificate_events
 * Source: SUPABASE_SCHEMA.sql (table 5) + database/supabase_certificates.sql
 * Purpose: Audit + analytics for certificate interactions
 */
export const certificateEventSchema: EntitySchema = {
  entity: 'CertificateEvent',
  tableName: 'certificate_events',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:            { type: 'uuid',   supabaseType: 'UUID',        required: true,  default: 'gen_random_uuid()' },
    skf_id:        { type: 'string', supabaseType: 'TEXT',        required: true },
    enrollment_id: { type: 'uuid',   supabaseType: 'UUID',        required: true,  references: 'enrollments.id' },
    event_type:    { type: 'enum',   supabaseType: 'TEXT',        required: true,  enumValues: ['viewed', 'downloaded_pdf', 'downloaded_png', 'verified', 'shared'] },
    ip_address:    { type: 'string', supabaseType: 'TEXT',        required: false },
    created_at:    { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  indexes: ['idx_cert_events_skf ON (skf_id)'],
  notes: 'RLS: Anyone can insert events. Service role has full access.',
}
