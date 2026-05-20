import { normaliseSkfId } from '@/lib/utils/registration'

type PortalEventParticipantLike = {
  skfId?: string | null
}

type PortalEventLike = {
  id?: string | null
  slug?: string | null
  name?: string | null
  type?: string | null
  sourceKind?: string | null
  date?: string | null
  endDate?: string | null
  venue?: string | null
  city?: string | null
  isPublished?: boolean | null
  participants?: PortalEventParticipantLike[] | null
}

function startOfDayTime(value: Date) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function getEventStartTime(event: PortalEventLike) {
  const time = new Date(event.date || '').getTime()
  return Number.isFinite(time) ? time : 0
}

export function isAssignedToEvent(event: PortalEventLike, skfId?: string | null) {
  const targetSkfId = normaliseSkfId(String(skfId || '')).toUpperCase()
  if (!targetSkfId || !Array.isArray(event.participants)) return false

  return event.participants.some((participant) => {
    return normaliseSkfId(String(participant?.skfId || '')).toUpperCase() === targetSkfId
  })
}

export function isUpcomingPortalEvent(event: PortalEventLike, now = new Date()) {
  const eventTime = getEventStartTime(event)
  return eventTime >= startOfDayTime(now)
}

export function getPortalEventHref(event: PortalEventLike) {
  const slug = String(event.slug || '').trim()
  const isTournament = event.sourceKind === 'tournament' || event.type === 'tournament'
  const basePath = isTournament ? '/results' : '/events'

  return slug ? `${basePath}/${encodeURIComponent(slug)}` : basePath
}

export function getAssignedPortalEvents<TEvent extends PortalEventLike>(
  events: TEvent[],
  skfId?: string | null
) {
  return (events || [])
    .filter((event) => event.isPublished !== false)
    .filter((event) => isAssignedToEvent(event, skfId))
    .sort((a, b) => getEventStartTime(a) - getEventStartTime(b))
}
