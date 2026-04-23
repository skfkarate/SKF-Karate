import { notFound } from 'next/navigation'

import AthleteProfileClient from '@/app/_components/athlete/profile/AthleteProfileClient'
import { buildRestoredAthleteProfileData } from '@/app/_components/athlete/profile/athleteProfileData'
import {
  getAthleteByRegistrationNumberLive,
  getAthleteRankLive,
} from '@/lib/server/repositories/athletes-live'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import { getBranchCoachNameMapLive } from '@/lib/server/repositories/senseis-live'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { registrationNumber } = await params
  const athlete = await getAthleteByRegistrationNumberLive(registrationNumber)

  if (!athlete) {
    return {
      title: 'Athlete Not Found | SKF Karate',
    }
  }

  const name = `${athlete.firstName} ${athlete.lastName}`;

  return {
    title: `${name} — SKF Athlete Profile`,
    description: `${name} · ${athlete.belt || athlete.currentBelt} Belt · SKF Karate ${athlete.branchName}`,
    openGraph: {
      title: `${name} — SKF Karate`,
      type: 'profile',
      images: [{ url: athlete.photoUrl || '/og-default.jpg' }]
    }
  }
}

export default async function AthleteProfilePage({ params }) {
  const { registrationNumber } = await params
  const athlete = await getAthleteByRegistrationNumberLive(registrationNumber)

  if (!athlete) {
    notFound()
  }

  const [rankInfo, allEvents, branchCoachMap] = await Promise.all([
    getAthleteRankLive(athlete.id),
    getAllEventsLive(),
    getBranchCoachNameMapLive(),
  ])
  const profile = buildRestoredAthleteProfileData(athlete, rankInfo, allEvents, branchCoachMap)

  return <AthleteProfileClient {...profile} />
}
