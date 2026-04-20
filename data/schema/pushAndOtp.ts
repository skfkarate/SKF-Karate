import type { EntitySchema } from './types'

/**
 * Schema: push_subscriptions
 * Source: SUPABASE_SCHEMA.sql (table 7)
 * Purpose: Web Push notification subscriptions (Phase 6 feature)
 */
export const pushSubscriptionSchema: EntitySchema = {
  entity: 'PushSubscription',
  tableName: 'push_subscriptions',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:           { type: 'uuid',   supabaseType: 'UUID',        required: true,  default: 'gen_random_uuid()' },
    skf_id:       { type: 'string', supabaseType: 'TEXT',        required: true,  unique: true },
    branch:       { type: 'string', supabaseType: 'TEXT',        required: false },
    subscription: { type: 'json',   supabaseType: 'JSONB',       required: true,  description: 'PushSubscription object from browser Push API' },
    created_at:   { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  notes: 'Future feature placeholder. UNIQUE on skf_id.',
}

/**
 * Schema: otp_attempts
 * Source: SUPABASE_SCHEMA.sql (table 8)
 * Purpose: OTP verification (future placeholder)
 */
export const otpAttemptSchema: EntitySchema = {
  entity: 'OtpAttempt',
  tableName: 'otp_attempts',
  primaryKey: 'id',
  storage: 'supabase',
  rls: false,
  fields: {
    id:         { type: 'uuid',   supabaseType: 'UUID',        required: true,  default: 'gen_random_uuid()' },
    phone:      { type: 'string', supabaseType: 'TEXT',        required: true },
    otp_hash:   { type: 'string', supabaseType: 'TEXT',        required: true },
    expires_at: { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: true },
    attempts:   { type: 'number', supabaseType: 'INTEGER',     required: false, default: 0 },
    created_at: { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  notes: 'Future placeholder — not currently used by any API route.',
}
