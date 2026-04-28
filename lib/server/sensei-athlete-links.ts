import { getAllAthletesLive } from './repositories/athletes-live'
import { getAllSenseisLive } from './repositories/senseis-live'

const MIRROR_PREFIX = 'athlete_sensei_'
const CACHE_TTL_MS = 60_000

type SenseiLike = {
  id?: string | null
  slug?: string | null
  name?: string | null
}

type AthleteLike = {
  id?: string | null
  registrationNumber?: string | null
  firstName?: string | null
  lastName?: string | null
}

type SenseiAthleteLookup = {
  expiresAt: number
  bySlug: Map<string, string>
  byId: Map<string, string>
  byName: Map<string, string>
  byFirstName: Map<string, string>
}

let cachedLookup: SenseiAthleteLookup | null = null

function normalizeSenseiToken(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^sensei\s+/i, '')
    .replace(/^renshi\s+/i, '')
    .replace(/^dr\.\s+/i, '')
    .replace(/^dr\s+/i, '')
    .replace(/\s+/g, ' ')
}

function normalizeSlug(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function getAthleteProfileHref(athlete: AthleteLike | null | undefined) {
  const registrationNumber = String(athlete?.registrationNumber || '').trim()
  if (!registrationNumber) return null
  return `/athlete/${registrationNumber}`
}

function getAthleteName(athlete: AthleteLike | null | undefined) {
  return [athlete?.firstName, athlete?.lastName].filter(Boolean).join(' ').trim()
}

function buildAthleteIndexes(athletes: AthleteLike[]) {
  const byId = new Map<string, string>()
  const byName = new Map<string, string>()
  const byFirstName = new Map<string, string>()
  const duplicateFirstNames = new Set<string>()

  for (const athlete of athletes) {
    const href = getAthleteProfileHref(athlete)
    if (!href) continue

    const athleteId = String(athlete.id || '').trim()
    if (athleteId) {
      byId.set(athleteId, href)
    }

    const nameKey = normalizeSenseiToken(getAthleteName(athlete))
    if (nameKey && !byName.has(nameKey)) {
      byName.set(nameKey, href)
    }

    const firstNameKey = normalizeSenseiToken(String(athlete.firstName || ''))
    if (firstNameKey) {
      const existing = byFirstName.get(firstNameKey)
      if (existing && existing !== href) {
        duplicateFirstNames.add(firstNameKey)
      } else if (!existing) {
        byFirstName.set(firstNameKey, href)
      }
    }
  }

  for (const key of duplicateFirstNames) {
    byFirstName.delete(key)
  }

  return { byId, byName, byFirstName }
}

function resolveSenseiToAthleteHref(
  sensei: SenseiLike,
  indexes: {
    byId: Map<string, string>
    byName: Map<string, string>
    byFirstName: Map<string, string>
  }
) {
  const senseiId = String(sensei.id || '').trim()
  if (senseiId) {
    const mirroredAthleteHref = indexes.byId.get(`${MIRROR_PREFIX}${senseiId}`)
    if (mirroredAthleteHref) return mirroredAthleteHref

    const directAthleteHref = indexes.byId.get(senseiId)
    if (directAthleteHref) return directAthleteHref
  }

  const nameKey = normalizeSenseiToken(sensei.name)
  if (nameKey) {
    const byName = indexes.byName.get(nameKey)
    if (byName) return byName

    const firstNameKey = nameKey.split(' ')[0] || ''
    if (firstNameKey && indexes.byFirstName.has(firstNameKey)) {
      return indexes.byFirstName.get(firstNameKey) || null
    }

    for (const [athleteNameKey, href] of indexes.byName.entries()) {
      if (athleteNameKey.startsWith(nameKey) || nameKey.startsWith(athleteNameKey)) {
        return href
      }
    }
  }

  return null
}

async function buildLookup(): Promise<SenseiAthleteLookup> {
  const [athletes, senseis] = await Promise.all([getAllAthletesLive(), getAllSenseisLive()])
  const indexes = buildAthleteIndexes((athletes || []) as AthleteLike[])

  const bySlug = new Map<string, string>()
  const byId = new Map<string, string>()
  const byName = new Map<string, string>()
  const byFirstName = new Map<string, string>()

  for (const sensei of (senseis || []) as SenseiLike[]) {
    const href = resolveSenseiToAthleteHref(sensei, indexes)
    if (!href) continue

    const slugKey = normalizeSlug(sensei.slug)
    if (slugKey) {
      bySlug.set(slugKey, href)
    }

    const idKey = String(sensei.id || '').trim()
    if (idKey) {
      byId.set(idKey, href)
    }

    const nameKey = normalizeSenseiToken(sensei.name)
    if (nameKey) {
      byName.set(nameKey, href)

      const firstNameKey = nameKey.split(' ')[0] || ''
      if (firstNameKey && !byFirstName.has(firstNameKey)) {
        byFirstName.set(firstNameKey, href)
      }
    }
  }

  return {
    expiresAt: Date.now() + CACHE_TTL_MS,
    bySlug,
    byId,
    byName,
    byFirstName,
  }
}

async function getLookup(forceFresh = false) {
  const now = Date.now()
  if (!forceFresh && cachedLookup && cachedLookup.expiresAt > now) {
    return cachedLookup
  }

  cachedLookup = await buildLookup()
  return cachedLookup
}

export async function getSenseiAthleteHrefMap() {
  const lookup = await getLookup()
  return new Map(lookup.bySlug)
}

export async function resolveAthleteHrefForSensei(input: SenseiLike) {
  const lookup = await getLookup()

  const slugKey = normalizeSlug(input.slug)
  if (slugKey && lookup.bySlug.has(slugKey)) {
    return lookup.bySlug.get(slugKey) || null
  }

  const idKey = String(input.id || '').trim()
  if (idKey && lookup.byId.has(idKey)) {
    return lookup.byId.get(idKey) || null
  }

  const nameKey = normalizeSenseiToken(input.name)
  if (nameKey && lookup.byName.has(nameKey)) {
    return lookup.byName.get(nameKey) || null
  }

  if (nameKey) {
    const firstNameKey = nameKey.split(' ')[0] || ''
    if (firstNameKey && lookup.byFirstName.has(firstNameKey)) {
      return lookup.byFirstName.get(firstNameKey) || null
    }
  }

  return null
}

export async function resolveAthleteHrefForSenseiSlug(slug: string) {
  return resolveAthleteHrefForSensei({ slug })
}

export function invalidateSenseiAthleteHrefCache() {
  cachedLookup = null
}
