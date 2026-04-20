import { randomUUID } from "node:crypto"
import {
  createTournament,
  deleteTournament,
  getAllTournaments,
  getAllTournamentsAdmin,
  getTournamentById,
  getTournamentBySlug,
  hasTournamentSlug,
  updateTournament,
} from "./tournaments"
import type {
  TournamentParticipant,
  TournamentRecord,
  TournamentResultRecord,
  TournamentWinner,
} from "./tournaments"
import { resolveDataFile, readJsonArray, writeJsonAtomically } from "../data-store"
import { ApiError } from "../api"
import { events as seedEvents } from "../../../data/seed/events"

const EVENTS_DATA_FILE = resolveDataFile("events.json")

type EventParticipant = TournamentParticipant

type EventResult = TournamentResultRecord

type EventWinner = TournamentWinner

type EventRecord = {
  id: string
  slug: string
  name: string
  shortName: string
  type: string
  status: string
  level?: string
  date: string
  endDate: string
  venue: string
  city: string
  state: string
  description: string
  coverImageUrl: string
  affiliatedBody: string
  isPublished: boolean
  isFeatured: boolean
  isResultsPublished: boolean
  hostingBranch: string
  participants: EventParticipant[]
  results: EventResult[]
  resultsAppliedAt: string
  winners?: EventWinner[]
  createdAt: string
  updatedAt: string
}

let events: EventRecord[] = seedEvents.map(e => ({
  ...e,
  participants: [],
  results: [],
  resultsAppliedAt: "",
}))

let eventsLoadedFromDisk = false

function cloneEventData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

function ensureEventsLoaded() {
  if (eventsLoadedFromDisk) return
  eventsLoadedFromDisk = true

  try {
    const stored = readJsonArray(EVENTS_DATA_FILE)
    if (Array.isArray(stored) && stored.length > 0) {
      events = sortByDateDesc(stored as EventRecord[])
    }
  } catch (error) {
    console.error("Failed to load event store:", error)
  }
}

function persistEvents() {
  ensureEventsLoaded()
  events = sortByDateDesc(events)
  writeJsonAtomically(EVENTS_DATA_FILE, events)
}

function normaliseEventPayload(
  input: Partial<EventRecord> = {},
  existing: EventRecord | null = null
): EventRecord {
  const now = new Date().toISOString()

  return {
    id: existing?.id || input.id || `evt_${randomUUID()}`,
    slug: input.slug?.trim() || existing?.slug || "",
    name: input.name?.trim() || existing?.name || "",
    shortName: input.shortName?.trim() || existing?.shortName || input.name?.trim() || "",
    type: input.type || existing?.type || "seminar",
    status: input.status || existing?.status || "draft",
    level: input.level || existing?.level || "",
    date: input.date || existing?.date || "",
    endDate: input.endDate || existing?.endDate || "",
    venue: input.venue?.trim() || existing?.venue || "",
    city: input.city?.trim() || existing?.city || "",
    state: input.state?.trim() || existing?.state || "Karnataka",
    description: input.description?.trim() || existing?.description || "",
    coverImageUrl: input.coverImageUrl || existing?.coverImageUrl || "",
    affiliatedBody: input.affiliatedBody || existing?.affiliatedBody || "",
    isPublished:
      typeof input.isPublished === "boolean"
        ? input.isPublished
        : existing?.isPublished ?? false,
    isFeatured:
      typeof input.isFeatured === "boolean"
        ? input.isFeatured
        : existing?.isFeatured ?? false,
    isResultsPublished:
      typeof input.isResultsPublished === "boolean"
        ? input.isResultsPublished
        : existing?.isResultsPublished ?? false,
    hostingBranch: input.hostingBranch || existing?.hostingBranch || "",
    participants: Array.isArray(input.participants)
      ? input.participants
      : existing?.participants || [],
    results: Array.isArray(input.results) ? input.results : existing?.results || [],
    resultsAppliedAt: input.resultsAppliedAt || existing?.resultsAppliedAt || "",
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
  }
}

function buildTournamentResults(
  tournament: Pick<TournamentRecord, "results" | "winners">
): EventResult[] {
  if (Array.isArray(tournament.results) && tournament.results.length > 0) {
    return tournament.results
  }

  return (tournament.winners || []).map((winner) => ({
    id: winner.id,
    athleteId: winner.athleteId || "",
    registrationNumber: winner.registrationNumber || "",
    athleteName: winner.athleteName,
    result: winner.medal || "participation",
    medal: winner.medal,
    position: winner.position,
    category: winner.category || "kata-individual",
    ageGroup: winner.ageGroup || "sub-junior",
    weightCategory: winner.weightCategory || "",
    notes: "",
  }))
}

