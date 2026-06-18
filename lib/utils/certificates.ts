import type { Athlete, Achievement } from '@/data/types'

export const CERTIFICATE_TYPES = {
  BELT: "belt",
  PORTFOLIO: "portfolio",
}

export function createCertificateRecord({
  athlete,
  type,
  sourceId,
  issuedAt = new Date().toISOString(),
  status = "available",
}: {
  athlete: Athlete
  type: string
  sourceId: string
  issuedAt?: string
  status?: string
}) {
  return {
    id: `${type}_${athlete.id}_${sourceId}`,
    athleteId: athlete.id,
    skfId: athlete.skfId,
    type,
    sourceId,
    issuedAt,
    status,
  }
}

export function buildBeltCertificatePayload(athlete: Athlete, gradingAchievement: Achievement) {
  return {
    type: CERTIFICATE_TYPES.BELT,
    athleteName: `${athlete.firstName} ${athlete.lastName}`,
    skfId: athlete.skfId,
    belt: gradingAchievement.beltEarned || athlete.currentBelt,
    achievedAt: gradingAchievement.date,
    dojo: athlete.branchName,
    achievementTitle: gradingAchievement.title,
  }
}

export function buildAchievementPortfolioPayload(athlete: Athlete, rankingEntry: { totalPoints?: number; overallRank?: number } | null = null) {
  const achievements = athlete.achievements || []

  return {
    type: CERTIFICATE_TYPES.PORTFOLIO,
    athleteName: `${athlete.firstName} ${athlete.lastName}`,
    skfId: athlete.skfId,
    branchName: athlete.branchName,
    currentBelt: athlete.currentBelt,
    generatedAt: new Date().toISOString(),
    achievements,
    totals: {
      medals: achievements.filter((achievement) =>
        ["tournament-gold", "tournament-silver", "tournament-bronze"].includes(achievement.type)
      ).length,
      rankingPoints: rankingEntry?.totalPoints ?? 0,
      rankingPosition: rankingEntry?.overallRank ?? null,
    },
  }
}

export function getCertificateAvailability(athlete: Athlete) {
  const achievements = athlete.achievements || []
  const latestGrading = [...achievements]
    .filter((achievement) => achievement.type === "belt-grading")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  return {
    beltCertificateAvailable: Boolean(latestGrading),
    portfolioAvailable: true,
    latestGradingAchievementId: latestGrading?.id || null,
  }
}
