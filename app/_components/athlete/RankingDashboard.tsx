'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, X, Trophy, Building2, User, ArrowUp, ArrowDown, Minus } from 'lucide-react'

function beltLabel(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

// Helper to generate a deterministic trend for visual demonstration
function getTrend(id, rank) {
  if (rank === 1) return 'same';
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mod = hash % 7;
  if (mod <= 2) return 'up';
  if (mod >= 5) return 'down';
  return 'same';
}

/* ═══════════════════════════════════════════════════════════════════════
   RANKING DASHBOARD — WKF-inspired
   ═══════════════════════════════════════════════════════════════════════ */
export default function RankingDashboard({ boards = [], dojos = [], totalRanked = 0 }) {
  const [activeTab, setActiveTab] = useState('overall') // 'overall' | 'dojo'
  const [selectedCategory, setSelectedCategory] = useState('')
  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const [catSearch, setCatSearch] = useState('')
  const [filterText, setFilterText] = useState('')
  const [topN, setTopN] = useState<number | 'all'>(10)

  // Dojo-specific state
  const [selectedDojo, setSelectedDojo] = useState('')
  const [dojoDropdownOpen, setDojoDropdownOpen] = useState(false)

  // ── Category list ──
  const categoryOptions = useMemo(() => {
    return boards.map((b) => ({ key: b.key, label: b.label, count: b.items.length }))
  }, [boards])

  const filteredCatOptions = useMemo(() => {
    if (!catSearch.trim()) return categoryOptions
    const q = catSearch.toLowerCase()
    return categoryOptions.filter((c) => c.label.toLowerCase().includes(q))
  }, [categoryOptions, catSearch])

  // ── Active board items ──
  const activeItems = useMemo(() => {
    let items = []
    if (selectedCategory) {
      const board = boards.find((b) => b.key === selectedCategory)
      items = board ? [...board.items] : []
    } else {
      // Show all athletes sorted by points when no category selected
      items = boards.flatMap((b) => b.items).sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      // Re-assign ranks
      items = items.map((item, i) => ({ ...item, categoryRank: i + 1 }))
    }

    // Filter by dojo if in dojo tab
    if (activeTab === 'dojo' && selectedDojo) {
      items = items.filter((item) => item.branchName === selectedDojo)
      // Re-rank after dojo filter
      items = items.map((item, i) => ({ ...item, categoryRank: i + 1 }))
    }

    // Text filter
    if (filterText.trim()) {
      const q = filterText.toLowerCase()
      items = items.filter(
        (item) =>
          (item.athleteName || '').toLowerCase().includes(q) ||
          (item.branchName || '').toLowerCase().includes(q) ||
          (item.registrationNumber || '').toLowerCase().includes(q)
      )
    }

    // Top N
    if (topN !== 'all') {
      items = items.slice(0, topN)
    }

    return items
  }, [boards, selectedCategory, activeTab, selectedDojo, filterText, topN])

  const activeCategoryLabel = selectedCategory
    ? categoryOptions.find((c) => c.key === selectedCategory)?.label || 'Select Category'
    : 'All Categories'

  return (
    <section className="rank-section">
      <div className="rank-container">
        {/* ── Header ── */}
        <div className="rank-header">
          <div>
            <span className="rank-header__tag">Official Standings</span>
            <h2 className="rank-header__title">SKF Rankings</h2>
            <p className="rank-header__sub">
              Current leaderboard built from live athlete records, medal outcomes, and active ranking points.
            </p>
          </div>
          <div className="rank-header__badge">{totalRanked} ranked athletes</div>
        </div>

        {/* ── Tabs ── */}
        <div className="rank-tabs">
          <button
            type="button"
            className={`rank-tabs__btn ${activeTab === 'overall' ? 'rank-tabs__btn--on' : ''}`}
            onClick={() => { setActiveTab('overall'); setSelectedDojo(''); }}
          >
            <Trophy size={14} /> SKF Overall Ranking
          </button>
          <button
            type="button"
            className={`rank-tabs__btn ${activeTab === 'dojo' ? 'rank-tabs__btn--on' : ''}`}
            onClick={() => setActiveTab('dojo')}
          >
            <Building2 size={14} /> Dojo Ranking
          </button>
        </div>

        {/* ── Panel ── */}
        <div className="rank-panel">

          {/* Dojo selector — only for dojo tab */}
          {activeTab === 'dojo' && (
            <div className="rank-selector-row">
              <div className="rank-combobox">
                <button
                  type="button"
                  className="rank-combobox__trigger"
                  onClick={() => setDojoDropdownOpen(!dojoDropdownOpen)}
                >
                  <span>{selectedDojo || 'Select a Dojo'}</span>
                  {selectedDojo ? (
                    <X size={14} className="rank-combobox__clear" onClick={(e) => { e.stopPropagation(); setSelectedDojo(''); }} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {dojoDropdownOpen && (
                  <div className="rank-combobox__dropdown">
                    {dojos.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`rank-combobox__option ${selectedDojo === d ? 'rank-combobox__option--on' : ''}`}
                        onClick={() => { setSelectedDojo(d); setDojoDropdownOpen(false); }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category selector */}
          <div className="rank-selector-row">
            <div className="rank-combobox">
              <button
                type="button"
                className="rank-combobox__trigger"
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              >
                <span>{activeCategoryLabel}</span>
                {selectedCategory ? (
                  <X size={14} className="rank-combobox__clear" onClick={(e) => { e.stopPropagation(); setSelectedCategory(''); setCatSearch(''); }} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {catDropdownOpen && (
                <div className="rank-combobox__dropdown">
                  <div className="rank-combobox__search-wrap">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Type to filter..."
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                      className="rank-combobox__search"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    className={`rank-combobox__option ${!selectedCategory ? 'rank-combobox__option--on' : ''}`}
                    onClick={() => { setSelectedCategory(''); setCatDropdownOpen(false); setCatSearch(''); }}
                  >
                    All Categories
                  </button>
                  {filteredCatOptions.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className={`rank-combobox__option ${selectedCategory === c.key ? 'rank-combobox__option--on' : ''}`}
                      onClick={() => { setSelectedCategory(c.key); setCatDropdownOpen(false); setCatSearch(''); }}
                    >
                      {c.label}
                      <span className="rank-combobox__count">{c.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter bar */}
          <div className="rank-filter-bar">
            <div className="rank-filter-bar__search">
              <Search size={14} className="rank-filter-bar__icon" />
              <input
                type="text"
                placeholder="Filter athletes or dojos..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="rank-filter-bar__input"
              />
            </div>
            <select
              value={topN}
              onChange={(e) => setTopN(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rank-filter-bar__select"
            >
              <option value={10}>Top 10</option>
              <option value={30}>Top 30</option>
              <option value={50}>Top 50</option>
              <option value="all">All</option>
            </select>
          </div>

          {/* Ranking table */}
          <div className="rank-tbl-wrap">
            <table className="rank-tbl">
              <thead>
                <tr className="rank-tbl__band">
                  <th colSpan={4}>
                    <div className="rank-tbl__band-text">
                      <span>{topN === 'all' ? 'All Athletes' : `Top ${topN}`}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th className="rank-tbl__th-rank" style={{ width: '7%' }}>Rank</th>
                  <th className="rank-tbl__th-athlete" style={{ width: '48%' }}>Athlete</th>
                  <th className="rank-tbl__th-branch" style={{ width: '25%' }}>{activeTab === 'dojo' ? 'Dojo' : 'Branch'}</th>
                  <th className="rank-tbl__th-pts" style={{ width: '20%' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {activeItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="rank-tbl__empty">
                      No athletes found. Try selecting a different category or adjusting filters.
                    </td>
                  </tr>
                )}
                {activeItems.map((entry) => {
                  const trend = getTrend(entry.athleteId, entry.categoryRank);
                  return (
                    <tr key={`${entry.athleteId}-${entry.categoryRank}`}>
                      <td>
                        <div className="rank-tbl__rank-col">
                          <div className={`rank-badge ${entry.categoryRank === 1 ? 'rank-badge--gold' : entry.categoryRank === 2 ? 'rank-badge--silver' : entry.categoryRank === 3 ? 'rank-badge--bronze' : ''}`}>
                            {entry.categoryRank}
                          </div>
                          <div className={`rank-trend rank-trend--${trend}`}>
                            {trend === 'up' && <ArrowUp size={16} strokeWidth={3} />}
                            {trend === 'down' && <ArrowDown size={16} strokeWidth={3} />}
                            {trend === 'same' && <Minus size={16} strokeWidth={3} />}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link href={`/athlete/${entry.registrationNumber}`} className="rank-tbl__athlete">
                          <User size={20} className="rank-tbl__icon" strokeWidth={1.5} />
                          <div className="rank-tbl__info">
                            <span className="rank-tbl__name">{entry.athleteName}</span>
                            <span className="rank-tbl__belt">{beltLabel(entry.currentBelt)}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="rank-tbl__branch">{entry.branchName}</td>
                      <td className="rank-tbl__pts">
                        <span className="rank-tbl__pts-num">{Number(entry.totalPoints || 0).toFixed(0)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
