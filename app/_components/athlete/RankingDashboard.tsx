'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Trophy, Building2, ChevronDown, X, ArrowUp, ArrowDown, Minus, ChevronRight } from 'lucide-react'

type TabKey = 'overall' | 'dojo'
type TopN = 10 | 30 | 'all'
type RankMovement = 'up' | 'down' | 'same' | 'new'

type RankingBoardItem = {
  athleteId: string
  skfId: string
  athleteName: string
  currentBelt: string
  branchName: string
  joinDate?: string
  totalPoints?: number
  categoryRank?: number
  overallRank?: number
  branchRank?: number
  previousOverallRank?: number | null
  previousCategoryRank?: number | null
  previousBranchRank?: number | null
  overallRankDelta?: number | null
  categoryRankDelta?: number | null
  branchRankDelta?: number | null
  overallMovement?: RankMovement
  categoryMovement?: RankMovement
  branchMovement?: RankMovement
  rankingMovement?: RankMovement
  rankDelta?: number | null
}

type RankingItem = RankingBoardItem & {
  categoryRank: number
}

type RankingBoard = {
  key: string
  label: string
  items: RankingBoardItem[]
}

type CategoryOption = {
  key: string
  label: string
  count: number
}

type RankingDashboardProps = {
  boards?: RankingBoard[]
  dojos?: string[]
  totalRanked?: number
  hasAnyTournamentPoints?: boolean
}

const TOP_N_OPTIONS: TopN[] = [10, 30, 'all']

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

function getTrendState(
  entry: RankingItem,
  activeTab: TabKey,
  selectedCategory: string,
  selectedDojo: string
) {
  let result: { label: string; movement: RankMovement; delta: number | null }

  if (activeTab === 'dojo' && selectedDojo) {
    result = {
      label: 'Branch movement',
      movement: entry.branchMovement || 'new',
      delta: entry.branchRankDelta ?? null,
    }
  } else if (selectedCategory) {
    result = {
      label: 'Category movement',
      movement: entry.categoryMovement || entry.rankingMovement || 'new',
      delta: entry.categoryRankDelta ?? entry.rankDelta ?? null,
    }
  } else {
    result = {
      label: 'Overall movement',
      movement: entry.overallMovement || 'new',
      delta: entry.overallRankDelta ?? null,
    }
  }

  if (result.movement === 'new') {
    const isNew = entry.joinDate
      ? new Date(entry.joinDate).getTime() > Date.now() - 15 * 24 * 60 * 60 * 1000
      : false;
    if (!isNew) result.movement = 'same'
  }

  return result
}

function trendTitle(label: string, movement: RankMovement, delta: number | null) {
  if (movement === 'new') return `${label}: new entry`
  if (movement === 'same') return `${label}: unchanged`

  const places = Math.abs(delta || 0)
  return `${label}: moved ${movement} ${places} place${places === 1 ? '' : 's'}`
}

function TrendIndicator({
  movement,
  delta,
  label,
}: {
  movement: RankMovement
  delta: number | null
  label: string
}) {
  const places = Math.abs(delta || 0)

  return (
    <span className={`lb-trend lb-trend--${movement}`} title={trendTitle(label, movement, delta)}>
      {movement === 'up' && <ArrowUp size={10} strokeWidth={3} />}
      {movement === 'down' && <ArrowDown size={10} strokeWidth={3} />}
      {movement === 'same' && <Minus size={10} />}
      {movement === 'new' && <span className="lb-trend__new">NEW</span>}
      {(movement === 'up' || movement === 'down') && places > 0 ? (
        <span className="lb-trend__value">{places}</span>
      ) : null}
    </span>
  )
}

