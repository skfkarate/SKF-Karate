import { notFound } from 'next/navigation'
import ResultsDetailPageClient from './ResultsDetailPageClient'
import {
  getAllTournamentsLive,
  getTournamentBySlugLive,
} from '@/lib/server/repositories/tournaments-live'

export async function generateStaticParams() {
  return (await getAllTournamentsLive())
    .filter(t => t.isPublished)
    .map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tournament = await getTournamentBySlugLive(slug)
  if (!tournament) return { title: 'Not Found' }
  return {
    title: `${tournament.name} — Results | SKF Karate`,
    description: `Full results from ${tournament.name}. ${tournament.medals.gold} Gold, ${tournament.medals.silver} Silver, ${tournament.medals.bronze} Bronze medals for SKF Karate.`,
    openGraph: {
      title: tournament.name,
      description: tournament.description,
      url: `https://www.skfkarate.org/results/${tournament.slug}`,
      siteName: 'SKF Karate',
      type: 'website',
    },
  }
}

export default async function TournamentDetailPage({ params }) {
  const { slug } = await params
  const tournament = await getTournamentBySlugLive(slug)
  if (!tournament) notFound()

  return <ResultsDetailPageClient tournament={tournament} />
}
