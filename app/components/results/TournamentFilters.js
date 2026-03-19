'use client'

import { TOURNAMENT_LEVEL_LABELS } from '../../../lib/types/tournament'

const levelOptions = [
  { value: 'all', label: 'All' },
  { value: 'inter-dojo', label: 'Inter-Dojo' },
  { value: 'district', label: 'District' },
  { value: 'state', label: 'State' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
]

export default function TournamentFilters({ filters, availableYears, totalCount, filteredCount, onChange }) {
  const handleLevelChange = (level) => {
    onChange({ ...filters, level })
  }

  const handleYearChange = (e) => {
    const val = e.target.value
    onChange({ ...filters, year: val === 'all' ? 'all' : Number(val) })
  }

  const handleSearchChange = (e) => {
    onChange({ ...filters, search: e.target.value })
  }

  return (
    <div className="results-filters" role="search" aria-label="Filter tournaments">
      <div className="container results-filters__inner">
        <div className="results-filters__pills">
          {levelOptions.map(opt => (
            <button
              key={opt.value}
              className={`results-filters__pill ${(filters.level || 'all') === opt.value ? 'results-filters__pill--active' : ''}`}
              onClick={() => handleLevelChange(opt.value)}
              aria-pressed={(filters.level || 'all') === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="results-filters__controls">
          <select
            className="results-filters__select"
            value={filters.year || 'all'}
            onChange={handleYearChange}
            aria-label="Filter by year"
          >
            <option value="all">All Years</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <input
            type="text"
            className="results-filters__search"
            placeholder="Search tournaments, athletes..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            aria-label="Search tournaments"
          />
        </div>

        <span className="results-filters__count">
          Showing {filteredCount} of {totalCount} tournaments
        </span>
      </div>
    </div>
  )
}
