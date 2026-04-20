import type { EntitySchema } from './types'

/**
 * Schema: portalSession
 * Source: lib/server/auth_legacy.js → createJWT() + /types/index.ts JWTPayload
 * Storage: JWT cookie (not persisted in DB)
 *
 * Auth Flow:
 *   1. User submits SKF ID + Date of Birth to POST /api/auth/portal
 *   2. Server looks up athlete by registrationNumber in local JSON store
 *   3. Server compares dateOfBirth — if match, creates JWT
 *   4. JWT set as httpOnly cookie via buildPortalCookie()
 *
 * Multi-child: Parents access multiple children by phone number.
 *   getStudentsByPhone() returns all students sharing a phone → ChildSwitcher component.
 */
export const portalSessionSchema: EntitySchema = {
  entity: 'PortalSession',
  tableName: '_jwt_cookie',
  primaryKey: 'skfId',
  storage: 'local',
  fields: {
    skfId:       { type: 'string', required: true,  description: 'Student SKF ID — null only for admin users' },
    role:        { type: 'enum',   required: true,  enumValues: ['student', 'sensei', 'branch_admin', 'super_admin'] },
    branch:      { type: 'string', required: false, description: 'Student branch name' },
    batch:       { type: 'string', required: false, description: 'Class batch (Morning, Evening)' },
    belt:        { type: 'string', required: false, description: 'Current belt level' },
    name:        { type: 'string', required: true },
    parentPhone: { type: 'string', required: false, description: 'Parent phone — used for multi-child portal' },
    iat:         { type: 'number', required: true,  description: 'Issued At (JWT standard)' },
    exp:         { type: 'number', required: true,  description: 'Expires (JWT standard)' },
  },
  notes: 'Not a DB table — this is the JWT cookie payload shape (JWTPayload type in /types/index.ts). Cookie name and settings defined in auth_legacy.js buildPortalCookie().',
}
