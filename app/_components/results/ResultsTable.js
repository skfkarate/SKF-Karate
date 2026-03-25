'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'
import AchievementBadge from './AchievementBadge'
import { EVENT_CATEGORY_LABELS, AGE_GROUP_LABELS } from '../../../lib/types/tournament'

const ROWS_PER_PAGE = 20

const eventFilterOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'kata-individual', label: 'Kata Individual' },
  { value: 'kata-team', label: 'Kata Team' },
  { value: 'kumite-individual', label: 'Kumite Individual' },
  { value: 'kumite-team', label: 'Kumite Team' },
  { value: 'mixed', label: 'Mixed' },
]

export default function ResultsTable({ winners }) {
  const [filterText, setFilterText] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [sortKey, setSortKey] = useState('medal')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const medalOrder = { gold: 1, silver: 2, bronze: 3 }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...winners]

    // Text filter
    if (filterText.trim()) {
      const q = filterText.toLowerCase()
      result = result.filter(w =>
        w.athleteName.toLowerCase().includes(q) ||
        (EVENT_CATEGORY_LABELS[w.category] || '').toLowerCase().includes(q) ||
        w.branchName.toLowerCase().includes(q)
      )
    }

    // Event filter
    if (eventFilter !== 'all') {
      result = result.filter(w => w.category === eventFilter)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'medal':
          cmp = medalOrder[a.medal] - medalOrder[b.medal]
          if (cmp === 0) cmp = a.position - b.position
          if (cmp === 0) cmp = a.athleteName.localeCompare(b.athleteName)
          break
        case 'event':
          cmp = (EVENT_CATEGORY_LABELS[a.category] || '').localeCompare(EVENT_CATEGORY_LABELS[b.category] || '')
          break
        case 'ageGroup':
          cmp = (AGE_GROUP_LABELS[a.ageGroup] || '').localeCompare(AGE_GROUP_LABELS[b.ageGroup] || '')
          break
        case 'athlete':
          cmp = a.athleteName.localeCompare(b.athleteName)
          break
        case 'branch':
          cmp = a.branchName.localeCompare(b.branchName)
          break
        default:
          cmp = medalOrder[a.medal] - medalOrder[b.medal]
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [winners, filterText, eventFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filteredAndSorted.length / ROWS_PER_PAGE)
  const paginatedRows = filteredAndSorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <FaSort className="sort-icon" />
    return sortDir === 'asc'
      ? <FaSortUp className="sort-icon sort-icon--active" />
      : <FaSortDown className="sort-icon sort-icon--active" />
  }

  if (!winners || winners.length === 0) {
    return (
      <div className="results-empty animate-in fade-in">
        <FaSort className="results-empty__icon" style={{ opacity: 0.2 }} />
        <h2 className="results-empty__title">Awaiting Official Results</h2>
        <p className="results-empty__text">
          The official winner list for this tournament is currently being processed and verified. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="results-table-section">
      <div className="results-table__controls">
        <div className="results-table__search-wrapper">
          <svg className="results-table__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            className="results-table__search-input"
            placeholder="Filter by athlete name or event..."
            value={filterText}
            onChange={(e) => { setFilterText(e.target.value); setPage(1) }}
            aria-label="Filter results"
          />
        </div>
        <div className="results-table__event-pills">
          {eventFilterOptions.map(opt => (
            <button
              key={opt.value}
              className={`results-table__event-pill ${eventFilter === opt.value ? 'results-table__event-pill--active' : ''}`}
              onClick={() => { setEventFilter(opt.value); setPage(1) }}
              aria-pressed={eventFilter === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="results-table__wrapper">
        <table className="results-table">
          <caption>Tournament results and medal winners</caption>
          <thead>
            <tr>
              <th onClick={() => handleSort('medal')} aria-sort={sortKey === 'medal' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Pos <SortIcon column="medal" />
              </th>
              <th onClick={() => handleSort('athlete')} aria-sort={sortKey === 'athlete' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Athlete <SortIcon column="athlete" />
              </th>
              <th onClick={() => handleSort('branch')} aria-sort={sortKey === 'branch' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Branch <SortIcon column="branch" />
              </th>
              <th>Belt</th>
              <th onClick={() => handleSort('event')} aria-sort={sortKey === 'event' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Event <SortIcon column="event" />
              </th>
              <th onClick={() => handleSort('ageGroup')} aria-sort={sortKey === 'ageGroup' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Age Group <SortIcon column="ageGroup" />
              </th>
              <th>Medal</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                    No results match your filter.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedRows.map(w => (
                <tr key={w.id}>
                  <td>
                    <span className={`results-table__position results-table__position--${w.position}`}>
                      #{w.position}
                    </span>
                  </td>
                  <td className="results-table__athlete-name">
                    {w.registrationNumber ? (
                      <Link href={`/athlete/${w.registrationNumber}`} className="hover:text-[var(--gold)] transition-colors">
                        {w.athleteName}
                      </Link>
                    ) : (
                      w.athleteName
                    )}
                  </td>
                  <td>{w.branchName}</td>
                  <td>{w.belt}</td>
                  <td>{EVENT_CATEGORY_LABELS[w.category] || w.category}</td>
                  <td>{AGE_GROUP_LABELS[w.ageGroup] || w.ageGroup}</td>
                  <td><AchievementBadge medal={w.medal} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="results-table__pagination">
          <button
            className="results-table__page-btn prev-next"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`results-table__page-btn ${p === page ? 'results-table__page-btn--active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="results-table__page-btn prev-next"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
