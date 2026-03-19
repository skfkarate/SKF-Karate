export const CERTIFICATE_TYPES = {
  BELT: "belt",
  PORTFOLIO: "portfolio",
}

export function createCertificateRecord({
  student,
  type,
  sourceId,
  issuedAt = new Date().toISOString(),
  status = "available",
}) {
  return {
    id: `${type}_${student.id}_${sourceId}`,
    studentId: student.id,
    registrationNumber: student.registrationNumber,
    type,
    sourceId,
    issuedAt,
    status,
  }
}

export function buildBeltCertificatePayload(student, gradingAchievement) {
  return {
    type: CERTIFICATE_TYPES.BELT,
    studentName: `${student.firstName} ${student.lastName}`,
    registrationNumber: student.registrationNumber,
    belt: gradingAchievement.beltEarned || student.currentBelt,
    achievedAt: gradingAchievement.date,
    dojo: student.branchName,
    achievementTitle: gradingAchievement.title,
  }
}

export function buildAchievementPortfolioPayload(student, rankingEntry = null) {
  const achievements = student.achievements || []

  return {
    type: CERTIFICATE_TYPES.PORTFOLIO,
    studentName: `${student.firstName} ${student.lastName}`,
    registrationNumber: student.registrationNumber,
    branchName: student.branchName,
    currentBelt: student.currentBelt,
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

export function getCertificateAvailability(student) {
  const achievements = student.achievements || []
  const latestGrading = [...achievements]
    .filter((achievement) => achievement.type === "belt-grading")
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  return {
    beltCertificateAvailable: Boolean(latestGrading),
    portfolioAvailable: true,
    latestGradingAchievementId: latestGrading?.id || null,
  }
}