export default function RankingDashboard({ boards = [], dojos = [], totalRanked = 0, hasAnyTournamentPoints = false }: RankingDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overall')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [catSearch, setCatSearch] = useState('')
  const [filterText, setFilterText] = useState('')
  const [topN, setTopN] = useState<TopN>(10)
  const [selectedDojo, setSelectedDojo] = useState('')
  const [dojoOpen, setDojoOpen] = useState(false)

  const catOptions = useMemo(() =>
    boards.map((b) => ({ key: b.key, label: b.label, count: b.items.length }))
  , [boards])

  const filteredCats = useMemo(() => {
    if (!catSearch.trim()) return catOptions
    const q = catSearch.toLowerCase()
    return catOptions.filter((c) => c.label.toLowerCase().includes(q))
  }, [catOptions, catSearch])

  const items = useMemo<RankingItem[]>(() => {
    let list: RankingItem[] = []
    if (selectedCategory) {
      const b = boards.find((board) => board.key === selectedCategory)
      list = b
        ? b.items.map((item, index) => ({ ...item, categoryRank: item.categoryRank ?? index + 1 }))
        : []
    } else {
      const rankedItems = boards
        .flatMap((board) => board.items)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      list = rankedItems.map((item, i) => ({ ...item, categoryRank: i + 1 }))
    }
    if (activeTab === 'dojo' && selectedDojo) {
      list = list.filter(i => i.branchName === selectedDojo).map((item, i) => ({ ...item, categoryRank: i + 1 }))
    }
    if (filterText.trim()) {
      const q = filterText.toLowerCase()
      list = list.filter(i => (i.athleteName||'').toLowerCase().includes(q) || (i.branchName||'').toLowerCase().includes(q) || (i.skfId||'').toLowerCase().includes(q))
    }
    if (topN !== 'all') list = list.slice(0, topN)
    return list
  }, [boards, selectedCategory, activeTab, selectedDojo, filterText, topN])

  const maxPts = items.length > 0 ? Math.max(...items.map((e) => e.totalPoints || 0)) : 1
  const catLabel = selectedCategory ? catOptions.find((c) => c.key === selectedCategory)?.label || 'Category' : 'All Categories'

  return (
    <div className="lb-wrap">
      {/* ── Tabs ── */}
      <div className="lb-tabs">
        <button className={`lb-tab ${activeTab === 'overall' ? 'lb-tab--on' : ''}`} onClick={() => { setActiveTab('overall'); setSelectedDojo('') }}>
          <Trophy size={13} /> Overall
        </button>
        <button className={`lb-tab ${activeTab === 'dojo' ? 'lb-tab--on' : ''}`} onClick={() => setActiveTab('dojo')}>
          <Building2 size={13} /> By Dojo
        </button>
      </div>

      {/* ── Glass Card ── */}
      <div className="lb-card">

        {/* Dojo selector */}
        {activeTab === 'dojo' && (
          <div className="lb-dropdown-row">
            <div className="lb-dropdown">
              <button className="lb-dropdown__btn" onClick={() => setDojoOpen(!dojoOpen)}>
                <span>{selectedDojo || 'Select Dojo'}</span>
                {selectedDojo ? <X size={13} onClick={e => { e.stopPropagation(); setSelectedDojo('') }} style={{ cursor: 'pointer' }} /> : <ChevronDown size={14} />}
              </button>
              {dojoOpen && (
                <div className="lb-dropdown__list">
                  {dojos.map((d: string) => (
                    <button key={d} className={`lb-dropdown__opt ${selectedDojo === d ? 'lb-dropdown__opt--on' : ''}`} onClick={() => { setSelectedDojo(d); setDojoOpen(false) }}>{d}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category selector — hide when only 1 category */}
        {catOptions.length > 1 && (
        <div className="lb-dropdown-row">
          <div className="lb-dropdown">
            <button className="lb-dropdown__btn" onClick={() => setCatOpen(!catOpen)}>
              <span>{catLabel}</span>
              {selectedCategory ? <X size={13} onClick={e => { e.stopPropagation(); setSelectedCategory(''); setCatSearch('') }} style={{ cursor: 'pointer' }} /> : <ChevronDown size={14} />}
            </button>
            {catOpen && (
              <div className="lb-dropdown__list">
                <div className="lb-dropdown__search">
                  <Search size={13} />
                  <input type="text" placeholder="Search categories..." value={catSearch} onChange={e => setCatSearch(e.target.value)} autoFocus />
                </div>
                <button className={`lb-dropdown__opt ${!selectedCategory ? 'lb-dropdown__opt--on' : ''}`} onClick={() => { setSelectedCategory(''); setCatOpen(false); setCatSearch('') }}>
                  All Categories <span className="lb-dropdown__count">{totalRanked}</span>
                </button>
                {filteredCats.map((c: CategoryOption) => (
                  <button key={c.key} className={`lb-dropdown__opt ${selectedCategory === c.key ? 'lb-dropdown__opt--on' : ''}`} onClick={() => { setSelectedCategory(c.key); setCatOpen(false); setCatSearch('') }}>
                    {c.label} <span className="lb-dropdown__count">{c.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Filter + TopN */}
        <div className="lb-controls">
          <div className="lb-search">
            <Search size={14} />
            <input type="text" placeholder="Filter athletes..." value={filterText} onChange={e => setFilterText(e.target.value)} />
          </div>
          <div className="lb-topn">
            {TOP_N_OPTIONS.map(n => (
              <button key={String(n)} className={`lb-topn__btn ${topN === n ? 'lb-topn__btn--on' : ''}`} onClick={() => setTopN(n)}>
                {n === 'all' ? 'All' : n}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table Header ── */}
        <div className="lb-thead">
          <span className="lb-th lb-th--rank">#</span>
          <span className="lb-th lb-th--name">Athlete</span>
          <span className="lb-th lb-th--belt">Belt</span>
          <span className="lb-th lb-th--branch">Branch</span>
          {hasAnyTournamentPoints && <span className="lb-th lb-th--pts">Points</span>}
        </div>

        {/* ── Rows ── */}
        <div className="lb-rows">
          {items.length === 0 && (
            <div className="lb-empty">No athletes match your filters.</div>
          )}
          {items.map((e) => {
            const trend = getTrendState(e, activeTab, selectedCategory, selectedDojo)
            const pct = Math.max(6, ((e.totalPoints || 0) / maxPts) * 100)
            return (
              <Link key={`${e.athleteId}-${e.categoryRank}`} href={`/athlete/${e.skfId}`} className="lb-row">
                {/* Rank */}
                <div className="lb-cell lb-cell--rank">
                  <span className={`lb-rank ${e.categoryRank <= 3 ? `lb-rank--${e.categoryRank}` : ''}`}>
                    {e.categoryRank}
                  </span>
                  <TrendIndicator {...trend} />
                </div>

                {/* Name */}
                <div className="lb-cell lb-cell--name">
                  <span className="lb-name">{e.athleteName}</span>
                </div>

                {/* Belt */}
                <div className="lb-cell lb-cell--belt">
                  <span className="lb-belt">{beltLabel(e.currentBelt)}</span>
                </div>

                {/* Branch */}
                <div className="lb-cell lb-cell--branch">
                  <span className="lb-branch">{e.branchName}</span>
                </div>

                {/* Points — only when tournaments exist */}
                {hasAnyTournamentPoints && (
                <div className="lb-cell lb-cell--pts">
                  <div className="lb-pts">
                    <span className="lb-pts__val">{Number(e.totalPoints || 0).toFixed(0)}</span>
                    <div className="lb-pts__bar">
                      <div className="lb-pts__fill" style={{
                        width: `${pct}%`,
                        background: e.categoryRank === 1 ? '#ffd700' : e.categoryRank === 2 ? '#aaa' : e.categoryRank === 3 ? '#cd7f32' : 'rgba(214,40,40,0.45)'
                      }} />
                    </div>
                  </div>
                </div>
                )}

                <ChevronRight size={14} className="lb-row__arrow" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
