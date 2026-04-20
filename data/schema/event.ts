import type { EntitySchema } from './types'

/**
 * Schema: event (local JSON seed data)
 * Source: data/seed/events.ts
 */
export const eventSchema: EntitySchema = {
  entity: 'Event',
  tableName: 'events',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:             { type: 'string',  required: true, unique: true },
    slug:           { type: 'string',  required: true, unique: true },
    name:           { type: 'string',  required: true },
    type:           { type: 'enum',    required: true, enumValues: ['tournament', 'seminar', 'pelt-exam', 'grading', 'camp', 'fun'], description: 'From EVENT_TYPES constant' },
    status:         { type: 'enum',    required: true, enumValues: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'], description: 'From EVENT_STATUSES constant' },
    date:           { type: 'date',    required: true },
    endDate:        { type: 'date',    required: false },
    venue:          { type: 'string',  required: true },
    city:           { type: 'string',  required: true },
    description:    { type: 'string',  required: true },
    coverImageUrl:  { type: 'string',  required: false },
    hostingBranch:  { type: 'string',  required: true, references: 'dojos.id', description: 'FK → dojo hosting this event' },
    maxCapacity:    { type: 'number',  required: false },
    registeredCount: { type: 'number', required: false, default: 0 },
    isFeatured:     { type: 'boolean', required: false, default: false },
    createdAt:      { type: 'date',    required: true },
    updatedAt:      { type: 'date',    required: true },
  },
  notes: 'Seed data in data/seed/events.ts. Repository: lib/server/repositories/events.ts (merges with tournaments). Types from lib/types/event.ts.',
}
