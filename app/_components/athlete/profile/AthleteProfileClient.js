'use client'

import { useMemo, useState } from 'react'
import {
  Search, ChevronRight, Eye,
  Calendar, MapPin, Trophy, Flame, Shield, Star, Zap, Users,
} from 'lucide-react'
import '@/app/athlete-profile.css'

/* ═══════════════════════════════════════════════════════════════════════
   MEDAL BADGE — colored circle for ranks 1-3
   ═══════════════════════════════════════════════════════════════════════ */
function MedalBadge({ rank }) {
  if (rank === '*' || rank === '-' || rank == null) {
    return <span className="ap-rank-plain">{rank ?? '-'}</span>
  }
  const n = typeof rank === 'number' ? rank : Number.parseInt(rank, 10)
  if (n >= 1 && n <= 3) {
    const cls = ['', 'ap-rank-gold', 'ap-rank-silver', 'ap-rank-bronze'][n]
    return <span className={`ap-rank-circle ${cls}`}>{n}</span>
  }
  return <span className="ap-rank-plain">{rank}</span>
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION HEADER — bold heading with accent bar
   ═══════════════════════════════════════════════════════════════════════ */
function SectionHeader({ icon, label }) {
  return (
    <div className="ap-sec-head">
      <div className="ap-sec-head__bar" />
      <div className="ap-sec-head__icon">{icon}</div>
      <h2 className="ap-sec-head__text">{label}</h2>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO — clean 2-column: photo+name left | stats+rank right
   ═══════════════════════════════════════════════════════════════════════ */
function AthleteHero({ athleteInfo, categories }) {
  const primary = categories.find((c) => c.isPrimary) || categories[0]
  const totalG = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.gold, 0), 0)
  const totalS = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.silver, 0), 0)
  const totalB = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.bronze, 0), 0)
  const totalMedals = totalG + totalS + totalB

  return (
    <section className="ap-hero ap-animate-in">
      <div className="ap-hero-card">
        {/* Left: photo + name */}
        <div className="ap-hero__left">
          <div className="ap-hero__portrait">
            <img
              src={athleteInfo.photo}
              alt={athleteInfo.name}
              className="ap-hero__portrait-img"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 300"><rect fill="%23192038" width="260" height="300"/></svg>'
              }}
            />
            <div className="ap-hero__portrait-overlay">
              <div className="ap-hero__name-block">
                <h1 className="ap-hero__name">{athleteInfo.name}</h1>
                <span className="ap-hero__id">{athleteInfo.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats grid + Rank + Medals */}
        <div className="ap-hero__right">
          {/* Rank highlight */}
          <div className="ap-hero__rank-row">
            <div className="ap-hero__rank-num">
              {primary.rank ? `#${primary.rank}` : '—'}
            </div>
            <div className="ap-hero__rank-meta">
              <span className="ap-hero__rank-label">World Ranking</span>
              <span className="ap-hero__rank-cat">{primary.name}</span>
              <span className="ap-hero__rank-pts">{primary.points.toLocaleString()} pts</span>
            </div>
            <img src={athleteInfo.countryFlag} alt="" className="ap-hero__rank-flag" />
          </div>

          {/* Quick stats */}
          <div className="ap-hero__stats-row">
            <div className="ap-hero__stat">
              <span className="ap-hero__stat-val">{athleteInfo.age}</span>
              <span className="ap-hero__stat-lbl">Age</span>
            </div>
            <div className="ap-hero__stat-sep" />
            <div className="ap-hero__stat">
              <span className="ap-hero__stat-val">{athleteInfo.country}</span>
              <span className="ap-hero__stat-lbl">Country</span>
            </div>
            <div className="ap-hero__stat-sep" />
            <div className="ap-hero__stat">
              <span className="ap-hero__stat-val">{athleteInfo.totalBouts}</span>
              <span className="ap-hero__stat-lbl">Bouts</span>
            </div>
            <div className="ap-hero__stat-sep" />
            <div className="ap-hero__stat">
              <span className="ap-hero__stat-val">{athleteInfo.winRate}</span>
              <span className="ap-hero__stat-lbl">Win Rate</span>
            </div>
          </div>

          {/* Medal tally */}
          <div className="ap-hero__medals">
            <div className="ap-hero__medal ap-hero__medal--gold">
              <div className="ap-hero__medal-circle">{totalG}</div>
              <span>Gold</span>
            </div>
            <div className="ap-hero__medal ap-hero__medal--silver">
              <div className="ap-hero__medal-circle">{totalS}</div>
              <span>Silver</span>
            </div>
            <div className="ap-hero__medal ap-hero__medal--bronze">
              <div className="ap-hero__medal-circle">{totalB}</div>
              <span>Bronze</span>
            </div>
            <div className="ap-hero__medal-total">
              <span className="ap-hero__medal-total-num">{totalMedals}</span>
              <span>Total</span>
            </div>
          </div>
          </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEXT EVENTS
   ═══════════════════════════════════════════════════════════════════════ */
