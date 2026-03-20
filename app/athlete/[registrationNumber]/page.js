import { notFound } from 'next/navigation'

import LegacyAthleteProfileClient from '@/app/components/athlete/profile/LegacyAthleteProfileClient'
import { buildRestoredAthleteProfileData } from '@/app/components/athlete/profile/mockAthleteProfileData'
import { getAthleteByRegistrationNumber, getAthleteRank } from '@/lib/data/athletes'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { registrationNumber } = await params
  const athlete = getAthleteByRegistrationNumber(registrationNumber)

  if (!athlete) {
    return {
      title: 'Athlete Not Found | SKF Karate',
    }
  }

  return {
    title: `${athlete.firstName} ${athlete.lastName} | SKF Karate`,
    description: `Dedicated athlete profile for ${athlete.firstName} ${athlete.lastName}. View restored rankings, honours, belt progression, and profile preview data on SKF Karate.`,
  }
}

export default async function AthleteProfilePage({ params }) {
  const { registrationNumber } = await params
  const athlete = getAthleteByRegistrationNumber(registrationNumber)

  if (!athlete || !athlete.isPublic) {
    notFound()
  }

  const rankInfo = getAthleteRank(athlete.id)
  const profile = buildRestoredAthleteProfileData(athlete, rankInfo)

  return <LegacyAthleteProfileClient {...profile} />
}
