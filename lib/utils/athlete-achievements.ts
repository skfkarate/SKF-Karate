export const INITIAL_WHITE_BELT_ACHIEVEMENT_ID = 'ach_initial_white_belt'

export type AthleteAchievementLike = Record<string, unknown> & {
  id?: string
  type?: string
  date?: string
  beltEarned?: string
  sourceEventId?: string
}

function toIsoDate(value?: string | null) {
  const raw = String(value || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const parsed = raw ? new Date(raw) : new Date()
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0]
  }

  return parsed.toISOString().split('T')[0]
}

export function isInitialWhiteBeltAchievement(achievement?: AthleteAchievementLike | null) {
  const type = String(achievement?.type || '').trim().toLowerCase()
  const id = String(achievement?.id || '').trim()
  const sourceEventId = String(achievement?.sourceEventId || '').trim()
  const beltEarned = String(achievement?.beltEarned || '').trim().toLowerCase()

  return (
    id === INITIAL_WHITE_BELT_ACHIEVEMENT_ID ||
    (type === 'enrollment' && !sourceEventId && (!beltEarned || beltEarned === 'white'))
  )
}

export function buildInitialWhiteBeltAchievement({
  joinDate,
  branchName,
}: {
  joinDate?: string | null
  branchName?: string | null
} = {}): AthleteAchievementLike {
  return {
    id: INITIAL_WHITE_BELT_ACHIEVEMENT_ID,
    type: 'enrollment',
    date: toIsoDate(joinDate),
    title: 'Joined SKF Karate',
    description: 'Started SKF Karate as a White Belt.',
    pointsAwarded: 50,
    beltEarned: 'white',
    grade: 'Enrollment',
    result: 'pass',
    awardedBy: 'SKF Karate',
    location: String(branchName || '').trim() || 'SKF Karate',
  }
}

export function ensureInitialWhiteBeltAchievement(
  achievements: unknown,
  options: {
    joinDate?: string | null
    branchName?: string | null
  } = {}
) {
  const existingAchievements = Array.isArray(achievements)
    ? achievements.filter(
        (achievement): achievement is AthleteAchievementLike =>
          Boolean(achievement) && typeof achievement === 'object'
      )
    : []
  const starter = buildInitialWhiteBeltAchievement(options)
  const nextAchievements: AthleteAchievementLike[] = []
  let hasStarter = false

  for (const achievement of existingAchievements) {
    if (!isInitialWhiteBeltAchievement(achievement)) {
      nextAchievements.push(achievement)
      continue
    }

    if (hasStarter) continue
    hasStarter = true
    nextAchievements.push({
      ...achievement,
      ...starter,
      id: String(achievement.id || starter.id),
      title: String(achievement.title || starter.title),
      description: String(achievement.description || starter.description),
      pointsAwarded: achievement.pointsAwarded ?? starter.pointsAwarded,
    })
  }

  if (!hasStarter) {
    return [starter, ...nextAchievements]
  }

  return nextAchievements
}
