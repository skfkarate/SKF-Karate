import type { EntitySchema } from './types'

/**
 * Schema: instructor (local JSON seed data)
 * Source: data/seed/instructors.ts
 */
export const instructorSchema: EntitySchema = {
  entity: 'Instructor',
  tableName: 'instructors',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:              { type: 'string',  required: true, unique: true, description: 'Prefixed ID (ins_001..011)' },
    name:            { type: 'string',  required: true },
    title:           { type: 'string',  required: true, description: 'e.g. Sensei, Chief Instructor, President' },
    rank:            { type: 'string',  required: true, description: 'e.g. 5th Dan, 3rd Dan' },
    bio:             { type: 'string',  required: true },
    photoUrl:        { type: 'string',  required: false },
    specializations: { type: 'array',   required: false, description: 'string[] of specialties' },
    dojoSlug:        { type: 'string',  required: false, references: 'dojos.id', description: 'FK → dojo this instructor teaches at' },
    role:            { type: 'string',  required: false, description: 'Organizational role (executive, instructor)' },
    order:           { type: 'number',  required: false, description: 'Display order' },
  },
  notes: 'Seed data in data/seed/instructors.ts. 11 records: 5 executive committee + 6 branch senseis.',
}
