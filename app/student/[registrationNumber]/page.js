'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronRight, MapPin, Calendar, Award, Trophy, Star, Target, Zap, Users } from 'lucide-react'
import { athleteInfo, categories, nextEvents, beltExaminations, specialEvents, beltColors } from '../../components/student/profile/studentData'

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const FONT = "'Roboto Condensed', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif"
const RED = '#c8102e'
const DARK_RED = '#8B0000'
const DARK = '#2D2926'
const LIGHT_BG = '#F2F2F2'

// ═══════════════════════════════════════════
// MEDAL BADGE — rank circle in tables
// ═══════════════════════════════════════════
function MedalBadge({ rank }) {
    if (rank === '*' || rank === '-') return <span style={{ fontSize: 16, color: '#999' }}>{rank}</span>
    const n = typeof rank === 'number' ? rank : parseInt(rank)
    const c = { 
        1: 'linear-gradient(180deg, #FDE02F 0%, #D89F00 100%)', 
        2: 'linear-gradient(180deg, #D4D4D4 0%, #9E9E9E 100%)', 
        3: 'linear-gradient(180deg, #C27A27 0%, #8A4B0A 100%)' 
    }
    if (n >= 1 && n <= 3) {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: '50%',
                background: c[n], color: '#fff', fontSize: 16, fontWeight: 700,
                textShadow: '0 1px 1px rgba(0,0,0,0.2)'
            }}>{n}</span>
        )
    }
    return <span style={{ fontSize: 16, color: '#666' }}>{rank}</span>
}

