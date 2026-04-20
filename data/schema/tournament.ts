import type { EntitySchema } from './types'

/**
 * Schema: tournament (local JSON store)
 * Source: lib/server/repositories/tournaments.ts
 * Purpose: Tournament events with participants, winners, and results
 */
export const tournamentSchema: EntitySchema = {
  entity: 'Tournament',
  tableName: 'tournaments',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:                { type: 'string',  required: true },
    slug:              { type: 'string',  required: true,  unique: true },
    name:              { type: 'string',  required: true },
    shortName:         { type: 'string',  required: true },
    level:             { type: 'enum',    required: true,  enumValues: ['inter-dojo', 'district', 'state', 'national', 'international'] },
    date:              { type: 'date',    required: true },
    endDate:           { type: 'date',    required: false },
    venue:             { type: 'string',  required: true },
    city:              { type: 'string',  required: true },
    state:             { type: 'string',  required: true },
    description:       { type: 'string',  required: true },
    coverImageUrl:     { type: 'string',  required: false },
    totalParticipants: { type: 'number',  required: true },
    skfParticipants:   { type: 'number',  required: true },
    medals:            { type: 'object',  required: true,  description: '{ gold: number, silver: number, bronze: number }' },
    affiliatedBody:    { type: 'string',  required: false },
    status:            { type: 'enum',    required: true,  enumValues: ['draft', 'upcoming', 'ongoing', 'completed', 'archived'] },
    isPublished:       { type: 'boolean', required: true },
    isFeatured:        { type: 'boolean', required: true },
    resultsAppliedAt:  { type: 'date',    required: false },
    participants:      { type: 'array',   required: true,  description: 'TournamentParticipant[]' },
    winners:           { type: 'array',   required: true,  description: 'TournamentWinner[]' },
    results:           { type: 'array',   required: false, description: 'TournamentResultRecord[]' },
    createdAt:         { type: 'date',    required: true },
    updatedAt:         { type: 'date',    required: true },
  },
  notes: 'Repository: lib/server/repositories/tournaments.ts. Persists to .data/tournaments.json. Types from lib/types/tournament.ts.',
}
