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
}) {
  return {
    id: `${type}_${athlete.id}_${sourceId}`,
    athleteId: athlete.id,
    registrationNumber: athlete.registrationNumber,
    type,
    sourceId,
    issuedAt,
    status,
  }
}

export function buildBeltCertificatePayload(athlete, gradingAchievement) {
  return {
    type: CERTIFICATE_TYPES.BELT,
    athleteName: `${athlete.firstName} ${athlete.lastName}`,
    registrationNumber: athlete.registrationNumber,
    belt: gradingAchievement.beltEarned || athlete.currentBelt,
    achievedAt: gradingAchievement.date,
    dojo: athlete.branchName,
    achievementTitle: gradingAchievement.title,
  }
}

export function buildAchievementPortfolioPayload(athlete, rankingEntry = null) {
  const achievements = athlete.achievements || []

  return {
    type: CERTIFICATE_TYPES.PORTFOLIO,
    athleteName: `${athlete.firstName} ${athlete.lastName}`,
    registrationNumber: athlete.registrationNumber,
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

export function getCertificateAvailability(athlete) {
  const achievements = athlete.achievements || []
  const latestGrading = [...achievements]
    .filter((achievement) => achievement.type === "belt-grading")
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  return {
    beltCertificateAvailable: Boolean(latestGrading),
    portfolioAvailable: true,
    latestGradingAchievementId: latestGrading?.id || null,
  }
}
