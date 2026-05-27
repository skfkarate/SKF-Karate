import { describe, expect, it } from 'vitest'

import {
  getAssignedPortalEvents,
  getPortalEventHref,
  isAssignedToEvent,
  isUpcomingPortalEvent,
} from '@/lib/utils/portal-events'

describe('portal event assignment', () => {
  const events = [
    {
      id: 'evt_current_past',
      slug: 'current-past',
      name: 'Current Athlete Past Grading',
      type: 'grading',
      date: '2026-01-10',
      isPublished: true,
      participants: [{ skfId: 'skf26mp001' }],
    },
    {
      id: 'evt_current_upcoming',
      slug: 'current-upcoming',
      name: 'Current Athlete Camp',
      type: 'camp',
      date: '2026-06-15',
      isPublished: true,
      participants: [{ skfId: 'SKF26MP001' }],
    },
    {
      id: 'evt_sibling',
      slug: 'sibling-tournament',
      name: 'Sibling Tournament',
      sourceKind: 'tournament',
      type: 'tournament',
      date: '2026-06-01',
      isPublished: true,
      participants: [{ skfId: 'SKF26MP002' }],
    },
    {
      id: 'evt_unpublished',
      slug: 'hidden',
      name: 'Hidden Event',
      type: 'seminar',
      date: '2026-06-20',
      isPublished: false,
      participants: [{ skfId: 'SKF26MP001' }],
    },
  ]

  it('uses the active portal SKF ID when listing assigned events', () => {
    const currentProfileEvents = getAssignedPortalEvents(events, 'SKF26MP001')
    const switchedProfileEvents = getAssignedPortalEvents(events, 'SKF26MP002')

    expect(currentProfileEvents.map((event) => event.id)).toEqual([
      'evt_current_past',
      'evt_current_upcoming',
    ])
    expect(switchedProfileEvents.map((event) => event.id)).toEqual(['evt_sibling'])
  })

  it('normalizes SKF IDs while matching event participants', () => {
    expect(isAssignedToEvent(events[0], 'SKF26MP001')).toBe(true)
    expect(isAssignedToEvent(events[0], 'SKF26MP002')).toBe(false)
  })

  it('keeps portal event links aligned for tournaments and normal events', () => {
    expect(getPortalEventHref(events[1])).toBe('/events/current-upcoming')
    expect(getPortalEventHref(events[2])).toBe('/results/sibling-tournament')
  })

  it('classifies upcoming events from the start of the current day', () => {
    const now = new Date('2026-06-01T18:00:00+05:30')

    expect(isUpcomingPortalEvent(events[2], now)).toBe(true)
    expect(isUpcomingPortalEvent(events[0], now)).toBe(false)
  })
})
