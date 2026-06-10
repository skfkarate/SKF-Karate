import { notFound } from 'next/navigation'
import ResultsDetailPageClient from './ResultsDetailPageClient'
import { getTournamentBySlugLive } from '@/lib/server/repositories/tournaments-live'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tournament = await getTournamentBySlugLive(slug)
  if (!tournament) {
    return buildSeoMetadata(
      '/results',
      'See SKF Karate tournament results, medals, champions, kata and kumite performance, competition records, and official karate achievements across India.'
    )
  }

  return buildSeoMetadata(
    `/results/${tournament.slug}`,
    `${tournament.name} results from SKF Karate with ${tournament.medals.gold} gold, ${tournament.medals.silver} silver, and ${tournament.medals.bronze} bronze medals in kata and kumite competition.`
  )
}

export default async function TournamentDetailPage({ params }) {
  const { slug } = await params
  const tournament = await getTournamentBySlugLive(slug)
  if (!tournament) notFound()
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(tournament.name, `/results/${tournament.slug}`)

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      <ResultsDetailPageClient tournament={tournament} />
    </>
  )
}
