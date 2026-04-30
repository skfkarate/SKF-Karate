import { notFound } from 'next/navigation'
import ResultsDetailPageClient from './ResultsDetailPageClient'
import {
  getAllTournamentsLive,
  getTournamentBySlugLive
} from '@/lib/server/repositories/tournaments-live'
import { absoluteMediaUrl, absoluteSiteUrl } from '@/data/constants/siteConfig'

export async function generateStaticParams() {
  return (await getAllTournamentsLive())
    .filter(t => t.isPublished)
    .map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tournament = await getTournamentBySlugLive(slug)
  if (!tournament) return { title: 'Not Found' }
  const canonicalUrl = absoluteSiteUrl(`/results/${tournament.slug}`)
  const imageUrl = absoluteMediaUrl()

  return {
    title: `${tournament.name} — Results | SKF Karate`,
    description: `Full results from ${tournament.name}. ${tournament.medals.gold} Gold, ${tournament.medals.silver} Silver, ${tournament.medals.bronze} Bronze medals for SKF Karate.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: tournament.name,
      description: tournament.description,
      url: canonicalUrl,
      siteName: 'SKF Karate',
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${tournament.name} results` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tournament.name} — SKF Karate Results`,
      description: tournament.description,
      images: [imageUrl],
    },
  }
}

export default async function TournamentDetailPage({ params }) {
  const { slug } = await params
  const tournament = await getTournamentBySlugLive(slug)
  if (!tournament) notFound()

  return <ResultsDetailPageClient tournament={tournament} />
}
