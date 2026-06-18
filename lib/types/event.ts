import { BELTS } from '@/data/constants/belts'

export const EVENT_TYPES = [
  'tournament',
  'seminar',
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

export const EVENT_RESULT_OPTIONS: Record<string, string[]> = {
  tournament: ['participation', 'gold', 'silver', 'bronze', '5th-place'],
  seminar: ['absent', 'attended', 'completed'],
  camp: ['absent', 'attended', 'completed'],
  fun: ['absent', 'attended', 'completed'],
  grading: ['pass', 'fail'],
}

export const EVENT_BELT_VALUES = BELTS.map((belt) => belt.colour)

export function canonicalizeEventType(type: string): string {
  const normalized = String(type || '').trim().toLowerCase()
  return normalized === 'belt-exam' ? 'grading' : normalized
}

export function isBeltExamType(type: string): boolean {
  return canonicalizeEventType(type) === 'grading'
}
