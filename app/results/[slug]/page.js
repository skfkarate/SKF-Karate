import { notFound } from 'next/navigation'
import ResultsDetailPageClient from './ResultsDetailPageClient'
import { getAllTournaments, getTournamentBySlug } from '../../../lib/data/tournaments'

export async function generateStaticParams() {
  return getAllTournaments()
    .filter(t => t.isPublished)
    .map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tournament = getTournamentBySlug(slug)
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
  const tournament = getTournamentBySlug(slug)
  if (!tournament) notFound()

  return <ResultsDetailPageClient tournament={tournament} />
}