// ═══════════════════════════════════════════
// CAREER STATS — clean dashboard cards
// ═══════════════════════════════════════════
function CareerStats() {
    const totalGolds = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.gold, 0), 0)
    const totalSilvers = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.silver, 0), 0)
    const totalBronzes = categories.reduce((s, c) => s + c.honours.reduce((a, h) => a + h.bronze, 0), 0)
    const totalEvents = categories.reduce((s, c) => s + c.results.length, 0)

    const stats = [
        { icon: <Award size={24} />, value: totalGolds, label: 'Gold', color: '#E0A900' },
        { icon: <Award size={24} />, value: totalSilvers, label: 'Silver', color: '#A5A5A5' },
        { icon: <Award size={24} />, value: totalBronzes, label: 'Bronze', color: '#A66018' },
        { icon: <Target size={24} />, value: totalEvents, label: 'Events', color: RED },
        { icon: <Zap size={24} />, value: athleteInfo.winRate, label: 'Win Rate', color: '#2e7d32' },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, marginBottom: 50 }}>
            {stats.map((s, i) => (
                <div key={i} style={{
                    backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 14,
                    padding: '24px 20px', textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ color: s.color, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                    <div style={{ fontSize: 34, fontWeight: 800, color: '#222', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{s.label}</div>
                </div>
            ))}
        </div>
    )
}

// ═══════════════════════════════════════════
// HERO — dark / light split
// ═══════════════════════════════════════════
function AthleteHero() {
    const primary = categories.find(c => c.isPrimary) || categories[0]
    return (
        <div style={{ display: 'flex', overflow: 'hidden', marginTop: 40, marginBottom: 40 }}>
            {/* Dark panel */}
            <div style={{ backgroundColor: DARK, color: '#fff', padding: '36px 36px', width: 460, flexShrink: 0 }}>
                <div style={{ width: 150, height: 160, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${RED}`, marginBottom: 28 }}>
                    <img src={athleteInfo.photo} alt={athleteInfo.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 160"><rect fill="%23555" width="150" height="160"/></svg>' }} />
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 700, textTransform: 'uppercase', marginBottom: 28, lineHeight: 1.12, letterSpacing: '0.5px' }}>
                    {athleteInfo.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <img src={athleteInfo.countryFlag} alt="" style={{ width: 70, height: 48, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                    <div>
                        {[['Country', athleteInfo.country], ['ID', athleteInfo.id], ['Age', athleteInfo.age]].map(([l, v]) => (
                            <div key={l} style={{ marginBottom: 6 }}>
                                <span style={{ fontSize: 15, color: '#aaa', marginRight: 8, textTransform: 'uppercase' }}>{l}:</span>
                                <span style={{ fontSize: 17, color: '#fff', fontWeight: 700 }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Light panel */}
            <div style={{ backgroundColor: LIGHT_BG, padding: '36px 44px', flex: 1 }}>
                <h2 style={{ fontSize: 30, fontWeight: 700, color: DARK_RED, marginBottom: 22 }}>{primary.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 34 }}>
                    {primary.rank && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 42, height: 42, borderRadius: '50%',
                            backgroundColor: DARK_RED, color: '#fff', fontSize: 22, fontWeight: 700,
                        }}>{primary.rank}</span>
                    )}
                    <span style={{ fontSize: 38, fontWeight: 800, color: '#212529', textTransform: 'uppercase' }}>RANK</span>
                    <span style={{ fontSize: 24, color: '#666' }}>{primary.points} points</span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: DARK_RED, marginBottom: 18 }}>Honours</h3>
                {primary.honours.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        {[['gold', 'linear-gradient(180deg, #FDE02F 0%, #D89F00 100%)', h.gold], 
                          ['silver', 'linear-gradient(180deg, #D4D4D4 0%, #9E9E9E 100%)', h.silver], 
                          ['bronze', 'linear-gradient(180deg, #C27A27 0%, #8A4B0A 100%)', h.bronze]].map(([t, c, n]) => (
                            <span key={t} style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 40, height: 40, borderRadius: '50%', background: c,
                                color: '#fff', fontSize: 17, fontWeight: 700,
                                textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                            }}>{n}</span>
                        ))}
                        <span style={{ fontSize: 19, fontWeight: 700, color: '#333', marginLeft: 14 }}>{h.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════
// NEXT EVENTS
// ═══════════════════════════════════════════
function NextEventsSection() {
    return (
        <div style={{ marginBottom: 50 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#212529', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '0.3px' }}>
                ATHLETE&apos;S NEXT EVENTS
            </h2>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                {nextEvents.map((e, i) => (
                    <div key={i} style={{
                        backgroundColor: LIGHT_BG, borderRadius: 10, padding: '20px 24px',
                        minWidth: 340, flex: '0 1 420px', border: '1px solid #e8e8e8',
                        transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={ev => ev.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'}
                    onMouseLeave={ev => ev.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 17, fontWeight: 600, color: '#333' }}>{e.dateRange}</span>
                            <ChevronRight size={18} style={{ color: RED }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#555' }}>
                            <img src={e.flag} alt="" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
                            <span>{e.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════
// TABBED COMPETITIONS
// ═══════════════════════════════════════════
function TabbedCompetitions() {
    const [activeTab, setActiveTab] = useState(0)
    const [filter, setFilter] = useState('')
    const cat = categories[activeTab]

    const filtered = useMemo(() => {
        if (!filter.trim()) return cat.results
        const q = filter.toLowerCase()
        return cat.results.filter(r => r.event.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.date.includes(q))
    }, [filter, cat])

    return (
        <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#212529', textTransform: 'uppercase', marginBottom: 24 }}>
                COMPETITION RESULTS
            </h2>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `3px solid #eee`, marginBottom: 0, overflowX: 'auto' }}>
                {categories.map((c, i) => (
                    <button key={i} onClick={() => { setActiveTab(i); setFilter('') }}
                        style={{
                            padding: '16px 30px', border: 'none', cursor: 'pointer',
                            fontSize: 16, fontWeight: 700, fontFamily: FONT,
                            backgroundColor: activeTab === i ? '#fff' : 'transparent',
                            color: activeTab === i ? RED : '#777',
                            borderBottom: activeTab === i ? `3px solid ${RED}` : '3px solid transparent',
                            marginBottom: '-3px', whiteSpace: 'nowrap', transition: 'color 0.2s',
                        }}>
                        {c.name}
                        {c.rank && <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, backgroundColor: DARK_RED, color: '#fff', padding: '3px 8px', borderRadius: 10 }}>#{c.rank}</span>}
                    </button>
                ))}
            </div>

            {/* Category summary bar */}
            <div style={{ backgroundColor: LIGHT_BG, padding: '22px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: DARK_RED, margin: 0 }}>{cat.name}</h3>
                    {cat.rank && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            backgroundColor: DARK_RED, color: '#fff', padding: '5px 16px',
                            borderRadius: 20, fontSize: 15, fontWeight: 700,
                        }}>Rank #{cat.rank}</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 28 }}>
                    {[['Actual Points', cat.points], ['Total Points', cat.totalPoints], ['Events', cat.results.length]].map(([l, v]) => (
                        <div key={l} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#222' }}>{v}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Honours for active tab */}
            <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: 20, fontWeight: 700, color: DARK_RED, marginBottom: 16 }}>Honours</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                    {cat.honours.map((h, i) => (
                        <div key={i} style={{
                            backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: 12,
                            padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            {[['gold', 'linear-gradient(180deg, #FDE02F 0%, #D89F00 100%)', h.gold], 
                              ['silver', 'linear-gradient(180deg, #D4D4D4 0%, #9E9E9E 100%)', h.silver], 
                              ['bronze', 'linear-gradient(180deg, #C27A27 0%, #8A4B0A 100%)', h.bronze]].map(([t, c, n]) => (
                                <span key={t} style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 36, height: 36, borderRadius: '50%', background: c,
                                    color: '#fff', fontSize: 16, fontWeight: 700,
                                    textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                                }}>{n}</span>
                            ))}
                            <span style={{ fontSize: 16, fontWeight: 600, color: '#333', marginLeft: 6 }}>{h.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter */}
            <div style={{ position: 'relative', marginBottom: 22 }}>
                <input type="text" placeholder="Filter events by name or type..."
                    value={filter} onChange={e => setFilter(e.target.value)}
                    style={{ width: '100%', border: `2px solid ${RED}`, borderRadius: 8, padding: '16px 50px 16px 22px', fontSize: 16, color: '#333', outline: 'none', boxSizing: 'border-box', fontFamily: FONT }} />
                <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: RED }}><Search size={22} /></div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Date', 'Event', 'Type', 'Category'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                            {['Event Factor', 'View', 'Rank', 'Wins', 'Points', 'Actual'].map(h => (
                                <th key={h} style={{ textAlign: 'center', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r, i) => (
                            <tr key={i} style={{ cursor: 'default' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#333', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 17 }}>{r.date}</td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', fontSize: 17 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <img src={r.flag} alt="" style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                                        <span style={{ color: '#444' }}>{r.event}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', fontSize: 17 }}>{r.type}</td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', fontSize: 17 }}>{r.category}</td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', textAlign: 'center', fontSize: 17 }}>{r.factor}</td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                    {r.hasView && <Search size={18} style={{ color: '#bbb', cursor: 'pointer' }} />}
                                </td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center' }}><MedalBadge rank={r.rank} /></td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', textAlign: 'center', fontSize: 17 }}>{r.wins}</td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', textAlign: 'center', fontSize: 17 }}>{r.points}</td>
                                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: 17, color: r.actual > 0 ? DARK_RED : '#aaa', fontWeight: r.actual > 0 ? 700 : 400 }}>{r.actual}</td>
                            </tr>
                        ))}
                        <tr style={{ borderTop: '2px solid #ccc', backgroundColor: '#fafafa' }}>
                            <td style={{ padding: '20px 14px', fontWeight: 700 }}></td>
                            <td style={{ padding: '20px 14px', fontWeight: 700, fontSize: 17 }} colSpan={7}>
                                Total Points: <span style={{ color: DARK_RED }}>{cat.totalPoints}</span>
                            </td>
                            <td style={{ padding: '20px 14px', fontWeight: 700, fontSize: 17, textAlign: 'center' }} colSpan={2}>
                                Actual: <span style={{ color: DARK_RED }}>{cat.points}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════
// BELT JOURNEY — table format
// ═══════════════════════════════════════════
function BeltJourney() {
    if (!beltExaminations || beltExaminations.length === 0) return null
    return (
        <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#212529', textTransform: 'uppercase', marginBottom: 24 }}>
                BELT PROGRESSION
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 17 }}>
                    <thead>
                        <tr>
                            {['Date', 'Belt', 'Grade', 'Examiner', 'Dojo'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                            <th style={{ textAlign: 'center', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {beltExaminations.map((ex, i) => {
                            const color = beltColors[ex.belt] || '#ccc'
                            const isWhite = ex.belt === 'White'
                            return (
                                <tr key={i} style={{ cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#333', fontWeight: 700, whiteSpace: 'nowrap' }}>{ex.date}</td>
                                    <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 44, height: 18, borderRadius: 4, backgroundColor: color, border: isWhite ? '1px solid #ccc' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', flexShrink: 0 }} />
                                            <span style={{ fontWeight: 700, color: '#222' }}>{ex.belt}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: DARK_RED, fontWeight: 700 }}>{ex.grade}</td>
                                    <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444' }}>{ex.examiner}</td>
                                    <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444' }}>{ex.dojo}</td>
                                    <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '6px 20px', borderRadius: 20, fontSize: 15, fontWeight: 700,
                                            backgroundColor: ex.result === 'Pass' ? '#e8f5e9' : '#ffebee',
                                            color: ex.result === 'Pass' ? '#2e7d32' : '#c62828',
                                            display: 'inline-block'
                                        }}>{ex.result}</span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════
// SPECIAL EVENTS — 2-col gradient cards
// ═══════════════════════════════════════════
function SpecialEventsSection() {
    const typeStyles = {
        'Seminar': { bg: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)', color: '#e65100', icon: <Star size={16} /> },
        'Training Camp': { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', color: '#2e7d32', icon: <Zap size={16} /> },
        'Workshop': { bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', color: '#1565c0', icon: <Users size={16} /> },
    }

    return (
        <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#212529', textTransform: 'uppercase', marginBottom: 28 }}>
                SPECIAL EVENTS &amp; TRAINING
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }}>
                {specialEvents.map((ev, i) => {
                    const ts = typeStyles[ev.type] || typeStyles['Workshop']
                    return (
                        <div key={i} style={{
                            background: ts.bg, borderRadius: 14, padding: '26px 30px',
                            border: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                    color: ts.color, backgroundColor: 'rgba(255,255,255,0.75)',
                                }}>{ts.icon} {ev.type}</span>
                                <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                                    <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{ev.date}
                                </span>
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#222', margin: '0 0 8px 0', lineHeight: 1.3 }}>{ev.title}</h3>
                            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: '0 0 10px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={14} /> {ev.location}
                            </p>
                            <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.55)', margin: 0, lineHeight: 1.7 }}>{ev.description}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function StudentProfilePage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: FONT, color: '#212529', fontSize: 14, lineHeight: 1.6 }}>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

            <div style={{ height: 80, backgroundColor: '#080b14', width: '100%' }} />

            <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 20px' }}>
                <AthleteHero />
                <CareerStats />
                <NextEventsSection />
                <TabbedCompetitions />
                <BeltJourney />
                <SpecialEventsSection />
            </div>

            {/* Footer spacer */}
            <div style={{ height: 80 }} />
        </div>
    )
}
