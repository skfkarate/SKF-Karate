import { getAllTournaments } from "../data/tournaments"
import { getBelt, getNextBelt, BELTS } from "../data/belts"
import { calculateResultPoints, normaliseEventTier } from "./points"
import { getAgeCategory, getStudentRankingCategory } from "./rankings"

const BRANCH_COACHES = {
  Sunkadakatte: "Sensei Rajesh Kumar",
  Rajajinagar: "Sensei Arvind Kumar",
  Malleshwaram: "Sensei Deepa Natarajan",
  Yeshwanthpur: "Sensei Priya Sharma",
  Vijayanagar: "Sensei Sanjay Bhat",
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function daysBetween(startDate, endDate) {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

function monthsBetween(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  )
}

function formatLongDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getGradingRequirements(currentBeltIndex) {
  const pointsByIndex = [0, 40, 80, 120, 180, 240, 320, 420, 540, 680, 820]
  const monthsByIndex = [0, 3, 4, 5, 6, 8, 10, 12, 18, 24, 30]

  const nextIndex = Math.min(currentBeltIndex + 1, pointsByIndex.length - 1)

  return {
    pointsRequired: pointsByIndex[nextIndex],
    minMonthsRequired: monthsByIndex[nextIndex],
    attendanceRequired: 75,
  }
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, value))
}

function getTournamentLinkForAchievement(achievement, tournaments) {
  const explicitName = achievement.tournamentName || ""
  const title = achievement.title || ""

  const matchedTournament = tournaments.find((tournament) => {
    const tournamentName = tournament.name.toLowerCase()
    const tournamentShort = tournament.shortName?.toLowerCase() || ""
    const haystack = `${explicitName} ${title}`.toLowerCase()

    return (
      haystack.includes(tournamentName) ||
      (tournamentShort && haystack.includes(tournamentShort)) ||
      slugify(explicitName) === tournament.slug ||
      slugify(title.replace(/^(gold|silver|bronze) medal\s+[—-]\s+/i, "")) === tournament.slug
    )
  })

  return matchedTournament
    ? {
        slug: matchedTournament.slug,
        name: matchedTournament.name,
      }
    : null
}

function getCompetitionEntry(student, achievement, tournaments, currentDate) {
  const tournamentLink = getTournamentLinkForAchievement(achievement, tournaments)
  const result = achievement.type.replace("tournament-", "")
  const points = calculateResultPoints(
    {
      date: achievement.date,
      level: normaliseEventTier(achievement.tournamentLevel),
      result,
    },
    currentDate
  )

  return {
    id: achievement.id,
    date: achievement.date,
    year: new Date(achievement.date).getFullYear(),
    tournamentName:
      tournamentLink?.name ||
      achievement.tournamentName ||
      achievement.title.replace(/^(Gold|Silver|Bronze) Medal\s+[—-]\s+/i, ""),
    eventSlug: tournamentLink?.slug || null,
    category: achievement.eventCategory || "Category not recorded",
    resultLabel:
      result === "gold"
        ? "Gold Medal"
        : result === "silver"
          ? "Silver Medal"
          : result === "bronze"
            ? "Bronze Medal"
            : "Participation",
    medal: result,
    tournamentLevel: normaliseEventTier(achievement.tournamentLevel),
    points,
  }
}

function getTimelineEntry(student, achievement, tournaments, currentDate) {
  if (achievement.type === "belt-grading") {
    const belt = getBelt(achievement.beltEarned || student.currentBelt)
    return {
      id: achievement.id,
      date: achievement.date,
      year: new Date(achievement.date).getFullYear(),
      filter: "grading",
      kind: "belt-promotion",
      title: `Promoted to ${belt?.label || "New Belt"}`,
      subtitle: belt?.kyuOrDan || "",
      meta: [`Dojo: ${student.branchName}`],
      actionLabel: "View certificate",
    }
  }

  if (achievement.type?.startsWith("tournament")) {
    const competition = getCompetitionEntry(student, achievement, tournaments, currentDate)
    const medalKind =
      competition.medal === "gold"
        ? "competition-gold"
        : competition.medal === "silver"
          ? "competition-silver"
          : competition.medal === "bronze"
            ? "competition-bronze"
            : "competition-entry"

    return {
      id: achievement.id,
      date: achievement.date,
      year: new Date(achievement.date).getFullYear(),
      filter: achievement.type === "tournament-participation" ? "competitions" : "medals",
      kind: medalKind,
      title: competition.tournamentName,
      subtitle: `${competition.resultLabel}${competition.category ? ` — ${competition.category}` : ""}`,
      meta: [
        achievement.location || student.branchName,
        `${competition.points.activePoints.toFixed(2)} ranking pts active`,
      ],
      href: competition.eventSlug ? `/results/${competition.eventSlug}` : null,
      actionLabel: competition.eventSlug ? "View event" : null,
    }
  }

  return {
    id: achievement.id,
    date: achievement.date,
    year: new Date(achievement.date).getFullYear(),
    filter: "awards",
    kind: "award",
    title: achievement.title,
    subtitle: achievement.description || achievement.awardReason || "Academy recognition",
    meta: [achievement.awardedBy ? `Awarded by ${achievement.awardedBy}` : "SKF Karate"],
  }
}

