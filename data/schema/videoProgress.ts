import type { EntitySchema } from './types'

/**
 * Schema: video_progress
 * Source: SUPABASE_SCHEMA.sql (table 6)
 * Purpose: Tracks per-student video watch progress
 */
export const videoProgressSchema: EntitySchema = {
  entity: 'VideoProgress',
  tableName: 'video_progress',
  primaryKey: 'id',
  storage: 'supabase',
  rls: true,
  fields: {
    id:              { type: 'uuid',    supabaseType: 'UUID',        required: true,  default: 'gen_random_uuid()' },
    skf_id:          { type: 'string',  supabaseType: 'TEXT',        required: true },
    video_id:        { type: 'string',  supabaseType: 'TEXT',        required: true },
    watched_percent: { type: 'number',  supabaseType: 'INTEGER',     required: false, default: 0, description: 'CHECK (watched_percent BETWEEN 0 AND 100)' },
    completed:       { type: 'boolean', supabaseType: 'BOOLEAN',     required: false, default: false },
    last_watched:    { type: 'date',    supabaseType: 'TIMESTAMPTZ', required: false, default: 'NOW()' },
  },
  indexes: ['UNIQUE(skf_id, video_id)'],
  notes: 'Used by /api/portal/videos/progress/route.js. Videos themselves live in Google Sheets.',
}
