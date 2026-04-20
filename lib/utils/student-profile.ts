import { getAllEvents } from '@/lib/server/repositories/events'
import { getBelt, getNextBelt, BELTS } from "@/data/constants/belts"
import { calculateResultPoints, normaliseEventTier } from "./points"
import { getAgeCategory, getAthleteRankingCategory } from "./rankings"

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

function getEventLinkForAchievement(achievement, events) {
  const explicitName = achievement.tournamentName || achievement.title || ""
  const title = achievement.title || ""

  if (achievement.sourceEventSlug) {
    const explicitMatch = events.find((event) => event.slug === achievement.sourceEventSlug)
    if (explicitMatch) {
      return {
        slug: explicitMatch.slug,
        name: explicitMatch.name,
        type: explicitMatch.type,
      }
    }
  }

  const matchedEvent = events.find((event) => {
    const eventName = event.name.toLowerCase()
    const eventShort = event.shortName?.toLowerCase() || ""
    const haystack = `${explicitName} ${title}`.toLowerCase()

    return (
      haystack.includes(eventName) ||
      (eventShort && haystack.includes(eventShort)) ||
      slugify(explicitName) === event.slug ||
      slugify(title.replace(/^(gold|silver|bronze) medal\s+[—-]\s+/i, "")) === event.slug
    )
  })

  return matchedEvent
    ? {
        slug: matchedEvent.slug,
        name: matchedEvent.name,
        type: matchedEvent.type,
      }
    : null
}

function getCompetitionEntry(athlete, achievement, events, currentDate) {
  const tournamentLink = getEventLinkForAchievement(achievement, events)
  const result = achievement.competitionResult || achievement.result || achievement.type.replace("tournament-", "")
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
    eventSlug: tournamentLink?.slug || achievement.sourceEventSlug || null,
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

function getTimelineEntry(athlete, achievement, events, currentDate) {
  if (achievement.type === "belt-grading") {
    const belt = getBelt(achievement.beltEarned || athlete.currentBelt)
    const eventLink = getEventLinkForAchievement(achievement, events)
    return {
      id: achievement.id,
      date: achievement.date,
      year: new Date(achievement.date).getFullYear(),
      filter: "grading",
      kind: "belt-promotion",
      title: `Promoted to ${belt?.label || "New Belt"}`,
      subtitle: belt?.kyuOrDan || "",
      meta: [`Dojo: ${athlete.branchName}`],
      href: eventLink ? `/events/${eventLink.slug}` : null,
      actionLabel: eventLink ? "View event" : "View certificate",
    }
  }

  if (achievement.type?.startsWith("tournament")) {
    const competition = getCompetitionEntry(athlete, achievement, events, currentDate)
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
        achievement.location || athlete.branchName,
        `${competition.points.activePoints.toFixed(2)} ranking pts active`,
      ],
      href: competition.eventSlug ? `/results/${competition.eventSlug}` : null,
      actionLabel: competition.eventSlug ? "View event" : null,
    }
  }

  if (
    achievement.type?.startsWith("seminar") ||
    achievement.type?.startsWith("camp") ||
    achievement.type?.startsWith("pelt") ||
    achievement.type === "grading-fail" ||
    achievement.type === "fun-attended"
  ) {
    const eventLink = getEventLinkForAchievement(achievement, events)
    const typeLabel =
      achievement.type.startsWith("seminar")
        ? "Seminar"
        : achievement.type.startsWith("camp")
          ? "Camp"
          : achievement.type.startsWith("pelt")
            ? "PELT Exam"
            : achievement.type === "fun-attended"
              ? "Fun Event"
              : "Grading"

    return {
      id: achievement.id,
      date: achievement.date,
      year: new Date(achievement.date).getFullYear(),
      filter: "events",
      kind: "event-entry",
      title: achievement.title,
      subtitle: achievement.description || typeLabel,
      meta: [
        achievement.location || `${athlete.branchName} Dojo`,
        `${Number(achievement.pointsAwarded || 0).toFixed(0)} academy pts`,
      ],
      href: eventLink ? `/events/${eventLink.slug}` : null,
      actionLabel: eventLink ? "View event" : null,
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

export function buildAthleteProfileData(athlete, rankInfo, currentDate = new Date()) {
  const events = getAllEvents()
  const ageCategory = getAgeCategory(athlete.dateOfBirth, currentDate)
  const rankingCategory = rankInfo?.rankingCategory || getAthleteRankingCategory(athlete, [], currentDate)
  const currentBelt = getBelt(athlete.currentBelt)
  const nextBelt = getNextBelt(athlete.currentBelt)

  const achievements = [...(athlete.achievements || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const competitionEntries = achievements
    .filter((achievement) => achievement.type?.startsWith("tournament"))
    .map((achievement) => getCompetitionEntry(athlete, achievement, events, currentDate))

  const goldCount = competitionEntries.filter((entry) => entry.medal === "gold").length
  const silverCount = competitionEntries.filter((entry) => entry.medal === "silver").length
  const bronzeCount = competitionEntries.filter((entry) => entry.medal === "bronze").length
  const totalMedals = goldCount + silverCount + bronzeCount
  const totalRankingPoints = Number((rankInfo?.totalPoints ?? 0).toFixed(2))
  const yearsTraining = Math.max(
    0,
    Number(
      (
        (new Date(currentDate).getTime() - new Date(athlete.joinDate).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
      ).toFixed(1)
    )
  )

  const gradingHistory = achievements
    .filter((achievement) => achievement.type === "belt-grading")
    .map((achievement) => ({
      id: achievement.id,
      date: achievement.date,
      formattedDate: formatLongDate(achievement.date),
      belt: getBelt(achievement.beltEarned || athlete.currentBelt),
      examiner: achievement.awardedBy || "SKF Examining Panel",
      venue: achievement.location || `${athlete.branchName} Dojo`,
    }))

  const currentGradeAchievedAt = gradingHistory[0]?.date || athlete.joinDate
  const monthsAtGrade = monthsBetween(currentGradeAchievedAt, currentDate)
  const daysAtGrade = daysBetween(currentGradeAchievedAt, currentDate)
  const currentBeltIndex = BELTS.findIndex((belt) => belt.colour === athlete.currentBelt)
  const gradingRequirements = getGradingRequirements(currentBeltIndex)
  const attendancePercent = typeof athlete.attendanceRate === "number" ? athlete.attendanceRate : null

  const timelineEntries = achievements.map((achievement) =>
    getTimelineEntry(athlete, achievement, events, currentDate)
  )

  const upcomingEvents = events
    .filter((event) => new Date(event.date) > new Date(currentDate))
    .filter((event) =>
      (event.participants || []).some(
        (participant) => participant.registrationNumber === athlete.registrationNumber
      )
    )
    .slice(0, 3)
    .map((event) => ({
      id: event.id,
      slug: event.slug,
      name: event.name,
      type: event.type,
      date: event.date,
      countdownDays: daysBetween(currentDate, event.date),
      badge: event.level || event.type,
      href: event.type === "tournament" ? `/results/${event.slug}` : `/events/${event.slug}`,
      venue: [event.venue, event.city].filter(Boolean).join(", "),
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
      dojoName: `SKF ${athlete.branchName}`,
      coachName: BRANCH_COACHES[athlete.branchName] || "SKF Coaching Team",
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
