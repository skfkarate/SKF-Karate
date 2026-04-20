/**
 * Factory: createEvent
 */
import { generateId, isoNow, slugify, randomFutureDate } from './helpers'
import { EVENT_STATUSES } from '../constants/statuses'
import type { SeedEvent } from '../seed/events'

type EventInput = Partial<SeedEvent> & Pick<SeedEvent, 'name' | 'type'>

export function createEvent(input: EventInput): SeedEvent {
  const now = isoNow()
  return {
    id: input.id || generateId('evt'),
    slug: input.slug || slugify(input.name),
    name: input.name,
    shortName: input.shortName || input.name,
    type: input.type,
    status: input.status || EVENT_STATUSES.UPCOMING,
    level: input.level,
    date: input.date || randomFutureDate(6),
    endDate: input.endDate || '',
    venue: input.venue || 'M P Sports Club',
    city: input.city || 'Bengaluru',
    state: input.state || 'Karnataka',
    description: input.description || `${input.name} event at SKF Karate.`,
    coverImageUrl: input.coverImageUrl || '',
    affiliatedBody: input.affiliatedBody || '',
    isPublished: input.isPublished ?? false,
    isFeatured: input.isFeatured ?? false,
    isResultsPublished: input.isResultsPublished ?? false,
    hostingBranch: input.hostingBranch || '',
    createdAt: input.createdAt || now,
    updatedAt: now,
  }
}