function NextEventsSection({ nextEvents }) {
  if (!nextEvents || nextEvents.length === 0) return null
  return (
    <section className="ap-section ap-animate-in ap-delay-1">
      <SectionHeader icon={<Calendar size={16} />} label="Upcoming Events" />
      <div className="ap-events-row">
        {nextEvents.map((ev) => (
          <div key={`${ev.dateRange}-${ev.name}`} className="ap-ev-card">
            <div className="ap-ev-card__date">{ev.dateRange}</div>
            <div className="ap-ev-card__body">
              <img src={ev.flag} alt="" className="ap-ev-card__flag" loading="lazy" />
              <span className="ap-ev-card__name">{ev.name}</span>
            </div>
            <ChevronRight size={15} className="ap-ev-card__arrow" />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   TABBED COMPETITION RESULTS — sorted descending
   ═══════════════════════════════════════════════════════════════════════ */
function TabbedCompetitions({ categories }) {
  const [activeTab, setActiveTab] = useState(0)
  const [filter, setFilter] = useState('')

  // Sort: ranked categories first (ascending), then unranked alphabetically
  const sortedCategories = useMemo(() => {
    const ranked = categories.filter((c) => c.rank).sort((a, b) => a.rank - b.rank)
    const unranked = categories.filter((c) => !c.rank).sort((a, b) => a.name.localeCompare(b.name))
    return [...ranked, ...unranked]
  }, [categories])

  const cat = sortedCategories[activeTab]

  const hasAnyResults = sortedCategories.some((c) => c.results && c.results.length > 0)
  if (!sortedCategories || sortedCategories.length === 0 || !hasAnyResults) return null

  const filtered = useMemo(() => {
    let rows = [...cat.results].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (filter.trim()) {
      const q = filter.toLowerCase()
      rows = rows.filter((r) => r.event.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.date.includes(q))
    }
    return rows
  }, [cat, filter])

  return (
    <section id="ap-competition-section" className="ap-section ap-animate-in ap-delay-2">
      <SectionHeader icon={<Trophy size={16} />} label="Competition Results" />
      <div className="ap-panel">
        {/* Tabs */}
        <div className="ap-tabs">
          {sortedCategories.map((c, i) => (
            <button key={c.name} type="button" className={`ap-tab ${activeTab === i ? 'ap-tab--on' : ''}`}
              onClick={() => { setActiveTab(i); setFilter('') }}>
              {c.name}
              {c.rank ? <span className="ap-tab__badge">#{c.rank}</span> : null}
            </button>
          ))}
        </div>

        {/* Category overview */}
        <div className="ap-cat-overview">
          {/* Category title */}
          <h3 className="ap-cat-overview__title">{cat.name}</h3>

          {/* Rank row */}
          <div className="ap-cat-overview__rank">
            {cat.rank ? (
              <span className="ap-cat-overview__rank-circle">{cat.rank}</span>
            ) : (
              <span className="ap-cat-overview__rank-circle ap-cat-overview__rank-circle--unranked">–</span>
            )}
            <span className="ap-cat-overview__rank-label">RANK</span>
            <span className="ap-cat-overview__rank-pts">
              {cat.points != null ? `${cat.points.toLocaleString()} points` : 'No points yet'}
            </span>
          </div>

          {/* Honours */}
          {cat.honours && cat.honours.length > 0 && (
            <>
              <h4 className="ap-cat-overview__hon-title">Honours</h4>
              <div className="ap-hon-list">
                {[...cat.honours]
                  .sort((a, b) => (b.gold + b.silver + b.bronze) - (a.gold + a.silver + a.bronze))
                  .map((h) => (
                    <div key={h.name} className="ap-hon-row">
                      <div className="ap-hon-row__medals">
                        <span className="ap-hon-dot ap-hon-dot--g">{h.gold}</span>
                        <span className="ap-hon-dot ap-hon-dot--s">{h.silver}</span>
                        <span className="ap-hon-dot ap-hon-dot--b">{h.bronze}</span>
                      </div>
                      <span className="ap-hon-row__name">{h.name}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Filter */}
        <div className="ap-filter">
          <input type="text" placeholder="Filter events…" value={filter}
            onChange={(e) => setFilter(e.target.value)} className="ap-filter__input" />
          <Search size={16} className="ap-filter__icon" />
        </div>

        {/* Table */}
        <div className="ap-tbl-wrap">
          <table className="ap-tbl">
            <thead>
              <tr>
                <th style={{ width: '9%' }}>Date</th>
                <th style={{ width: '24%' }}>Event</th>
                <th style={{ width: '14%' }}>Type</th>
                <th style={{ width: '11%' }}>Category</th>
                <th style={{ width: '7%' }} className="ctr">Factor</th>
                <th style={{ width: '5%' }} className="ctr">View</th>
                <th style={{ width: '7%' }} className="ctr">Rank</th>
                <th style={{ width: '6%' }} className="ctr">Wins</th>
                <th style={{ width: '8%' }} className="ctr">Points</th>
                <th style={{ width: '9%' }} className="ctr">Actual</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.date}-${r.event}`}>
                  <td className="ap-tbl__date">{r.date}</td>
                  <td>
                    <div className="ap-tbl__ev">
                      <img src={r.flag} alt="" className="ap-tbl__fl" loading="lazy" />
                      <span>{r.event}</span>
                    </div>
                  </td>
                  <td>{r.type}</td>
                  <td>{r.category}</td>
                  <td className="ctr">{r.factor}</td>
                  <td className="ctr">{r.hasView ? <Eye size={15} className="ap-eye" title="View details" aria-label="View details" /> : null}</td>
                  <td className="ctr"><MedalBadge rank={r.rank} /></td>
                  <td className="ctr">{r.wins}</td>
                  <td className="ctr">{r.points}</td>
                  <td className={`ctr ${r.actual > 0 ? 'ap-tbl__gold-text' : 'ap-tbl__dim'}`}>{r.actual}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="ap-tbl__empty">No results found for &ldquo;{filter}&rdquo;</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="ap-tbl__foot">
                <td colSpan={8}>Total: <strong className="ap-tbl__accent">{cat.totalPoints?.toLocaleString()}</strong></td>
                <td colSpan={2} className="ctr">Actual: <strong className="ap-tbl__accent">{cat.points?.toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   BELT JOURNEY — table with View column, sorted descending
   ═══════════════════════════════════════════════════════════════════════ */
function BeltJourney({ beltExaminations, beltColors }) {
  if (!beltExaminations || beltExaminations.length === 0) return null
  const sorted = [...beltExaminations].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <section className="ap-section ap-animate-in ap-delay-3">
      <SectionHeader icon={<Shield size={16} />} label="Belt Progression" />
      <div className="ap-panel">
        <div className="ap-tbl-wrap">
          <table className="ap-tbl">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '18%' }}>Belt</th>
                <th style={{ width: '10%' }}>Grade</th>
                <th style={{ width: '22%' }}>Examiner</th>
                <th style={{ width: '22%' }}>Dojo</th>
                <th style={{ width: '7%' }} className="ctr">View</th>
                <th style={{ width: '9%' }} className="ctr">Result</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ex) => {
                const col = beltColors[ex.belt] || '#ccc'
                return (
                  <tr key={`${ex.date}-${ex.grade}`}>
                    <td className="ap-tbl__date">{ex.date}</td>
                    <td>
                      <div className="ap-tbl__ev">
                        <span className="ap-belt-sw" style={{ backgroundColor: col, borderColor: ex.belt === 'White' ? 'rgba(255,255,255,0.25)' : 'transparent' }} />
                        <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{ex.belt}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{ex.grade}</td>
                    <td>{ex.examiner}</td>
                    <td>{ex.dojo}</td>
                    <td className="ctr"><Eye size={15} className="ap-eye" title="View details" aria-label="View details" /></td>
                    <td className="ctr">
                      <span className={`ap-pill ${ex.result === 'Pass' ? 'ap-pill--pass' : 'ap-pill--fail'}`}>{ex.result}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SPECIAL EVENTS — compact table (not large cards), with View column
   ═══════════════════════════════════════════════════════════════════════ */
function SpecialEventsSection({ specialEvents }) {
  if (!specialEvents || specialEvents.length === 0) return null
  const sorted = [...specialEvents].sort((a, b) => new Date(b.date) - new Date(a.date))

  const typeColor = { Seminar: '#ffe49a', 'Training Camp': '#99f6e4', Workshop: '#bfdbfe' }
  const typeBg = { Seminar: 'rgba(255,183,3,0.1)', 'Training Camp': 'rgba(45,212,191,0.08)', Workshop: 'rgba(59,130,246,0.08)' }
  const typeBorder = { Seminar: 'rgba(255,183,3,0.2)', 'Training Camp': 'rgba(45,212,191,0.18)', Workshop: 'rgba(59,130,246,0.18)' }

  return (
    <section className="ap-section ap-animate-in ap-delay-4">
      <SectionHeader icon={<Star size={16} />} label="Special Events & Training" />
      <div className="ap-panel">
        <div className="ap-tbl-wrap">
          <table className="ap-tbl">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '15%' }}>Type</th>
                <th style={{ width: '38%' }}>Event</th>
                <th style={{ width: '28%' }}>Location</th>
                <th style={{ width: '7%' }} className="ctr">View</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ev) => (
                <tr key={`${ev.date}-${ev.title}`}>
                  <td className="ap-tbl__date">{ev.date}</td>
                  <td>
                    <span className="ap-type-tag" style={{
                      color: typeColor[ev.type] || '#bfdbfe',
                      background: typeBg[ev.type] || 'rgba(59,130,246,0.08)',
                      borderColor: typeBorder[ev.type] || 'rgba(59,130,246,0.18)',
                    }}>
                      {ev.type}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>{ev.title}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.5)' }}>
                      <MapPin size={13} /> {ev.location}
                    </span>
                  </td>
                  <td className="ctr"><Eye size={15} className="ap-eye" title="View details" aria-label="View details" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════ */
export default function AthleteProfileClient({
  athleteInfo, categories, nextEvents, beltExaminations, specialEvents, beltColors,
}) {
  return (
    <div className="ap-page">
      <div className="ap-container">
        <AthleteHero athleteInfo={athleteInfo} categories={categories} />
        <NextEventsSection nextEvents={nextEvents} />
        <TabbedCompetitions categories={categories} />
        <BeltJourney beltExaminations={beltExaminations} beltColors={beltColors} />
        <SpecialEventsSection specialEvents={specialEvents} />
      </div>
      <div style={{ height: '5rem' }} />
    </div>
  )
}
