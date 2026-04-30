import {
  createAthleteLive,
  getAthleteByIdLive,
  updateAthleteLive,
} from './repositories/athletes-live'
import { getAllSenseisLive } from './repositories/senseis-live'
import type { SenseiProfile } from '@/lib/types/sensei'

type SenseiRecord = SenseiProfile

const MIRROR_PREFIX = 'athlete_sensei_'

function normalizeSenseiName(value: string) {
  return String(value || '')
    .trim()
    .replace(/^sensei\s+/i, '')
    .replace(/^renshi\s+/i, '')
    .replace(/\s+/g, ' ')
}

function splitName(name: string) {
  const normalized = normalizeSenseiName(name)
  const parts = normalized.split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return { firstName: 'SKF', lastName: 'Sensei' }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function parseDanOrder(dan: string) {
  const normalized = String(dan || '').trim().toLowerCase()

  if (!normalized) return null
  if (normalized.includes('5th') || normalized.includes('godan')) return 5
  if (normalized.includes('4th') || normalized.includes('yondan')) return 4
  if (normalized.includes('3rd') || normalized.includes('sandan')) return 3
  if (normalized.includes('2nd') || normalized.includes('nidan')) return 2
  if (normalized.includes('1st') || normalized.includes('shodan')) return 1
  if (normalized.includes('black belt')) return 0

  return null
}

function isBelowThirdDanSensei(sensei: SenseiRecord) {
  const danOrder = parseDanOrder(sensei.dan)
  return danOrder !== null && danOrder < 3
}

function mapSenseiDanToBelt(dan: string) {
  const danOrder = parseDanOrder(dan)

  if (danOrder === 2) return 'black-2nd-dan'
  if (danOrder === 1) return 'black-1st-dan'
  if (danOrder === 0) return 'black-1st-dan'

  return null
}

function inferJoinDate(sensei: SenseiRecord) {
  const experience = String(sensei.experience || '')
  const yearsMatch = experience.match(/(\d+)\s*\+?\s*years?/i)

  if (!yearsMatch) {
    return '2018-01-01'
  }

  const years = Number.parseInt(yearsMatch[1] || '0', 10)
  const date = new Date()
  date.setFullYear(date.getFullYear() - Math.max(0, years))

  return date.toISOString().split('T')[0]
}

function buildMirrorId(senseiId: string) {
  return `${MIRROR_PREFIX}${senseiId}`
}

function buildStarterAchievements(sensei: SenseiRecord, currentBelt: string, joinDate: string) {
  return [
    {
      id: `ach_${sensei.id}_belt_sync`,
      type: 'belt-grading',
      date: joinDate,
      title: `${sensei.dan} profile synced from Sensei directory`,
      description: 'Initial Sensei mirror record for public athlete profile visibility.',
      beltEarned: currentBelt,
      pointsAwarded: 0,
      awardedBy: 'SKF Sensei Directory',
    },
  ]
}

export async function syncBelowThirdDanSenseiAthletes(options: { revalidate?: boolean } = {}) {
  const shouldRevalidate = options.revalidate !== false
  const senseis = await getAllSenseisLive()
  const eligibleSenseis = senseis.filter(
    (sensei) => sensei.isActive !== false && sensei.isPublic !== false && isBelowThirdDanSensei(sensei)
  )
  const updatedRegistrationNumbers: string[] = []

  for (const sensei of eligibleSenseis) {
    const mirrorId = buildMirrorId(String(sensei.id))
    const existingAthlete = await getAthleteByIdLive(mirrorId)
    const belt = mapSenseiDanToBelt(sensei.dan)

    if (!belt) continue

    const branchName =
      sensei.assignments?.[0]?.branchName ||
      existingAthlete?.branchName ||
      'SKF Karate'
    const joinDate = existingAthlete?.joinDate || inferJoinDate(sensei)
    const { firstName, lastName } = splitName(sensei.name)
    const achievements =
      Array.isArray(existingAthlete?.achievements) && existingAthlete.achievements.length > 0
        ? existingAthlete.achievements
        : buildStarterAchievements(sensei, belt, joinDate)

    const payload = {
      ...existingAthlete,
      id: mirrorId,
      firstName,
      lastName,
      dateOfBirth: existingAthlete?.dateOfBirth || '1990-01-01',
      gender: existingAthlete?.gender || 'other',
      photoUrl: sensei.imageUrl || existingAthlete?.photoUrl || '',
      branchName,
      currentBelt: belt,
      joinDate,
      status: 'active',
      parentName: existingAthlete?.parentName || '',
      phone: existingAthlete?.phone || '',
      email: existingAthlete?.email || '',
      isPublic: existingAthlete?.isPublic ?? true,
      isFeatured: existingAthlete?.isFeatured ?? false,
      achievements,
      pointsHistory: existingAthlete?.pointsHistory || [],
      pointsBalance: existingAthlete?.pointsBalance || 0,
      pointsLifetime: existingAthlete?.pointsLifetime || 0,
    }

    const athlete = existingAthlete
      ? await updateAthleteLive(mirrorId, payload)
      : await createAthleteLive(payload)

    if (athlete?.registrationNumber) {
      updatedRegistrationNumbers.push(athlete.registrationNumber)
    }
  }

  if (shouldRevalidate) {
    const { revalidateAthleteSitePaths } = await import('./revalidation')
    for (const registrationNumber of updatedRegistrationNumbers) {
      revalidateAthleteSitePaths(registrationNumber)
    }
  }

  return {
    syncedCount: updatedRegistrationNumbers.length,
    registrationNumbers: updatedRegistrationNumbers,
  }
}
