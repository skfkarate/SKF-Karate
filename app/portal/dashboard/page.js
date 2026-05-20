import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import AthleteProfileClient from '@/app/_components/athlete/profile/AthleteProfileClient'
import { buildRestoredAthleteProfileData } from '@/app/_components/athlete/profile/athleteProfileData'
import {
  getAthleteRankLive,
} from '@/lib/server/repositories/athletes-live'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import { getBranchCoachNameMapLive } from '@/lib/server/repositories/senseis-live'

export const dynamic = 'force-dynamic'

export default async function DojoDashboard() {
  const { athlete } = await requirePortalAthlete()

  const [rankInfo, allEvents, branchCoachMap] = await Promise.all([
    getAthleteRankLive(athlete.id),
    getAllEventsLive(),
    getBranchCoachNameMapLive(),
  ])
  const profile = buildRestoredAthleteProfileData(athlete, rankInfo, allEvents, branchCoachMap)

  return <AthleteProfileClient {...profile} isDashboardContext={true} />
}
