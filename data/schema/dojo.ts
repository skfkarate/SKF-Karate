import type { EntitySchema } from './types'

/**
 * Schema: dojo (local JSON seed data)
 * Source: data/seed/dojos.ts
 */
export const dojoSchema: EntitySchema = {
  entity: 'Dojo',
  tableName: 'dojos',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:        { type: 'string',  required: true, unique: true, description: 'Slug-based ID (e.g. koramangala, central)' },
    name:      { type: 'string',  required: true },
    address:   { type: 'string',  required: true },
    city:      { type: 'string',  required: true },
    state:     { type: 'string',  required: true },
    phone:     { type: 'string',  required: true },
    email:     { type: 'string',  required: false },
    mapUrl:    { type: 'string',  required: false },
    imageUrl:  { type: 'string',  required: false },
    senseiId:  { type: 'string',  required: true, references: 'instructors.id', description: 'FK → instructor who leads this dojo' },
    schedule:  { type: 'array',   required: false, description: 'ClassSchedule[]' },
  },
  notes: 'Seed data in data/seed/dojos.ts. Used by events.hostingBranch, testimonials.branch, athletes.branchName.',
}
