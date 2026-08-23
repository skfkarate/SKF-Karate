/**
 * Branch Constants — single source of truth for all active branch slugs.
 */

export const BRANCH_SLUGS = [
  'mp-sports-club',
  'herohalli',
  'kunigal',
  'tumkur-main',
  'udupi-main',
] as const

export type BranchSlug = typeof BRANCH_SLUGS[number]

export const BRANCH_SLUGS_SET = new Set<string>(BRANCH_SLUGS)

/** Map slug to human-readable label */
export const BRANCH_LABELS: Record<BranchSlug, string> = {
  'mp-sports-club': 'M P Sports Club',
  'herohalli': 'Herohalli',
  'kunigal': 'Kunigal',
  'tumkur-main': 'Tumkur',
  'udupi-main': 'Udupi',
}

/**
 * Branches that run entirely on their own: fees, timetable, and credits are
 * managed locally by the branch, so the athlete portal must not show those
 * sections. Matches any name/slug variant ('Kunigal', 'kunigal-main', …).
 */
export function normalizeBranchKey(value?: string | null): string {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

const EXTERNALLY_MANAGED_BRANCH_KEYS = new Set(['kunigal', 'kunigalmain'])

export function isExternallyManagedBranch(value?: string | null): boolean {
  const key = normalizeBranchKey(value)
  return key.length > 0 && (
    EXTERNALLY_MANAGED_BRANCH_KEYS.has(key) ||
    key.startsWith('kunigal') ||
    key.endsWith('kunigal')
  )
}

/** Portal sections hidden for externally-managed branches. */
export const EXTERNALLY_MANAGED_PORTAL_HREFS = [
  '/portal/fees',
  '/portal/timetable',
  '/portal/credits',
  '/portal/blackbelt',
] as const

/** True when the request path is a portal section hidden for externally-managed branches. */
export function isExternallyManagedPortalPath(pathname: string): boolean {
  const normalized = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return (EXTERNALLY_MANAGED_PORTAL_HREFS as readonly string[]).includes(normalized)
}
