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
    skf_id:       { type: 'string', supabaseType: 'TEXT',        required: false },
    branch:       { type: 'string', supabaseType: 'TEXT',        required: false },
    subscription: { type: 'json',   supabaseType: 'JSONB',       required: true,  description: 'PushSubscription object from browser Push API' },
    endpoint:     { type: 'string', supabaseType: 'TEXT',        required: false, description: 'Push endpoint URL, unique for staff subscriptions' },
    audience:     { type: 'string', supabaseType: 'TEXT',        required: true,  default: "'student'", description: "'student' or 'feetrack_staff'" },
    staff_id:     { type: 'string', supabaseType: 'TEXT',        required: false },
    user_agent:   { type: 'string', supabaseType: 'TEXT',        required: false },
    last_seen_at: { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false },
    created_at:   { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
    updated_at:   { type: 'date',   supabaseType: 'TIMESTAMPTZ', required: true,  default: 'NOW()' },
  },
  notes: 'Unique index on endpoint (partial, WHERE endpoint IS NOT NULL). Supports both student and staff push subscriptions.',
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
