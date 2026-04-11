import { Suspense } from 'react'
import ResultsPageClient from '@/app/_components/results/ResultsPageClient'
import {
  getAllTournaments,
  getAvailableYears,
  getTournamentStats,
} from '../../lib/data/tournaments'
import './results.css'

function ResultsPageContent() {
  const allTournaments = getAllTournaments()
  const stats = getTournamentStats()
  const availableYears = getAvailableYears()

  return (
    <ResultsPageClient
      allTournaments={allTournaments}
      stats={stats}
      availableYears={availableYears}
    />
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <ResultsPageContent />
    </Suspense>
  )
}
