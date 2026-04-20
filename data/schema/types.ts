/**
 * Schema Definition Types
 *
 * Two schema systems co-exist:
 * 1. SUPABASE schemas — mirror real Postgres tables (ground truth: SUPABASE_SCHEMA.sql + database/supabase_certificates.sql)
 * 2. LOCAL schemas — describe JSON-store entities (persisted to .data/*.json via data-store.ts)
 *
 * Both use the same SchemaField shape for consistency.
 */

/* ── Field-level types ── */

export interface SchemaField {
  /** TypeScript type */
  type: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'enum' | 'json' | 'array' | 'object'
  /** Exact Postgres type from SQL (null for local-only entities) */
  supabaseType?: string
  required: boolean
  default?: unknown
  unique?: boolean
  /** FK reference in 'table.column' format */
  references?: string | null
  enumValues?: readonly string[] | string[] | null
  description?: string
}

export interface RelationshipDef {
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY' | 'SELF_REF'
  from: string
  to: string
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT'
  description?: string
}

/* ── Entity-level types ── */

export interface EntitySchema {
  entity: string
  tableName: string
  primaryKey: string
  /** 'supabase' = backed by real Postgres table, 'local' = JSON file, 'sheets' = Google Sheets */
  storage: 'supabase' | 'local' | 'sheets'
  fields: Record<string, SchemaField>
  indexes?: string[]
  rls?: boolean
  relationships?: Record<string, RelationshipDef>
  notes?: string
}
