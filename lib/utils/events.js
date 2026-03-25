export const EVENT_TYPES = ["competition", "grading", "camp", "seminar", "training"]

export function normaliseEventType(value) {
  if (!value) return "competition"
  const normalized = String(value).trim().toLowerCase()
  return EVENT_TYPES.includes(normalized) ? normalized : "competition"
}

export function sortEventsByDate(events = [], direction = "desc") {
  const multiplier = direction === "asc" ? 1 : -1

  return [...events].sort((a, b) => {
    return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier
  })
}

export function getEventStatus(event, currentDate = new Date()) {
  const start = new Date(event.date)
  const end = new Date(event.endDate || event.date)
  const current = new Date(currentDate)

  if (current < start) return "upcoming"
  if (current > end) return "completed"
  return "live"
}

export function buildEventFromTournament(tournament) {
  return {
    ...tournament,
    type: "competition",
    status: getEventStatus(tournament),
    participants: tournament.winners || [],
  }
}

export function getEventMedalTally(event) {
  const participants = event.participants || event.winners || []

  return participants.reduce(
    (tally, participant) => {
      if (participant.medal === "gold") tally.gold += 1
      if (participant.medal === "silver") tally.silver += 1
      if (participant.medal === "bronze") tally.bronze += 1
      return tally
    },
    { gold: 0, silver: 0, bronze: 0 }
  )
}

export function getAthleteEventEntries(athlete, events = []) {
  return events.flatMap((event) => {
    const participants = event.participants || event.winners || []

    return participants
      .filter((participant) => {
        if (participant.registrationNumber && athlete.registrationNumber) {
          return participant.registrationNumber === athlete.registrationNumber
        }

        return participant.athleteName === `${athlete.firstName} ${athlete.lastName}`
      })
      .map((participant) => ({
        eventId: event.id,
        eventSlug: event.slug,
        eventName: event.name,
        date: event.date,
        level: event.level,
        result: participant.medal || participant.position || "participation",
        category: participant.category || null,
        ageGroup: participant.ageGroup || null,
        weightCategory: participant.weightCategory || null,
      }))
  })
}

export function buildResultCascadeSummary({ athlete, event, result }) {
  return {
    athleteId: athlete.id,
    eventId: event.id,
    result,
    affectedViews: [
      "athlete-profile",
      "rankings",
      "event-page",
      "honours-board",
      "certificate-queue",
    ],
    cacheKeys: [`athlete:${athlete.registrationNumber}`, `event:${event.slug}`, "rankings"],
  }
}
