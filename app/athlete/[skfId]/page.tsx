import { notFound, redirect } from 'next/navigation'

import AthleteProfileClient from '@/app/_components/athlete/profile/AthleteProfileClient'
import { buildRestoredAthleteProfileData } from '@/app/_components/athlete/profile/athleteProfileData'
import {
  getAthleteBySkfIdLive,
  getAthleteRankLive,
} from '@/lib/server/repositories/athletes-live'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import { getBranchCoachNameMapLive } from '@/lib/server/repositories/senseis-live'
import { resolveServerAthleteProfilePhoto } from '@/lib/server/profile-photos'
import { absoluteMediaUrl, absoluteSiteUrl } from '@/data/constants/siteConfig'

export async function generateMetadata({ params }) {
  const { skfId } = await params
  const athlete = await getAthleteBySkfIdLive(skfId)

  if (!athlete || !athlete.isPublic || athlete.status !== 'active') {
    return {
      title: 'SKF Karate',
    }
  }

  const name = `${athlete.firstName} ${athlete.lastName}`
  const canonicalSkfId = athlete.skfId || skfId
  const canonicalUrl = absoluteSiteUrl(`/athlete/${canonicalSkfId}`)
  const imageUrl = absoluteMediaUrl(resolveServerAthleteProfilePhoto(athlete))

  return {
    title: 'SKF Karate',
    description: `${name} · ${athlete.belt || athlete.currentBelt} Belt · SKF Karate ${athlete.branchName}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'SKF Karate',
      type: 'profile',
      url: canonicalUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${name} SKF Karate profile` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SKF Karate',
      description: `${name} · ${athlete.belt || athlete.currentBelt} Belt · SKF Karate ${athlete.branchName}`,
      images: [imageUrl],
    },
  }
}

export default async function AthleteProfilePage({ params }) {
  const { skfId } = await params
  const athlete = await getAthleteBySkfIdLive(skfId)

  if (!athlete || !athlete.isPublic || athlete.status !== 'active') {
    notFound()
  }

  if (athlete.skfId && athlete.skfId !== skfId) {
    redirect(`/athlete/${encodeURIComponent(athlete.skfId)}`)
  }

  const [rankInfo, allEvents, branchCoachMap] = await Promise.all([
    getAthleteRankLive(athlete.id),
    getAllEventsLive(),
    getBranchCoachNameMapLive(),
  ])
  const profile = buildRestoredAthleteProfileData(athlete, rankInfo, allEvents, branchCoachMap)

  return <AthleteProfileClient {...profile} />
}
