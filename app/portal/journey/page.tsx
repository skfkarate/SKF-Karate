import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import JourneyClient from './JourneyClient'
import type { TimelineNode } from './JourneyClient'
import { getBelt } from '@/data/constants/belts'
import { getAssignedPortalEvents, isAssignedToEvent } from '@/lib/utils/portal-events'
import { normaliseSkfId } from '@/lib/utils/registration'

export const dynamic = 'force-dynamic'

function getCurrentTimeMs() {
  return Date.now()
}

type AthleteAchievement = {
  id?: string
  type?: string
  date?: string
  beltEarned?: string
  examiner?: string
  awardedBy?: string
}

type JourneyParticipant = {
  skfId?: string
}

type JourneyEvent = {
  id?: string
  name?: string
  type?: string
  date?: string
  showInJourney?: boolean
  participants?: JourneyParticipant[]
  results?: JourneyParticipant[]
  winners?: JourneyParticipant[]
}

export default async function JourneyPage() {
  const { athlete } = await requirePortalAthlete()
  const [allEvents] = await Promise.all([
    getAllEventsLive(),
  ])

  const currentTimeMs = getCurrentTimeMs()
  const athleteSkfId = normaliseSkfId(athlete.skfId)
  
  const timelineNodes: TimelineNode[] = []

  // 1. Origin (Join Date)
  if (athlete.joinDate) {
    timelineNodes.push({
      id: 'origin',
      type: 'origin',
      date: athlete.joinDate,
      title: 'Began Karate Journey',
      description: `Joined SKF Karate at ${athlete.branchName}`,
      isCurrent: false,
      isUpcoming: false,
      timestamp: new Date(athlete.joinDate).getTime(),
    })
  }

  // 2. Belt Promotions (Anchors)
  const achievements = Array.isArray(athlete.achievements)
    ? (athlete.achievements as AthleteAchievement[])
    : []
  const beltAchievements = achievements.filter((ach) =>
    ['belt-pass', 'belt-grading', 'enrollment'].includes(String(ach.type || ''))
  )
  beltAchievements.forEach((ach) => {
    if (!ach.date) return
    const beltObj = getBelt(ach.beltEarned)
    timelineNodes.push({
      id: ach.id || `belt-${ach.date}`,
      type: 'belt',
      date: ach.date,
      title: beltObj?.label || ach.beltEarned || 'Belt Exam',
      description: `Examined by ${ach.examiner || ach.awardedBy || 'SKF Panel'}`,
      isCurrent: false,
      isUpcoming: false,
      beltColor: beltObj?.colour || 'white',
      timestamp: new Date(ach.date).getTime(),
    })
  })

  // 3. Side Quests / Milestones (Events marked showInJourney)
  const journeyEvents = (allEvents as JourneyEvent[]).filter((event) => event.showInJourney === true)
  journeyEvents.forEach((event) => {
    if (!event.date) return
    const isParticipant = isAssignedToEvent(event, athleteSkfId)
    const hasResult = (event.results || []).some((r) => normaliseSkfId(String(r.skfId || '')) === athleteSkfId)
    const isWinner = (event.winners || []).some((w) => normaliseSkfId(String(w.skfId || '')) === athleteSkfId)

    if (isParticipant || hasResult || isWinner) {
      timelineNodes.push({
        id: event.id || `event-${event.date}`,
        type: 'event',
        date: event.date,
        title: event.name,
        description: event.type === 'tournament' ? 'Tournament Participation' : 'Special Event',
        isCurrent: false,
        isUpcoming: event.date ? new Date(event.date).getTime() > currentTimeMs : false,
        eventType: event.type,
        timestamp: new Date(event.date).getTime(),
      })
    }
  })

  // 4. Upcoming Belt Exam / Major Event
  const futureEvents = getAssignedPortalEvents(allEvents as JourneyEvent[], athleteSkfId).filter(
    (event) => event.date && new Date(event.date).getTime() > currentTimeMs
  )
  // Find the earliest upcoming event that is a grading, tournament, or has SKM in the name
  const upcomingMilestone = futureEvents
    .filter(e => e.type === 'grading' || e.type === 'tournament' || e.name?.toLowerCase().includes('skm'))
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0]

  if (upcomingMilestone) {
    timelineNodes.push({
      id: `upcoming-${upcomingMilestone.id}`,
      type: 'event',
      date: upcomingMilestone.date!,
      title: upcomingMilestone.name || 'Upcoming Milestone',
      description: upcomingMilestone.type === 'grading' ? 'Next Belt Examination' : 'Upcoming Major Event',
      isCurrent: false,
      isUpcoming: true,
      eventType: upcomingMilestone.type,
      timestamp: new Date(upcomingMilestone.date!).getTime(),
    })
  }

  // Sort Chronologically (Oldest at top, newest/upcoming at bottom)
  timelineNodes.sort((a, b) => a.timestamp - b.timestamp)

  // Mark the current belt (since array is chronological, newest belt is the LAST 'belt' found)
  const currentBeltIndex = timelineNodes.map(n => n.type).lastIndexOf('belt')
  if (currentBeltIndex >= 0) {
    timelineNodes[currentBeltIndex].isCurrent = true
  } else if (timelineNodes.length > 0 && timelineNodes[0].type === 'origin') {
    timelineNodes[0].isCurrent = true
  }

  return <JourneyClient timelineNodes={timelineNodes} />
}
