'use client'

import { FaSearch, FaChevronDown } from 'react-icons/fa'

const levelOptions = [
  { value: 'all', label: 'All Levels' },
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
        {/* Level Pills — horizontal scroll on mobile */}
        <div className="results-filters__pills-track">
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
        </div>

        {/* Controls Row */}
        <div className="results-filters__controls">
          {/* Year Select — Premium styled */}
          <div className="results-filters__select-wrap">
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
            <FaChevronDown className="results-filters__select-icon" />
          </div>

          {/* Search — Premium styled */}
          <div className="results-filters__search-wrap">
            <FaSearch className="results-filters__search-icon" />
            <input
              type="text"
              className="results-filters__search"
              placeholder="Search tournaments, athletes..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              aria-label="Search tournaments"
            />
          </div>
        </div>

        {/* Count */}
        <span className="results-filters__count">
          {filteredCount} of {totalCount} {filteredCount === 1 ? 'Tournament' : 'Tournaments'}
        </span>
      </div>
    </div>
  )
}
