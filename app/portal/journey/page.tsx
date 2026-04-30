import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT, COOKIE_NAME } from '@/lib/server/auth/portal'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import JourneyClient from './JourneyClient'
import type { TimelineNode } from './JourneyClient'
import { getBelt } from '@/data/constants/belts'

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
  registrationNumber?: string
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
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = verifyJWT(token)

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  const [athlete, allEvents] = await Promise.all([
    getAthleteByRegistrationNumberLive(session.skfId),
    getAllEventsLive(),
  ])

  if (!athlete) {
    redirect('/portal/login')
  }

  const currentTimeMs = getCurrentTimeMs()
  
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
  const beltAchievements = achievements.filter((ach) => ach.type === 'belt-pass' || ach.type === 'enrollment')
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
    const isParticipant = (event.participants || []).some((p) => p.registrationNumber === athlete.registrationNumber)
    const hasResult = (event.results || []).some((r) => r.registrationNumber === athlete.registrationNumber)
    const isWinner = (event.winners || []).some((w) => w.registrationNumber === athlete.registrationNumber)

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

  // Sort Chronologically
  timelineNodes.sort((a, b) => a.timestamp - b.timestamp)

  // Mark the last belt as current
  const lastBeltIndex = timelineNodes.map(n => n.type).lastIndexOf('belt')
  if (lastBeltIndex >= 0) {
    timelineNodes[lastBeltIndex].isCurrent = true
  } else if (timelineNodes.length > 0 && timelineNodes[0].type === 'origin') {
    timelineNodes[0].isCurrent = true
  }

  return <JourneyClient timelineNodes={timelineNodes} />
}
