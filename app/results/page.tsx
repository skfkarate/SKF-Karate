import {
  getAllTournamentsLive,
  getAvailableYearsLive,
  getTournamentStatsLive,
} from '@/lib/server/repositories/tournaments-live'
import ResultsPageClient from '../_components/results/ResultsPageClient'
import '@/app/results/results.css'

export const metadata = {
    title: 'Results | SKF Karate',
    description: 'Past SKF Karate competition results and statistics.',
}

export default async function ResultsPage() {
    const [allTournaments, stats, availableYears] = await Promise.all([
        getAllTournamentsLive(),
        getTournamentStatsLive(),
        getAvailableYearsLive(),
    ])

    return (
        <div style={{ paddingTop: '80px', minHeight: '100dvh', background: 'var(--bg-black)' }}>
            <ResultsPageClient 
                allTournaments={allTournaments}
                stats={stats}
                availableYears={availableYears}
            />
        </div>
    )
}
