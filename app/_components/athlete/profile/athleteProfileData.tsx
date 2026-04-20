/**
 * Athlete Profile Data Builder
 *
 * All raw mock data arrays (categories, beltExaminations, specialEvents, etc.)
 * are now stored centrally in lib/data/athleteProfileMockData.ts.
 * This file only contains the transformation / builder logic.
 */

import {
  DEFAULT_PROFILE_PHOTO,
  DEFAULT_COUNTRY_FLAG,
  BRANCH_COACHES,
  nextEvents,
  categories,
  beltExaminations,
  specialEvents,
  beltColors,
} from '@/data/mocks/athleteProfileMockData'

export { beltColors }

function clone(value: any) {
  return JSON.parse(JSON.stringify(value))
}

function formatBeltLabel(value: string) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return 0
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }

  return age
}

function formatLongDate(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function normaliseGenderCategories(profileCategories: any[], gender: string) {
  const genderLabel = gender === 'male' ? 'Male' : 'Female'

  return profileCategories.map((category) => ({
    ...category,
    name: category.name.replace(/Female/g, genderLabel),
    results: category.results.map((result: any) => ({
      ...result,
      category: result.category.replace(/Female/g, genderLabel),
    })),
  }))
}

export function buildAthleteProfileData(athlete: any, rankInfo: any) {
  const profileCategories = normaliseGenderCategories(clone(categories), athlete.gender || 'male')
  const totalGolds = profileCategories.reduce((sum: number, category: any) => sum + category.honours.reduce((acc: number, honour: any) => acc + honour.gold, 0), 0)
  const totalSilvers = profileCategories.reduce((sum: number, category: any) => sum + category.honours.reduce((acc: number, honour: any) => acc + honour.silver, 0), 0)
  const totalBronzes = profileCategories.reduce((sum: number, category: any) => sum + category.honours.reduce((acc: number, honour: any) => acc + honour.bronze, 0), 0)
  const totalEvents = profileCategories.reduce((sum: number, category: any) => sum + category.results.length, 0)
  const totalMedals = totalGolds + totalSilvers + totalBronzes
  const activePoints = Number(rankInfo?.totalPoints || profileCategories[0]?.points || athlete.pointsBalance || 0)
  const lifetimePoints = Number(athlete.pointsLifetime || activePoints || 0)
  const totalBouts = Math.max(48, totalEvents * 3 + Math.round(totalMedals * 1.5))
  const winRate = `${Math.min(92, 63 + Math.round((totalGolds / Math.max(totalMedals, 1)) * 22))}.0%`
  const primaryCategory = profileCategories.find((category: any) => category.isPrimary) || profileCategories[0]

  return {
    athlete: {
      name: `${athlete.firstName} ${athlete.lastName}`.trim().toUpperCase(),
      shortName: `${athlete.firstName} ${athlete.lastName}`.trim(),
      photo: athlete.photoUrl || DEFAULT_PROFILE_PHOTO,
      country: 'INDIA',
      countryFlag: DEFAULT_COUNTRY_FLAG,
      id: athlete.registrationNumber,
      age: calculateAge(athlete.dateOfBirth),
      totalBouts,
      winRate,
      branchName: athlete.branchName,
      currentBelt: formatBeltLabel(athlete.currentBelt),
      status: athlete.status || 'Active',
      joinedOn: formatLongDate(athlete.joinDate),
      dateOfBirth: formatLongDate(athlete.dateOfBirth),
      overallRank: rankInfo?.overallRank || primaryCategory.rank || null,
      branchRank: rankInfo?.branchRank || null,
      activePoints,
      lifetimePoints,
      totalMedals,
      coachName: BRANCH_COACHES[athlete.branchName as keyof typeof BRANCH_COACHES] || 'Sensei SKF',
      biography: `${athlete.firstName} trains at SKF ${athlete.branchName} and this dedicated athlete page uses the restored mock profile data set to preview rankings, honours, belts, and event history for the selected athlete.`,
    },
    primaryCategory,
    categories: profileCategories,
    nextEvents: clone(nextEvents),
    beltExaminations: Array.isArray(athlete.achievements) && athlete.achievements.length > 0
      ? athlete.achievements
          .filter((a: any) => a.type === 'belt-grading' || a.type === 'enrollment')
          .map((a: any) => ({
            id: a.id,
            date: a.date,
            belt: formatBeltLabel(a.beltEarned || athlete.currentBelt || 'white'),
            grade: a.title || 'Grading',
            examiner: a.examiner || 'Sensei Arvind',
            result: 'Pass',
            dojo: athlete.branchName
          }))
      : clone(beltExaminations),
    specialEvents: clone(specialEvents),
    totals: {
      totalGolds,
      totalSilvers,
      totalBronzes,
      totalMedals,
      totalEvents,
    },
  }
}

export function buildRestoredAthleteProfileData(athlete: any, rankInfo: any) {
  const profile = buildAthleteProfileData(athlete, rankInfo)
  const primaryCategory = profile.primaryCategory
  const activePoints = Number(rankInfo?.totalPoints || primaryCategory?.points || athlete.pointsBalance || 0)

  const legacyCategories = clone(profile.categories)
  if (legacyCategories[0]) {
    legacyCategories[0].points = activePoints
    if (rankInfo?.overallRank) {
      legacyCategories[0].rank = rankInfo.overallRank
    }
  }

  return {
    athleteInfo: {
      name: profile.athlete.name,
      photo: profile.athlete.photo,
      country: profile.athlete.country,
      countryFlag: profile.athlete.countryFlag,
      id: profile.athlete.id,
      age: profile.athlete.age,
      totalBouts: profile.athlete.totalBouts,
      winRate: profile.athlete.winRate,
      branchName: profile.athlete.branchName,
      branchSlug: profile.athlete.branchName?.toLowerCase().replace(/\s+/g, '-') || 'mp-sports-club',
    },
    categories: legacyCategories,
    nextEvents: clone(profile.nextEvents),
    beltExaminations: clone(profile.beltExaminations),
    specialEvents: clone(profile.specialEvents),
    beltColors,
  }
}