export function buildUnifiedTournamentEvent(
  tournament: TournamentRecord
) {
  return {
    ...cloneEventData(tournament),
    type: "tournament",
    sourceKind: "tournament",
    participants: Array.isArray(tournament.participants) ? tournament.participants : [],
    results: buildTournamentResults(tournament),
  }
}

function buildUnifiedStoredEvent(
  event: EventRecord
): EventRecord & { sourceKind: "event" } {
  return {
    ...cloneEventData(event),
    sourceKind: "event",
  }
}

export function getStandaloneEventsAdmin() {
  ensureEventsLoaded()
  return cloneEventData(sortByDateDesc(events))
}

export function getStandaloneEvents() {
  ensureEventsLoaded()
  return cloneEventData(sortByDateDesc(events.filter((event) => event.isPublished)))
}

export function getStandaloneEventById(id) {
  ensureEventsLoaded()
  const event = events.find((entry) => entry.id === id) || null
  return event ? buildUnifiedStoredEvent(event) : null
}

export function getStandaloneEventBySlug(slug) {
  ensureEventsLoaded()
  const event =
    events.find((entry) => entry.slug === slug && entry.isPublished) || null
  return event ? buildUnifiedStoredEvent(event) : null
}

export function getAllEventsAdmin() {
  const standalone = getStandaloneEventsAdmin().map(buildUnifiedStoredEvent)
  const tournaments = getAllTournamentsAdmin().map(buildUnifiedTournamentEvent)
  return sortByDateDesc([...standalone, ...tournaments])
}

export function getAllEvents() {
  const standalone = getStandaloneEvents().map(buildUnifiedStoredEvent)
  const tournaments = getAllTournaments().map(buildUnifiedTournamentEvent)
  return sortByDateDesc([...standalone, ...tournaments])
}

export function getEventByIdAdmin(id) {
  const tournament = getTournamentById(id)
  if (tournament) {
    return buildUnifiedTournamentEvent(tournament)
  }

  return getStandaloneEventById(id)
}

export function getEventBySlug(slug) {
  const tournament = getTournamentBySlug(slug)
  if (tournament) {
    return buildUnifiedTournamentEvent(tournament)
  }

  return getStandaloneEventBySlug(slug)
}

export function createStandaloneEvent(input) {
  ensureEventsLoaded()
  const event = normaliseEventPayload(input)

  if (events.some((entry) => entry.slug === event.slug)) {
    throw new ApiError(409, "An event with this slug already exists.")
  }

  if (hasTournamentSlug(event.slug)) {
    throw new ApiError(409, "A tournament with this slug already exists.")
  }

  events = sortByDateDesc([event, ...events])
  persistEvents()
  return buildUnifiedStoredEvent(event)
}

export function updateStandaloneEvent(id, input) {
  ensureEventsLoaded()
  const index = events.findIndex((entry) => entry.id === id)
  if (index === -1) return null

  const updatedEvent = normaliseEventPayload(input, events[index])

  const duplicateEvent = events.some(
    (entry) => entry.slug === updatedEvent.slug && entry.id !== id
  )

  if (duplicateEvent || (hasTournamentSlug(updatedEvent.slug, id) && events[index].slug !== updatedEvent.slug)) {
    throw new ApiError(409, "An event with this slug already exists.")
  }

  events[index] = updatedEvent
  persistEvents()
  return buildUnifiedStoredEvent(updatedEvent)
}

export function deleteStandaloneEvent(id) {
  ensureEventsLoaded()
  const index = events.findIndex((entry) => entry.id === id)
  if (index === -1) return false

  events.splice(index, 1)
  persistEvents()
  return true
}

export function createEventRecord(input) {
  if (input.type === "tournament") {
    return buildUnifiedTournamentEvent(createTournament(input))
  }

  return createStandaloneEvent(input)
}

export function updateEventRecord(id, input) {
  if (getTournamentById(id)) {
    const updatedTournament = updateTournament(id, input)
    return updatedTournament ? buildUnifiedTournamentEvent(updatedTournament) : null
  }

  return updateStandaloneEvent(id, input)
}

export function deleteEventRecord(id) {
  if (getTournamentById(id)) {
    return deleteTournament(id)
  }

  return deleteStandaloneEvent(id)
}
