'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Trophy, Building2, ChevronDown, X, ArrowUp, ArrowDown, Minus, ChevronRight } from 'lucide-react'

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

function getTrend(id: string, rank: number) {
  if (rank === 1) return 'same'
  const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const m = h % 7
  return m <= 2 ? 'up' : m >= 5 ? 'down' : 'same'
}

export default function RankingDashboard({ boards = [], dojos = [], totalRanked = 0 }: any) {
  const [activeTab, setActiveTab] = useState('overall')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [catSearch, setCatSearch] = useState('')
  const [filterText, setFilterText] = useState('')
  const [topN, setTopN] = useState<number | 'all'>(10)
  const [selectedDojo, setSelectedDojo] = useState('')
  const [dojoOpen, setDojoOpen] = useState(false)

  const catOptions = useMemo(() =>
    boards.map((b: any) => ({ key: b.key, label: b.label, count: b.items.length }))
  , [boards])

  const filteredCats = useMemo(() => {
    if (!catSearch.trim()) return catOptions
    const q = catSearch.toLowerCase()
    return catOptions.filter((c: any) => c.label.toLowerCase().includes(q))
  }, [catOptions, catSearch])

  const items = useMemo(() => {
    let list: any[] = []
    if (selectedCategory) {
      const b = boards.find((b: any) => b.key === selectedCategory)
      list = b ? [...b.items] : []
    } else {
      list = boards.flatMap((b: any) => b.items).sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
      list = list.map((item, i) => ({ ...item, categoryRank: i + 1 }))
    }
    if (activeTab === 'dojo' && selectedDojo) {
      list = list.filter(i => i.branchName === selectedDojo).map((item, i) => ({ ...item, categoryRank: i + 1 }))
    }
    if (filterText.trim()) {
      const q = filterText.toLowerCase()
      list = list.filter(i => (i.athleteName||'').toLowerCase().includes(q) || (i.branchName||'').toLowerCase().includes(q) || (i.registrationNumber||'').toLowerCase().includes(q))
    }
    if (topN !== 'all') list = list.slice(0, topN)
    return list
  }, [boards, selectedCategory, activeTab, selectedDojo, filterText, topN])

  const maxPts = items.length > 0 ? Math.max(...items.map((e: any) => e.totalPoints || 0)) : 1
  const catLabel = selectedCategory ? catOptions.find((c: any) => c.key === selectedCategory)?.label || 'Category' : 'All Categories'

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

        {/* Category selector */}
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
                {filteredCats.map((c: any) => (
                  <button key={c.key} className={`lb-dropdown__opt ${selectedCategory === c.key ? 'lb-dropdown__opt--on' : ''}`} onClick={() => { setSelectedCategory(c.key); setCatOpen(false); setCatSearch('') }}>
                    {c.label} <span className="lb-dropdown__count">{c.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter + TopN */}
        <div className="lb-controls">
          <div className="lb-search">
            <Search size={14} />
            <input type="text" placeholder="Filter athletes..." value={filterText} onChange={e => setFilterText(e.target.value)} />
          </div>
          <div className="lb-topn">
            {[10, 30, 'all' as const].map(n => (
              <button key={String(n)} className={`lb-topn__btn ${topN === n ? 'lb-topn__btn--on' : ''}`} onClick={() => setTopN(n as any)}>
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
          <span className="lb-th lb-th--pts">Points</span>
        </div>

        {/* ── Rows ── */}
        <div className="lb-rows">
          {items.length === 0 && (
            <div className="lb-empty">No athletes match your filters.</div>
          )}
          {items.map((e: any) => {
            const trend = getTrend(e.athleteId, e.categoryRank)
            const pct = Math.max(6, ((e.totalPoints || 0) / maxPts) * 100)
            return (
              <Link key={`${e.athleteId}-${e.categoryRank}`} href={`/athlete/${e.registrationNumber}`} className="lb-row">
                {/* Rank */}
                <div className="lb-cell lb-cell--rank">
                  <span className={`lb-rank ${e.categoryRank <= 3 ? `lb-rank--${e.categoryRank}` : ''}`}>
                    {e.categoryRank}
                  </span>
                  <span className={`lb-trend lb-trend--${trend}`}>
                    {trend === 'up' && <ArrowUp size={10} strokeWidth={3} />}
                    {trend === 'down' && <ArrowDown size={10} strokeWidth={3} />}
                    {trend === 'same' && <Minus size={10} />}
                  </span>
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

                {/* Points */}
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

                <ChevronRight size={14} className="lb-row__arrow" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