export function buildStudentProfileData(student, rankInfo, currentDate = new Date()) {
  const tournaments = getAllTournaments()
  const ageCategory = getAgeCategory(student.dateOfBirth, currentDate)
  const rankingCategory = rankInfo?.rankingCategory || getStudentRankingCategory(student, [], currentDate)
  const currentBelt = getBelt(student.currentBelt)
  const nextBelt = getNextBelt(student.currentBelt)

  const achievements = [...(student.achievements || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  const competitionEntries = achievements
    .filter((achievement) => achievement.type?.startsWith("tournament"))
    .map((achievement) => getCompetitionEntry(student, achievement, tournaments, currentDate))

  const goldCount = competitionEntries.filter((entry) => entry.medal === "gold").length
  const silverCount = competitionEntries.filter((entry) => entry.medal === "silver").length
  const bronzeCount = competitionEntries.filter((entry) => entry.medal === "bronze").length
  const totalMedals = goldCount + silverCount + bronzeCount
  const totalRankingPoints = Number((rankInfo?.totalPoints ?? 0).toFixed(2))
  const yearsTraining = Math.max(
    0,
    Number(((new Date(currentDate) - new Date(student.joinDate)) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1))
  )

  const gradingHistory = achievements
    .filter((achievement) => achievement.type === "belt-grading")
    .map((achievement) => ({
      id: achievement.id,
      date: achievement.date,
      formattedDate: formatLongDate(achievement.date),
      belt: getBelt(achievement.beltEarned || student.currentBelt),
      examiner: achievement.awardedBy || "SKF Examining Panel",
      venue: achievement.location || `${student.branchName} Dojo`,
    }))

  const currentGradeAchievedAt = gradingHistory[0]?.date || student.joinDate
  const monthsAtGrade = monthsBetween(currentGradeAchievedAt, currentDate)
  const daysAtGrade = daysBetween(currentGradeAchievedAt, currentDate)
  const currentBeltIndex = BELTS.findIndex((belt) => belt.colour === student.currentBelt)
  const gradingRequirements = getGradingRequirements(currentBeltIndex)
  const attendancePercent = typeof student.attendanceRate === "number" ? student.attendanceRate : null

  const timelineEntries = achievements.map((achievement) =>
    getTimelineEntry(student, achievement, tournaments, currentDate)
  )

  const upcomingEvents = tournaments
    .filter((tournament) => new Date(tournament.date) > new Date(currentDate))
    .filter((tournament) => {
      if (rankingCategory.ageGroup === "senior") return true
      return tournament.level !== "international" || totalRankingPoints > 0
    })
    .slice(0, 3)
    .map((tournament) => ({
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      type: "competition",
      date: tournament.date,
      countdownDays: daysBetween(currentDate, tournament.date),
      badge: tournament.level,
    }))

  const activeCompetitionEntries = competitionEntries.filter(
    (entry) => entry.points.activePoints > 0
  )

  return {
    ageCategory,
    rankingCategory,
    currentBelt,
    nextBelt,
    hero: {
      currentRanking: rankInfo?.overallRank || null,
      totalRankingPoints,
      totalMedals,
      yearsTraining,
      dojoName: `SKF ${student.branchName}`,
      coachName: BRANCH_COACHES[student.branchName] || "SKF Coaching Team",
      disciplineTags: [
        rankingCategory.discipline === "kumite" ? "Kumite" : "Kata",
      ],
      weightCategory: rankingCategory.weightCategory,
    },
    timelineEntries,
    competitionStats: {
      goldCount,
      silverCount,
      bronzeCount,
      totalCompetitions: competitionEntries.length,
      summaryLabel:
        competitionEntries.length > 0
          ? `${pluralize(totalMedals, "medal")} across ${pluralize(competitionEntries.length, "event")}`
          : "No competition entries recorded yet.",
      history: competitionEntries,
      activeEntries: activeCompetitionEntries,
    },
    beltJourney: {
      gradingHistory,
      currentGradeAchievedAt,
      currentGradeAchievedLabel: formatLongDate(currentGradeAchievedAt),
      monthsAtGrade,
      daysAtGrade,
      nextBelt,
      allBelts: BELTS,
      currentBeltIndex,
      eligibility: {
        pointsRequired: gradingRequirements.pointsRequired,
        pointsCurrent: totalRankingPoints,
        pointsProgress: clampPercent(
          gradingRequirements.pointsRequired > 0
            ? (totalRankingPoints / gradingRequirements.pointsRequired) * 100
            : 100
        ),
        minMonthsRequired: gradingRequirements.minMonthsRequired,
        monthsCurrent: monthsAtGrade,
        monthsProgress: clampPercent(
          gradingRequirements.minMonthsRequired > 0
            ? (monthsAtGrade / gradingRequirements.minMonthsRequired) * 100
            : 100
        ),
        attendanceRequired: gradingRequirements.attendanceRequired,
        attendanceCurrent: attendancePercent,
        attendanceProgress:
          attendancePercent === null
            ? null
            : clampPercent((attendancePercent / gradingRequirements.attendanceRequired) * 100),
        attendanceTrackingActive: attendancePercent !== null,
        isEligible:
          totalRankingPoints >= gradingRequirements.pointsRequired &&
          monthsAtGrade >= gradingRequirements.minMonthsRequired &&
          attendancePercent !== null &&
          attendancePercent >= gradingRequirements.attendanceRequired,
      },
    },
    upcomingEvents,
  }
}
