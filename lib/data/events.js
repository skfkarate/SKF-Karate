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
import { resolveDataFile, readJsonArray, writeJsonAtomically } from "../server/data-store"
import { ApiError } from "../server/api"

const EVENTS_DATA_FILE = resolveDataFile("events.json")

let events = [
  {
    id: "evt_summer_camp_2026",
    slug: "summer-camp-2026",
    name: "Summer Camp 2026",
    shortName: "Summer Camp 2026",
    type: "camp",
    status: "upcoming",
    date: "2026-04-01",
    endDate: "2026-05-31",
    venue: "M P Sports Club",
    city: "Bengaluru",
    state: "Karnataka",
    description: "Intensive two-month training camp for all levels, from beginner to advanced.",
    coverImageUrl: "",
    affiliatedBody: "",
    isPublished: true,
    isFeatured: true,
    participants: [],
    results: [],
    resultsAppliedAt: "",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "evt_kyu_grading_2026",
    slug: "kyu-grading-examination-2026",
    name: "Kyu Grading Examination",
    shortName: "Kyu Grading 2026",
    type: "grading",
    status: "upcoming",
    date: "2026-05-10",
    endDate: "",
    venue: "M P Sports Club",
    city: "Bengaluru",
    state: "Karnataka",
    description: "Belt examination for all Kyu grades from white to yellow.",
    coverImageUrl: "",
    affiliatedBody: "",
    isPublished: true,
    isFeatured: false,
    participants: [],
    results: [],
    resultsAppliedAt: "",
    createdAt: "2026-01-12T00:00:00Z",
    updatedAt: "2026-01-12T00:00:00Z",
  },
  {
    id: "evt_bring_your_buddy_2026",
    slug: "bring-your-buddy-2026",
    name: "Bring Your Buddy",
    shortName: "Bring Your Buddy",
    type: "fun",
    status: "upcoming",
    date: "2026-06-15",
    endDate: "",
    venue: "M P Sports Club",
    city: "Bengaluru",
    state: "Karnataka",
    description: "Bring your friend to the dojo and show them what you love about training.",
    coverImageUrl: "",
    affiliatedBody: "",
    isPublished: true,
    isFeatured: false,
    participants: [],
    results: [],
    resultsAppliedAt: "",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "evt_kata_masterclass_2026",
    slug: "kata-masterclass-seminar-2026",
    name: "Kata Masterclass Seminar",
    shortName: "Kata Masterclass",
    type: "seminar",
    status: "upcoming",
    date: "2026-10-05",
    endDate: "",
    venue: "SKF Headquarters",
    city: "Bengaluru",
    state: "Karnataka",
    description: "Special seminar by a visiting Shihan covering advanced kata techniques and bunkai analysis.",
    coverImageUrl: "",
    affiliatedBody: "",
    isPublished: true,
    isFeatured: true,
    participants: [],
    results: [],
    resultsAppliedAt: "",
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "evt_dan_grading_2026",
    slug: "dan-grading-examination-2026",
    name: "Dan Grading Examination",
    shortName: "Dan Grading 2026",
    type: "grading",
    status: "upcoming",
    date: "2026-12-14",
    endDate: "",
    venue: "Central Dojo",
    city: "Bengaluru",
    state: "Karnataka",
    description: "Black belt examination for Shodan, Nidan, and Sandan candidates.",
    coverImageUrl: "",
    affiliatedBody: "",
    isPublished: true,
    isFeatured: false,
    participants: [],
    results: [],
    resultsAppliedAt: "",
    createdAt: "2026-01-25T00:00:00Z",
    updatedAt: "2026-01-25T00:00:00Z",
  },
]

let eventsLoadedFromDisk = false

function cloneEventData(value) {
  return JSON.parse(JSON.stringify(value))
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => new Date(b.date) - new Date(a.date))
}

function ensureEventsLoaded() {
  if (eventsLoadedFromDisk) return
  eventsLoadedFromDisk = true

  try {
    const stored = readJsonArray(EVENTS_DATA_FILE)
    if (Array.isArray(stored) && stored.length > 0) {
      events = sortByDateDesc(stored)
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

function normaliseEventPayload(input = {}, existing = null) {
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
    participants: Array.isArray(input.participants)
      ? input.participants
      : existing?.participants || [],
    results: Array.isArray(input.results) ? input.results : existing?.results || [],
    resultsAppliedAt: input.resultsAppliedAt || existing?.resultsAppliedAt || "",
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
  }
}

function buildTournamentResults(tournament) {
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

export function buildUnifiedTournamentEvent(tournament) {
  return {
    ...cloneEventData(tournament),
    type: "tournament",
    sourceKind: "tournament",
    participants: Array.isArray(tournament.participants) ? tournament.participants : [],
    results: buildTournamentResults(tournament),
  }
}

function buildUnifiedStoredEvent(event) {
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
