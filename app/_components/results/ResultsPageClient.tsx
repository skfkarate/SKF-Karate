'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import TournamentHero from './TournamentHero'
import TournamentFilters from './TournamentFilters'
import TournamentCard from './TournamentCard'

export default function ResultsPageClient({
  allTournaments,
  stats,
  availableYears,
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filters, setFilters] = useState({
    level: searchParams.get('level') || 'all',
    year: searchParams.get('year') ? Number(searchParams.get('year')) : 'all',
    search: searchParams.get('q') || '',
  })

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.level && filters.level !== 'all') params.set('level', filters.level)
    if (filters.year && filters.year !== 'all') params.set('year', String(filters.year))
    if (filters.search) params.set('q', filters.search)

    const queryString = params.toString()
    const newUrl = queryString ? `/tournaments?${queryString}` : '/tournaments'
    router.replace(newUrl, { scroll: false })
  }, [filters, router])

  const filteredTournaments = useMemo(() => {
    let result = [...allTournaments]

    if (filters.level && filters.level !== 'all') {
      result = result.filter((tournament) => tournament.level === filters.level)
    }

    if (filters.year && filters.year !== 'all') {
      result = result.filter(
        (tournament) => new Date(tournament.date).getFullYear() === filters.year
      )
    }

    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase().trim()
      result = result.filter(
        (tournament) =>
          tournament.name.toLowerCase().includes(query) ||
          tournament.shortName.toLowerCase().includes(query) ||
          tournament.venue.toLowerCase().includes(query) ||
          tournament.city.toLowerCase().includes(query) ||
          tournament.winners.some((winner) =>
            winner.athleteName.toLowerCase().includes(query)
          )
      )
    }

    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return result
  }, [allTournaments, filters])

  return (
    <>
      <TournamentHero stats={stats} />
      <TournamentFilters
        filters={filters}
        availableYears={availableYears}
        totalCount={allTournaments.length}
        filteredCount={filteredTournaments.length}
        onChange={setFilters}
      />

      <div className="container" style={{ paddingBottom: '5rem' }}>
        {filteredTournaments.length > 0 ? (
          <div className="results-grid">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="results-empty">
            <div className="results-empty__icon">🥋</div>
            <h3 className="results-empty__title">
              {filters.level !== 'all'
                ? `No ${filters.level} tournaments recorded yet.`
                : 'No tournaments found matching your search. Oss!'}
            </h3>
            <p className="results-empty__text">
              Try adjusting your filters or search terms.
            </p>
            <Link href="/contact" className="btn btn-secondary">
              Contact us about upcoming tournaments
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
