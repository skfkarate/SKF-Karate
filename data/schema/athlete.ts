import type { EntitySchema } from './types'

/**
 * Schema: athlete (local JSON store)
 * Source: lib/server/repositories/athletes.ts
 *
 * CRITICAL: Athlete and Student are the SAME person in two different stores:
 * - Athlete lives in .data/athletes.json (public profile, achievements, rankings)
 * - Student lives in Google Sheets Students tab (identity, fees, portal auth)
 *
 * The link is: athlete.registrationNumber === student.skfId
 *
 * Portal Auth: Login uses skfId + dateOfBirth.
 * dateOfBirth is the auth credential — treat with password-level sensitivity.
 * Never expose in public API responses or client-side logs.
 */
export const athleteSchema: EntitySchema = {
  entity: 'Athlete',
  tableName: 'athletes',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:                 { type: 'string',  required: true,  description: 'Prefixed ID (athlete_xxx)' },
    registrationNumber: { type: 'string',  required: true,  unique: true, description: 'SKF ID (format: SKF-YYYY-XXXX). Links to Student.skfId in Sheets.' },
    firstName:          { type: 'string',  required: true },
    lastName:           { type: 'string',  required: true },
    dateOfBirth:        { type: 'date',    required: true,  description: 'YYYY-MM-DD. PORTAL AUTH CREDENTIAL — never expose in public API responses.' },
    gender:             { type: 'enum',    required: true,  enumValues: ['male', 'female'] },
    photoUrl:           { type: 'string',  required: false, description: 'Empty string for initials-based avatars' },
    branchName:         { type: 'string',  required: true,  description: 'Branch name string (e.g. Sunkadakatte) — maps to dojo' },
    currentBelt:        { type: 'string',  required: true,  description: 'e.g. white, yellow, black-2nd-dan' },
    joinDate:           { type: 'date',    required: true },
    status:             { type: 'enum',    required: true,  enumValues: ['active', 'inactive'] },
    pointsBalance:      { type: 'number',  required: true,  default: 0 },
    pointsLifetime:     { type: 'number',  required: true,  default: 0 },
    isPublic:           { type: 'boolean', required: true,  default: true },
    isFeatured:         { type: 'boolean', required: true,  default: false },
    achievements:       { type: 'array',   required: true,  description: 'Achievement[] — belt gradings, tournament medals, etc.' },
    pointsHistory:      { type: 'array',   required: true,  description: 'PointsHistoryEntry[]' },
    /* Fields referenced in sheets.ts fallback but may not be on all records */
    parentName:         { type: 'string',  required: false, description: 'For junior athletes — populated from Sheets fallback' },
    phone:              { type: 'string',  required: false, description: 'Parent phone — from Sheets fallback' },
    createdAt:          { type: 'date',    required: true },
    updatedAt:          { type: 'date',    required: true },
  },
  notes: 'Repository: lib/server/repositories/athletes.ts. Persists to .data/athletes.json. The getStudentBySkfId function in sheets.ts falls back to this store when Sheets is unavailable.',
}
