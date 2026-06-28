import ResultsPageClient from '../_components/results/ResultsPageClient'
import { getAllTournamentsLive } from '@/lib/server/repositories/tournaments-live'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'
import '@/app/results/results.css'

export const metadata = buildSeoMetadata(
    '/results',
    "SKF Karate tournament results — medals, champions, kata and kumite performance at district, state, and national level. India's #1 karate association official records.",
    { title: "SKF Karate Tournament Results | Champions & Medals | Karnataka & India" }
)

export default async function ResultsPage() {
    const allTournaments = await getAllTournamentsLive()
    const breadcrumbJsonLd = buildBreadcrumbJsonLd('Results', '/results')

    // Calculate real stats from the database
    const stats = {
        totalTournaments: allTournaments.length,
        totalGold: allTournaments.reduce((sum, t) => sum + (t.medals?.gold || 0), 0),
        totalSilver: allTournaments.reduce((sum, t) => sum + (t.medals?.silver || 0), 0),
        totalBronze: allTournaments.reduce((sum, t) => sum + (t.medals?.bronze || 0), 0),
        nationalChampions: allTournaments.filter(t => t.level === 'national').reduce((sum, t) => sum + (t.medals?.gold || 0), 0),
    }

    const availableYears = Array.from(new Set(allTournaments.map(t => new Date(t.date).getFullYear()))).sort((a, b) => b - a)
    return (
        <div className="res-page">
            <JsonLdScript data={breadcrumbJsonLd} />
            <ResultsPageClient 
                allTournaments={allTournaments}
                stats={stats}
                availableYears={availableYears}
            />
        </div>
    )
}
