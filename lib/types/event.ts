import { BELTS } from '@/data/constants/belts'

export const EVENT_TYPES = [
  'tournament',
  'seminar',
  'belt-exam',
  'grading',
  'camp',
  'fun',
]

export const NON_TOURNAMENT_EVENT_TYPES = EVENT_TYPES.filter(
  (type) => type !== 'tournament'
)

export const EVENT_TYPE_LABELS = {
  tournament: 'Tournament',
  seminar: 'Seminar',
  'belt-exam': 'Belt Exam',
  grading: 'Grading',
  camp: 'Camp',
  fun: 'Fun Event',
}

export const EVENT_STATUSES = [
  'draft',
  'upcoming',
  'ongoing',
  'completed',
  'archived',
]

export const EVENT_RESULT_OPTIONS = {
  tournament: ['participation', 'gold', 'silver', 'bronze', '5th-place'],
  seminar: ['absent', 'attended', 'completed'],
  camp: ['absent', 'attended', 'completed'],
  fun: ['absent', 'attended', 'completed'],
  'belt-exam': ['pass', 'fail'],
  grading: ['pass', 'fail'],
}

export const EVENT_BELT_VALUES = BELTS.map((belt) => belt.colour)

export function canonicalizeEventType(type: string) {
  const normalized = String(type || '').trim().toLowerCase()
  return normalized === 'pelt-exam' ? 'belt-exam' : normalized
}

export function isBeltExamType(type: string) {
  return canonicalizeEventType(type) === 'belt-exam'
}
