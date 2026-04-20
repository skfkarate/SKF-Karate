import { notFound } from 'next/navigation'

import AthleteProfileClient from '@/app/_components/athlete/profile/AthleteProfileClient'
import { buildRestoredAthleteProfileData } from '@/app/_components/athlete/profile/athleteProfileData'
import { getAthleteByRegistrationNumber, getAthleteRank } from '@/lib/server/repositories/athletes'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { registrationNumber } = await params
  const athlete = getAthleteByRegistrationNumber(registrationNumber)

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
  const athlete = getAthleteByRegistrationNumber(registrationNumber)

  if (!athlete) {
    notFound()
  }

  const rankInfo = getAthleteRank ? getAthleteRank(athlete.id) : null
  const profile = buildRestoredAthleteProfileData(athlete, rankInfo)

  return <AthleteProfileClient {...profile} />
}
