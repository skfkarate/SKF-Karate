import type { Branch, City } from '@/lib/classesData'

export type ClassBranchRecord = Branch & {
  citySlug: string
  cityName: string
  state: string
  venue: string
}

function normalizeKey(value: string) {
  return String(value || '').trim().toLowerCase()
}

function titleCase(value: string) {
  return String(value || '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function flattenClassBranches(cities: City[]): ClassBranchRecord[] {
  return cities.flatMap((city) =>
    city.branches.map((branch) => ({
      ...branch,
      citySlug: city.slug,
      cityName: city.name,
      state: city.state,
      venue: branch.address || branch.name,
    }))
  )
}

export function findClassBranchBySlug(cities: City[], branchSlug?: string | null) {
  const normalized = normalizeKey(String(branchSlug || ''))
  if (!normalized) return null

  return flattenClassBranches(cities).find((branch) => normalizeKey(branch.slug) === normalized) || null
}

export function findClassBranchByName(cities: City[], branchName?: string | null) {
  const normalized = normalizeKey(String(branchName || ''))
  if (!normalized) return null

  return flattenClassBranches(cities).find((branch) => normalizeKey(branch.name) === normalized) || null
}

export function resolveClassBranchLabel(cities: City[], branchValue?: string | null) {
  const rawValue = String(branchValue || '').trim()
  if (!rawValue) return ''

  const matchedBySlug = findClassBranchBySlug(cities, rawValue)
  if (matchedBySlug) return matchedBySlug.name

  const matchedByName = findClassBranchByName(cities, rawValue)
  if (matchedByName) return matchedByName.name

  return titleCase(rawValue)
}
