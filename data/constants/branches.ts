/**
 * Branch Constants — single source of truth for all active branch slugs.
 */

export const BRANCH_SLUGS = [
  'mp-sports-club',
  'herohalli',
  'kunigal-main',
  'tumkur-main',
  'udupi-main',
] as const

export type BranchSlug = typeof BRANCH_SLUGS[number]

export const BRANCH_SLUGS_SET = new Set<string>(BRANCH_SLUGS)

/** Map slug to human-readable label */
export const BRANCH_LABELS: Record<BranchSlug, string> = {
  'mp-sports-club': 'M P Sports Club',
  'herohalli': 'Herohalli',
  'kunigal-main': 'Kunigal',
  'tumkur-main': 'Tumkur',
  'udupi-main': 'Udupi',
}
