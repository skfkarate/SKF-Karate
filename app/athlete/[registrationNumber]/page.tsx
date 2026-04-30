import { notFound } from 'next/navigation'

import AthleteProfileClient from '@/app/_components/athlete/profile/AthleteProfileClient'
import { buildRestoredAthleteProfileData } from '@/app/_components/athlete/profile/athleteProfileData'
import {
  getAthleteByRegistrationNumberLive,
  getAthleteRankLive,
} from '@/lib/server/repositories/athletes-live'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import { getBranchCoachNameMapLive } from '@/lib/server/repositories/senseis-live'
import { absoluteMediaUrl, absoluteSiteUrl } from '@/data/constants/siteConfig'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { registrationNumber } = await params
  const athlete = await getAthleteByRegistrationNumberLive(registrationNumber)

  if (!athlete || !athlete.isPublic || athlete.status !== 'active') {
    return {
      title: 'Athlete Not Found | SKF Karate',
    }
  }

  const name = `${athlete.firstName} ${athlete.lastName}`
  const canonicalUrl = absoluteSiteUrl(`/athlete/${registrationNumber}`)
  const imageUrl = athlete.photoUrl ? absoluteMediaUrl(athlete.photoUrl) : absoluteMediaUrl()

  return {
    title: `${name} — SKF Athlete Profile`,
    description: `${name} · ${athlete.belt || athlete.currentBelt} Belt · SKF Karate ${athlete.branchName}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${name} — SKF Karate`,
      type: 'profile',
      url: canonicalUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${name} SKF Karate profile` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — SKF Athlete Profile`,
      description: `${name} · ${athlete.belt || athlete.currentBelt} Belt · SKF Karate ${athlete.branchName}`,
      images: [imageUrl],
    },
  }
}

export default async function AthleteProfilePage({ params }) {
  const { registrationNumber } = await params
  const athlete = await getAthleteByRegistrationNumberLive(registrationNumber)

  if (!athlete || !athlete.isPublic || athlete.status !== 'active') {
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
