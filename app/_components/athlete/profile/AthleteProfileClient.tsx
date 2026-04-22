'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import { RankingCard } from '@/components/RankingCard'
import {
  Search, ChevronRight, Eye, Share2,
  Calendar, MapPin, Trophy, Flame, Shield, Star, Zap, Users, Download
} from 'lucide-react'
import '@/app/athlete-profile.css'
import '@/app/rankings/rankings.css'
import { CertificateModal } from '@/components/CertificateModal'
import { CertificateCard } from '@/components/CertificateCard'

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC CERTIFICATES
   ═══════════════════════════════════════════════════════════════════════ */
function PublicCertificates({ skfId, onOpenCertificate }: { skfId: string, onOpenCertificate: (id: string) => void }) {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!skfId) return
    fetch(`/api/certificates/public?skfId=${skfId}`)
      .then(res => res.json())
      .then(data => setCerts(data.certificates || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [skfId])

  if (loading || certs.length === 0) return null

  return (
    <section className="ap-section ap-animate-in ap-delay-3" id="verified-certificates">
      <SectionHeader icon={<Shield size={16} />} label="Verified Certificates" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {certs.map((c: any) => (
          <CertificateCard 
            key={c.id} 
            cert={{ ...c, onView: () => onOpenCertificate(c.id) }} 
          />
        ))}
      </div>
    </section>
  )
}

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
function AthleteHero({ athleteInfo, categories, onShareCard, isExporting }) {
  const primary = categories.find((c) => c.isPrimary) || categories[0]
  const totalG = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.gold, 0), 0)
  const totalS = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.silver, 0), 0)
  const totalB = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.bronze, 0), 0)
  const totalMedals = totalG + totalS + totalB

  return (
    <section className="ap-hero ap-animate-in">
      <div className="ap-hero-bento">
        {/* Bento Grid layout */}
        <div className="ap-hero-bento__grid">
          {/* Portrait Card */}
          <div className="ap-bento-card ap-bento-portrait">
            <Image
              src={athleteInfo.photo}
              alt={athleteInfo.name}
              fill
              crossOrigin="anonymous"
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 300"><rect fill="%23192038" width="260" height="300"/></svg>'
              }}
            />
            {/* Ambient Background Glow inside portrait */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at bottom right, rgba(255,183,3,0.15) 0%, transparent 60%)', left: 0, bottom: 0, pointerEvents: 'none' }} />
            
            <div className="ap-hero__id-watermark">
              <span style={{ fontSize: '0.45rem', opacity: 0.6, display: 'block', marginBottom: '2px' }}>SKF ID</span>
              {athleteInfo.id}
            </div>
          </div>

          {/* Right side data grid */}
          <div className="ap-bento-data">
            {/* Integrated Premium Header */}
            <div className="ap-bento-header">
              <span className="ap-bento-header-pretitle">Official SKF Athlete</span>
              <h1 className="ap-hero__name">{athleteInfo.name}</h1>
              <div className="ap-hero-meta-row">
                <span className="ap-hero__id">{athleteInfo.id}</span>
                {athleteInfo.branchName && (
                  <Link href={`/dojos/${athleteInfo.branchSlug}`} className="ap-hero__branch-link">
                    Trains at SKF {athleteInfo.branchName}
                  </Link>
                )}
              </div>
            </div>
            {/* Rank Box */}
            <div className="ap-bento-card ap-bento-rank">
              <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(255,183,3,0.12)', filter: 'blur(40px)', borderRadius: '50%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <span className="ap-bento-label">World Ranking</span>
                  <div className="ap-bento-cat">{primary.name}</div>
                  <div className="ap-bento-pts">{primary.points?.toLocaleString()} pts</div>
                </div>
                <div className="ap-bento-rank-num">
                  {primary.rank ? `#${primary.rank}` : '—'}
                </div>
              </div>
            </div>

            {/* Stats Box */}
            <div className="ap-bento-card ap-bento-stats">
              <div className="ap-bento-stat">
                <span className="val">{athleteInfo.age}</span>
                <span className="lbl">Age</span>
              </div>
              <div className="ap-bento-stat">
                <span className="val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {athleteInfo.countryFlag && <Image src={athleteInfo.countryFlag} alt={athleteInfo.country} width={22} height={16} crossOrigin="anonymous" style={{ borderRadius: '2px' }} />}
                  {athleteInfo.country}
                </span>
                <span className="lbl">Country</span>
              </div>
              <div className="ap-bento-stat">
                <span className="val">{athleteInfo.totalBouts}</span>
                <span className="lbl">Bouts</span>
              </div>
              <div className="ap-bento-stat">
                <span className="val">{athleteInfo.winRate}</span>
                <span className="lbl">Win Rate</span>
              </div>
            </div>

            {/* Medals Box */}
            <div className="ap-bento-card ap-bento-medals">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
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
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
                <div className="ap-hero__medal-total">
                  <span className="ap-hero__medal-total-num">{totalMedals}</span>
                  <span>Total</span>
                </div>
              </div>

              {onShareCard && (
                <button
                  onClick={onShareCard}
                  disabled={isExporting}
                  className="ap-hero__share-btn"
                  title="Share Ranking Card"
                  style={{ marginLeft: 'auto' }}
                >
                  <Share2 size={16} />
                  <span>{isExporting ? 'Generating…' : 'Share Ranking Card'}</span>
                </button>
              )}
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
function TabbedCompetitions({ categories, isDashboardContext = false }) {
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
    let rows = [...cat.results].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
        <div className="lb-tabs" style={{ marginBottom: '1.5rem', justifyContent: 'flex-start', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {sortedCategories.map((c, i) => (
            <button key={c.name} type="button" className={`lb-tab ${activeTab === i ? 'lb-tab--on' : ''}`}
              onClick={() => { setActiveTab(i); setFilter('') }}>
              {c.name}
              {c.rank ? <span className="ap-tab__badge" style={{ marginLeft: '4px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7em' }}>#{c.rank}</span> : null}
            </button>
          ))}
        </div>

        {/* Category overview */}
        <div className="ap-cat-overview">
          <h3 className="ap-cat-overview__title">{cat.name}</h3>
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

        {/* Table — columns: Date, Event, Type, Category, Rank, Wins, Points */}
        <div className="ap-tbl-wrap">
          <table className="ap-tbl">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '30%' }}>Event</th>
                <th style={{ width: '16%' }}>Type</th>
                <th style={{ width: '14%' }}>Category</th>
                <th className="ctr" style={{ width: '10%' }}>Rank</th>
                <th className="ctr" style={{ width: '8%' }}>Wins</th>
                <th className="ctr" style={{ width: '10%' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.date}-${r.event}`}>
                  <td className="ap-tbl__date">{r.date}</td>
                  <td>
                    <span className="ap-tbl__ev">{r.event}</span>
                  </td>
                  <td>{r.type}</td>
                  <td>{r.category}</td>
                  <td className="ctr"><MedalBadge rank={r.rank} /></td>
                  <td className="ctr">{r.wins}</td>
                  <td className={`ctr ${r.actual > 0 ? 'ap-tbl__gold-text' : ''}`}>{r.points}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="ap-tbl__empty ctr">No results found for &ldquo;{filter}&rdquo;</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="ap-tbl__foot">
                <td colSpan={7}>Total Points: <strong className="ap-tbl__accent">{cat.points?.toLocaleString()}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   BELT JOURNEY — table with View column (portal only), sorted descending
   ═══════════════════════════════════════════════════════════════════════ */
function BeltJourney({ beltExaminations, beltColors, onOpenCertificate, isDashboardContext = false }) {
  if (!beltExaminations || beltExaminations.length === 0) return null
  const sorted = [...beltExaminations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <section className="ap-section ap-animate-in ap-delay-3" id="certifications">
      <SectionHeader icon={<Shield size={16} />} label="Certifications & Belt Progression" />
      <div className="ap-panel">
        <div className="ap-tbl-wrap">
          <table className="ap-tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Belt</th>
                <th>Grade</th>
                <th>Examiner</th>
                <th>Dojo</th>
                {isDashboardContext && <th className="ctr">View</th>}
                <th className="ctr">Result</th>
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
                    {isDashboardContext && (
                      <td className="ctr">
                        {ex.result === 'Pass' ? (
                          <button 
                            onClick={() => onOpenCertificate(ex)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--gold)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              padding: '0.25rem'
                            }}
                            aria-label="View Certificate"
                            title="View Digital Certificate"
                          >
                            <Download size={16} />
                          </button>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>
                        )}
                      </td>
                    )}
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
   SPECIAL EVENTS — compact table, View column portal-only
   ═══════════════════════════════════════════════════════════════════════ */
function SpecialEventsSection({ specialEvents, isDashboardContext = false }) {
  if (!specialEvents || specialEvents.length === 0) return null
  const sorted = [...specialEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
                <th style={{ width: isDashboardContext ? '12%' : '15%' }}>Date</th>
                <th style={{ width: isDashboardContext ? '15%' : 'auto' }}>Type</th>
                <th style={{ width: isDashboardContext ? '38%' : 'auto' }}>Event</th>
                <th style={{ width: isDashboardContext ? '28%' : 'auto' }}>Location</th>
                {isDashboardContext && <th className="ctr" style={{ width: '7%' }}>View</th>}
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
                  {isDashboardContext && <td className="ctr"><Eye size={15} className="ap-eye" aria-label="View details" /></td>}
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
  athleteInfo, categories, nextEvents, beltExaminations, specialEvents, beltColors, isDashboardContext = false
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null)
  
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const totalG = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.gold, 0), 0)
  const totalS = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.silver, 0), 0)
  const totalB = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.bronze, 0), 0)

  const handleShareCard = async () => {
    if (!cardRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#05080f'
      })
      const url = canvas.toDataURL('image/jpeg', 0.9)
      const a = document.createElement('a')
      a.href = url
      a.download = `SKF_Rank_${athleteInfo.name.replace(/\s+/g, '_')}.jpg`
      a.click()
    } catch (err) {
      console.error('Failed to export ranking card:', err)
      alert("Failed to generate the ranking card. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenCertificate = (id) => {
    setSelectedEnrollmentId(id)
    setModalOpen(true)
  }

  // To match the new tabbed layout spec without destroying the whole page,
  // we are introducing page-level native smooth-scroll anchors below the hero.
  
  return (
    <div className={`ap-page ${isDashboardContext ? 'kuroobi-dashboard' : ''}`} style={isDashboardContext ? { background: 'transparent', minHeight: 'auto' } : {}}>
      {!isDashboardContext && (
        <div className="ap-page-watermark">
          空手道
        </div>
      )}

      <div className="ap-container">
        <AthleteHero
          athleteInfo={athleteInfo}
          categories={categories}
          onShareCard={!isDashboardContext ? handleShareCard : undefined}
          isExporting={isExporting}
        />

        <NextEventsSection nextEvents={nextEvents} />
        <TabbedCompetitions categories={categories} isDashboardContext={isDashboardContext} />
        {isDashboardContext && <PublicCertificates skfId={athleteInfo.id} onOpenCertificate={handleOpenCertificate} />}
        <BeltJourney beltExaminations={beltExaminations} beltColors={beltColors} isDashboardContext={isDashboardContext} onOpenCertificate={(r) => alert('Legacy certificates are handled directly via the Digital Certificates tab above.')} />
        <SpecialEventsSection specialEvents={specialEvents} isDashboardContext={isDashboardContext} />
      </div>

      <CertificateModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        enrollmentId={selectedEnrollmentId || ''}
        skfId={athleteInfo.id}
      />
      
      <RankingCard 
        ref={cardRef} 
        athleteInfo={athleteInfo} 
        categories={categories} 
        totalG={totalG} 
        totalS={totalS} 
        totalB={totalB} 
      />

      <div style={{ height: '5rem' }} />
    </div>
  )
}
