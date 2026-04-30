import ResultsPageClient from '../_components/results/ResultsPageClient'
import { absoluteMediaUrl, absoluteSiteUrl } from '@/data/constants/siteConfig'
import { getAllTournamentsLive } from '@/lib/server/repositories/tournaments-live'
import '@/app/results/results.css'

export const metadata = {
    title: 'Results | SKF Karate',
    description: 'Past SKF Karate competition results and statistics.',
    alternates: {
        canonical: absoluteSiteUrl('/results'),
    },
    openGraph: {
        title: 'Results | SKF Karate',
        description: 'Past SKF Karate competition results and statistics.',
        url: absoluteSiteUrl('/results'),
        type: 'website',
        images: [{ url: absoluteMediaUrl(), width: 1200, height: 630, alt: 'SKF Karate competition results' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Results | SKF Karate',
        description: 'Past SKF Karate competition results and statistics.',
        images: [absoluteMediaUrl()],
    },
}

export default async function ResultsPage() {
    const allTournaments = await getAllTournamentsLive()

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
            <ResultsPageClient 
                allTournaments={allTournaments}
                stats={stats}
                availableYears={availableYears}
            />
        </div>
    )
}
