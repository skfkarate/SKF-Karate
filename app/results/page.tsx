import {
  getAllTournaments,
  getAvailableYears,
  getTournamentStats,
} from '../../lib/data/tournaments'
import ResultsPageClient from '../_components/results/ResultsPageClient'
import '@/app/results/results.css'

export const metadata = {
    title: 'Results | SKF Karate',
    description: 'Past SKF Karate competition results and statistics.',
}

export default function ResultsPage() {
    const allTournaments = getAllTournaments()
    const stats = getTournamentStats()
    const availableYears = getAvailableYears()

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-black)' }}>
            <ResultsPageClient 
                allTournaments={allTournaments}
                stats={stats}
                availableYears={availableYears}
            />
        </div>
    )
}
