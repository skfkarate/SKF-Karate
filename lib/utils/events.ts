import type { Athlete, TournamentRecord } from '@/data/types'
import { EVENT_TYPES } from '@/lib/types/event'

export { EVENT_TYPES }

export function normaliseEventType(value: string | null | undefined) {
  if (!value) return "competition"
  const normalized = String(value).trim().toLowerCase()
  return EVENT_TYPES.includes(normalized) ? normalized : "competition"
}

export function sortEventsByDate<T extends { date: string }>(events: T[] = [], direction = "desc") {
  const multiplier = direction === "asc" ? 1 : -1

  return [...events].sort((a, b) => {
    return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier
  })
}

export function getEventStatus(event: { date: string; endDate?: string }, currentDate: Date = new Date()) {
  const start = new Date(event.date)
  const end = new Date(event.endDate || event.date)
  const current = new Date(currentDate)

  if (current < start) return "upcoming"
  if (current > end) return "completed"
  return "live"
}

export function buildEventFromTournament(tournament: TournamentRecord) {
  return {
    ...tournament,
    type: "competition",
    status: getEventStatus(tournament),
    participants: tournament.winners || [],
  }
}

export function getEventMedalTally(event: { participants?: Array<{ medal?: string }>; winners?: Array<{ medal?: string }> }) {
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

export function getAthleteEventEntries(athlete: Athlete, events: Array<{ id: string; slug: string; name: string; date: string; level?: string; participants?: Array<{ skfId?: string; athleteName?: string; medal?: string; position?: string; category?: string; ageGroup?: string; weightCategory?: string }>; winners?: Array<{ skfId?: string; athleteName?: string; medal?: string; position?: string; category?: string; ageGroup?: string; weightCategory?: string }> }> = []) {
  return events.flatMap((event) => {
    const participants = event.participants || event.winners || []

    return participants
      .filter((participant) => {
        if (participant.skfId && athlete.skfId) {
          return participant.skfId === athlete.skfId
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

export function buildResultCascadeSummary({ athlete, event, result }: { athlete: { id: string; skfId: string }; event: { id: string; slug: string }; result: string }) {
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
    cacheKeys: [`athlete:${athlete.skfId}`, `event:${event.slug}`, "rankings"],
  }
}
