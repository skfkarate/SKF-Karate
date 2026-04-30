'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, X, ChevronRight } from 'lucide-react'
import { EVENT_CATEGORY_LABELS, AGE_GROUP_LABELS } from '../../../lib/types/tournament'

import '@/app/rankings/rankings.css'

const ROWS_PER_PAGE = 20

const eventFilterOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'kata-individual', label: 'Kata Individual' },
  { value: 'kata-team', label: 'Kata Team' },
  { value: 'kumite-individual', label: 'Kumite Individual' },
  { value: 'kumite-team', label: 'Kumite Team' },
  { value: 'mixed', label: 'Mixed' },
]

const MEDAL_LABELS = { gold: '🥇', silver: '🥈', bronze: '🥉' }
const MEDAL_ORDER = { gold: 1, silver: 2, bronze: 3 }

export default function ResultsTable({ winners }) {
  const [filterText, setFilterText] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [catOpen, setCatOpen] = useState(false)
  const [sortKey, setSortKey] = useState('medal')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

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
    let result = [...(winners || [])]

    if (filterText.trim()) {
      const q = filterText.toLowerCase()
      result = result.filter(w =>
        w.athleteName.toLowerCase().includes(q) ||
        (EVENT_CATEGORY_LABELS[w.category] || '').toLowerCase().includes(q) ||
        w.branchName.toLowerCase().includes(q)
      )
    }

    if (eventFilter !== 'all') {
      result = result.filter(w => w.category === eventFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'medal':
          cmp = MEDAL_ORDER[a.medal] - MEDAL_ORDER[b.medal]
          if (cmp === 0) cmp = a.position - b.position
          if (cmp === 0) cmp = a.athleteName.localeCompare(b.athleteName)
          break
        case 'event':
          cmp = (EVENT_CATEGORY_LABELS[a.category] || '').localeCompare(EVENT_CATEGORY_LABELS[b.category] || '')
          break
        case 'athlete':
          cmp = a.athleteName.localeCompare(b.athleteName)
          break
        case 'branch':
          cmp = a.branchName.localeCompare(b.branchName)
          break
        default:
          cmp = MEDAL_ORDER[a.medal] - MEDAL_ORDER[b.medal]
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [winners, filterText, eventFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filteredAndSorted.length / ROWS_PER_PAGE)
  const paginatedRows = filteredAndSorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  if (!winners || winners.length === 0) {
    return (
      <div className="lb-wrap">
        <div className="lb-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥋</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 800 }}>Awaiting Official Results</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            Results are being verified and will appear here once finalized.
          </p>
        </div>
      </div>
    )
  }

  const eventLabel = eventFilter === 'all' ? 'All Events' : eventFilterOptions.find(o => o.value === eventFilter)?.label
  const resultCount = filteredAndSorted.length

  return (
    <div className="lb-wrap">
      <div className="lb-card">
        {/* ── Controls Row ── */}
        <div className="lb-controls" style={{ gap: '0.75rem' }}>
          <div className="lb-search" style={{ flex: 1 }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search athlete, branch..."
              value={filterText}
              onChange={(e) => { setFilterText(e.target.value); setPage(1); }}
            />
          </div>
          <div className="lb-dropdown" style={{ position: 'relative', flexShrink: 0, minWidth: 160 }}>
            <button className="lb-dropdown__btn" onClick={() => setCatOpen(!catOpen)} style={{ padding: '0.75rem 1rem', borderRadius: 10 }}>
              <span style={{ fontSize: '0.82rem' }}>{eventLabel}</span>
              {eventFilter !== 'all' ? <X size={12} onClick={(e) => { e.stopPropagation(); setEventFilter('all'); setPage(1); }} style={{ cursor: 'pointer' }} /> : <ChevronDown size={13} />}
            </button>
            {catOpen && (
              <div className="lb-dropdown__list">
                {eventFilterOptions.map(opt => (
                  <button key={opt.value} className={`lb-dropdown__opt ${eventFilter === opt.value ? 'lb-dropdown__opt--on' : ''}`} onClick={() => { setEventFilter(opt.value); setCatOpen(false); setPage(1); }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Count ── */}
        <div style={{ padding: '0 1.5rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {resultCount} Result{resultCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Scrollable Table Area ── */}
        <div className="td-table-scroll">
          {/* ── Table Header ── */}
          <div className="res-table-thead">
            <span className="res-tc-medal"></span>
            <span className="res-tc-athlete" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => handleSort('athlete')}>
              Athlete
            </span>
            <span className="res-tc-branch" style={{ cursor: 'pointer' }} onClick={() => handleSort('branch')}>Branch</span>
            <span className="res-tc-event" style={{ cursor: 'pointer' }} onClick={() => handleSort('event')}>Event</span>
            <span className="res-tc-wins" style={{ cursor: 'pointer' }}>Wins</span>
          </div>

          {/* ── Rows ── */}
          <div className="lb-rows">
            {paginatedRows.length === 0 && (
              <div className="lb-empty">No results match your filter.</div>
            )}
            {paginatedRows.map(w => (
              <div key={w.id} className="res-table-row">
                {/* Medal emoji as rank indicator */}
                <div className="res-tc-medal">
                  <span style={{ fontSize: '1.1rem' }} title={`${w.medal} — Position ${w.position}`}>
                    {MEDAL_LABELS[w.medal] || ''}
                  </span>
                </div>

                {/* Athlete name */}
                <div className="res-tc-athlete">
                  {w.registrationNumber ? (
                    <Link href={`/athlete/${w.registrationNumber}`} className="lb-name" style={{ textDecoration: 'none' }}>
                      {w.athleteName}
                    </Link>
                  ) : (
                    <span className="lb-name">{w.athleteName}</span>
                  )}
                </div>

                {/* Branch */}
                <div className="res-tc-branch">
                  <span className="lb-branch" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{w.branchName}</span>
                </div>

                {/* Event + Age group combined */}
                <div className="res-tc-event">
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.35, display: 'block' }}>
                    {EVENT_CATEGORY_LABELS[w.category] || w.category}
                    <br />
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                      {AGE_GROUP_LABELS[w.ageGroup] || w.ageGroup}
                    </span>
                  </span>
                </div>

                {/* Wins */}
                <div className="res-tc-wins">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: w.wins ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.1)' }}>
                    {w.wins ? `${w.wins} wins` : '-'}
                  </span>
                </div>

                <ChevronRight size={13} className="lb-row__arrow" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '1.25rem' }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="td-page-btn"
            style={{ opacity: page === 1 ? 0.3 : 1 }}
          >
            ‹ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`td-page-btn ${p === page ? 'td-page-btn--on' : ''}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            className="td-page-btn"
            style={{ opacity: page === totalPages ? 0.3 : 1 }}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  )
}
