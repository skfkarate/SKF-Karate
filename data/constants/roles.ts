/**
 * User Roles — Constants
 */

export const ROLES = Object.freeze({
  STUDENT: 'student',
  SENSEI: 'sensei',
  BRANCH_ADMIN: 'branch_admin',
  SUPER_ADMIN: 'super_admin',
} as const)

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export const ROLES_LIST = Object.values(ROLES)
