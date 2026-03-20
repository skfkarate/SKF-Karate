'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronRight, MapPin, Calendar, Award, Target, Zap, Users, Star } from 'lucide-react'

const FONT = "'Roboto Condensed', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif"
const RED = '#c8102e'
const DARK_RED = '#8B0000'
const DARK = '#2D2926'
const LIGHT_BG = '#F2F2F2'

function MedalBadge({ rank }) {
  if (rank === '*' || rank === '-' || rank == null) {
    return <span style={{ fontSize: 16, color: '#999' }}>{rank ?? '-'}</span>
  }

  const n = typeof rank === 'number' ? rank : Number.parseInt(rank, 10)
  const backgrounds = {
    1: 'linear-gradient(180deg, #FDE02F 0%, #D89F00 100%)',
    2: 'linear-gradient(180deg, #D4D4D4 0%, #9E9E9E 100%)',
    3: 'linear-gradient(180deg, #C27A27 0%, #8A4B0A 100%)',
  }

  if (n >= 1 && n <= 3) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: backgrounds[n],
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
          textShadow: '0 1px 1px rgba(0,0,0,0.2)',
        }}
      >
        {n}
      </span>
    )
  }

  return <span style={{ fontSize: 16, color: '#666' }}>{rank}</span>
}

function CareerStats({ categories, athleteInfo }) {
  const totalGolds = categories.reduce((sum, category) => sum + category.honours.reduce((acc, honour) => acc + honour.gold, 0), 0)
  const totalSilvers = categories.reduce((sum, category) => sum + category.honours.reduce((acc, honour) => acc + honour.silver, 0), 0)
  const totalBronzes = categories.reduce((sum, category) => sum + category.honours.reduce((acc, honour) => acc + honour.bronze, 0), 0)
  const totalEvents = categories.reduce((sum, category) => sum + category.results.length, 0)

  const stats = [
    { icon: <Award size={24} />, value: totalGolds, label: 'Gold', color: '#E0A900' },
    { icon: <Award size={24} />, value: totalSilvers, label: 'Silver', color: '#A5A5A5' },
    { icon: <Award size={24} />, value: totalBronzes, label: 'Bronze', color: '#A66018' },
    { icon: <Target size={24} />, value: totalEvents, label: 'Events', color: RED },
    { icon: <Zap size={24} />, value: athleteInfo.winRate, label: 'Win Rate', color: '#2e7d32' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, marginBottom: 50 }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: 14,
            padding: '24px 20px',
            textAlign: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform = 'translateY(-3px)'
            event.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.07)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'translateY(0)'
            event.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{ color: stat.color, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
            {stat.icon}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#222', lineHeight: 1 }}>{stat.value}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function AthleteHero({ athleteInfo, categories }) {
  const primary = categories.find((category) => category.isPrimary) || categories[0]

  return (
    <div style={{ display: 'flex', overflow: 'hidden', marginTop: 40, marginBottom: 40 }}>
      <div style={{ backgroundColor: DARK, color: '#fff', padding: '36px 36px', width: 460, flexShrink: 0 }}>
        <div style={{ width: 150, height: 160, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${RED}`, marginBottom: 28 }}>
          <img
            src={athleteInfo.photo}
            alt={athleteInfo.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(event) => {
              event.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 160"><rect fill="%23555" width="150" height="160"/></svg>'
            }}
          />
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 700, textTransform: 'uppercase', marginBottom: 28, lineHeight: 1.12, letterSpacing: '0.5px' }}>
          {athleteInfo.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <img src={athleteInfo.countryFlag} alt="" style={{ width: 70, height: 48, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
          <div>
            {[
              ['Country', athleteInfo.country],
              ['ID', athleteInfo.id],
              ['Age', athleteInfo.age],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 15, color: '#aaa', marginRight: 8, textTransform: 'uppercase' }}>{label}:</span>
                <span style={{ fontSize: 17, color: '#fff', fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: LIGHT_BG, padding: '36px 44px', flex: 1 }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: DARK_RED, marginBottom: 22 }}>{primary.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 34 }}>
          {primary.rank ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                borderRadius: '50%',
                backgroundColor: DARK_RED,
                color: '#fff',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {primary.rank}
            </span>
          ) : null}
          <span style={{ fontSize: 38, fontWeight: 800, color: '#212529', textTransform: 'uppercase' }}>RANK</span>
          <span style={{ fontSize: 24, color: '#666' }}>{primary.points} points</span>
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: DARK_RED, marginBottom: 18 }}>Honours</h3>
        {primary.honours.map((honour) => (
          <div key={honour.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {[
              ['gold', 'linear-gradient(180deg, #FDE02F 0%, #D89F00 100%)', honour.gold],
              ['silver', 'linear-gradient(180deg, #D4D4D4 0%, #9E9E9E 100%)', honour.silver],
              ['bronze', 'linear-gradient(180deg, #C27A27 0%, #8A4B0A 100%)', honour.bronze],
            ].map(([type, background, count]) => (
              <span
                key={type}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background,
                  color: '#fff',
                  fontSize: 17,
                  fontWeight: 700,
                  textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                }}
              >
                {count}
              </span>
            ))}
            <span style={{ fontSize: 19, fontWeight: 700, color: '#333', marginLeft: 14 }}>{honour.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NextEventsSection({ nextEvents }) {
  return (
    <div style={{ marginBottom: 50 }}>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#212529', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '0.3px' }}>
        ATHLETE&apos;S NEXT EVENTS
      </h2>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {nextEvents.map((event) => (
          <div
            key={`${event.dateRange}-${event.name}`}
            style={{
              backgroundColor: LIGHT_BG,
              borderRadius: 10,
              padding: '20px 24px',
              minWidth: 340,
              flex: '0 1 420px',
              border: '1px solid #e8e8e8',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(entry) => {
              entry.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
            }}
            onMouseLeave={(entry) => {
              entry.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: '#333' }}>{event.dateRange}</span>
              <ChevronRight size={18} style={{ color: RED }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#555' }}>
              <img src={event.flag} alt="" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
              <span>{event.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabbedCompetitions({ categories }) {
  const [activeTab, setActiveTab] = useState(0)
  const [filter, setFilter] = useState('')
  const category = categories[activeTab]

  const filtered = useMemo(() => {
    if (!filter.trim()) return category.results
    const query = filter.toLowerCase()
    return category.results.filter((result) => {
      return (
        result.event.toLowerCase().includes(query) ||
        result.type.toLowerCase().includes(query) ||
        result.date.includes(query)
      )
    })
  }, [category, filter])

  return (
    <div style={{ marginBottom: 60 }}>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#212529', textTransform: 'uppercase', marginBottom: 24 }}>
        COMPETITION RESULTS
      </h2>

      <div style={{ display: 'flex', borderBottom: '3px solid #eee', marginBottom: 0, overflowX: 'auto' }}>
        {categories.map((entry, index) => (
          <button
            key={entry.name}
            type="button"
            onClick={() => {
              setActiveTab(index)
              setFilter('')
            }}
            style={{
              padding: '16px 30px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: FONT,
              backgroundColor: activeTab === index ? '#fff' : 'transparent',
              color: activeTab === index ? RED : '#777',
              borderBottom: activeTab === index ? `3px solid ${RED}` : '3px solid transparent',
              marginBottom: '-3px',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}
          >
            {entry.name}
            {entry.rank ? (
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, backgroundColor: DARK_RED, color: '#fff', padding: '3px 8px', borderRadius: 10 }}>
                #{entry.rank}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: LIGHT_BG, padding: '22px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: DARK_RED, margin: 0 }}>{category.name}</h3>
          {category.rank ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: DARK_RED,
                color: '#fff',
                padding: '5px 16px',
                borderRadius: 20,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Rank #{category.rank}
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            ['Actual Points', category.points],
            ['Total Points', category.totalPoints],
            ['Events', category.results.length],
          ].map(([label, value]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#222' }}>{value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 20, fontWeight: 700, color: DARK_RED, marginBottom: 16 }}>Honours</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
          {category.honours.map((honour) => (
            <div
              key={honour.name}
              style={{
                backgroundColor: '#fafafa',
                border: '1px solid #eee',
                borderRadius: 12,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {[
                ['gold', 'linear-gradient(180deg, #FDE02F 0%, #D89F00 100%)', honour.gold],
                ['silver', 'linear-gradient(180deg, #D4D4D4 0%, #9E9E9E 100%)', honour.silver],
                ['bronze', 'linear-gradient(180deg, #C27A27 0%, #8A4B0A 100%)', honour.bronze],
              ].map(([type, background, count]) => (
                <span
                  key={type}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background,
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                  }}
                >
                  {count}
                </span>
              ))}
              <span style={{ fontSize: 16, fontWeight: 600, color: '#333', marginLeft: 6 }}>{honour.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 22 }}>
        <input
          type="text"
          placeholder="Filter events by name or type..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={{
            width: '100%',
            border: `2px solid ${RED}`,
            borderRadius: 8,
            padding: '16px 50px 16px 22px',
            fontSize: 16,
            color: '#333',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: FONT,
          }}
        />
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: RED }}>
          <Search size={22} />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Event', 'Type', 'Category'].map((heading) => (
                <th key={heading} style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>
                  {heading}
                </th>
              ))}
              {['Event Factor', 'View', 'Rank', 'Wins', 'Points', 'Actual'].map((heading) => (
                <th key={heading} style={{ textAlign: 'center', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((result) => (
              <tr
                key={`${result.date}-${result.event}`}
                style={{ cursor: 'default' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = '#f9f9f9'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#333', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 17 }}>{result.date}</td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', fontSize: 17 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={result.flag} alt="" style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                    <span style={{ color: '#444' }}>{result.event}</span>
                  </div>
                </td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', fontSize: 17 }}>{result.type}</td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', fontSize: 17 }}>{result.category}</td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', textAlign: 'center', fontSize: 17 }}>{result.factor}</td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  {result.hasView ? <Search size={18} style={{ color: '#bbb', cursor: 'pointer' }} /> : null}
                </td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <MedalBadge rank={result.rank} />
                </td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', textAlign: 'center', fontSize: 17 }}>{result.wins}</td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444', textAlign: 'center', fontSize: 17 }}>{result.points}</td>
                <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: 17, color: result.actual > 0 ? DARK_RED : '#aaa', fontWeight: result.actual > 0 ? 700 : 400 }}>{result.actual}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #ccc', backgroundColor: '#fafafa' }}>
              <td style={{ padding: '20px 14px', fontWeight: 700 }} />
              <td style={{ padding: '20px 14px', fontWeight: 700, fontSize: 17 }} colSpan={7}>
                Total Points: <span style={{ color: DARK_RED }}>{category.totalPoints}</span>
              </td>
              <td style={{ padding: '20px 14px', fontWeight: 700, fontSize: 17, textAlign: 'center' }} colSpan={2}>
                Actual: <span style={{ color: DARK_RED }}>{category.points}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BeltJourney({ beltExaminations, beltColors }) {
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
              {['Date', 'Belt', 'Grade', 'Examiner', 'Dojo'].map((heading) => (
                <th key={heading} style={{ textAlign: 'left', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>
                  {heading}
                </th>
              ))}
              <th style={{ textAlign: 'center', padding: '16px 14px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', color: '#333', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {beltExaminations.map((exam) => {
              const color = beltColors[exam.belt] || '#ccc'
              const isWhite = exam.belt === 'White'

              return (
                <tr
                  key={`${exam.date}-${exam.grade}`}
                  style={{ cursor: 'default' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = '#f9f9f9'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#333', fontWeight: 700, whiteSpace: 'nowrap' }}>{exam.date}</td>
                  <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 18, borderRadius: 4, backgroundColor: color, border: isWhite ? '1px solid #ccc' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: '#222' }}>{exam.belt}</span>
                    </div>
                  </td>
                  <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: DARK_RED, fontWeight: 700 }}>{exam.grade}</td>
                  <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444' }}>{exam.examiner}</td>
                  <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', color: '#444' }}>{exam.dojo}</td>
                  <td style={{ padding: '22px 14px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '6px 20px',
                        borderRadius: 20,
                        fontSize: 15,
                        fontWeight: 700,
                        backgroundColor: exam.result === 'Pass' ? '#e8f5e9' : '#ffebee',
                        color: exam.result === 'Pass' ? '#2e7d32' : '#c62828',
                        display: 'inline-block',
                      }}
                    >
                      {exam.result}
                    </span>
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

function SpecialEventsSection({ specialEvents }) {
  const typeStyles = {
    Seminar: { bg: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)', color: '#e65100', icon: <Star size={16} /> },
    'Training Camp': { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', color: '#2e7d32', icon: <Zap size={16} /> },
    Workshop: { bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', color: '#1565c0', icon: <Users size={16} /> },
  }

  return (
    <div style={{ marginBottom: 60 }}>
      <h2 style={{ fontSize: 30, fontWeight: 800, color: '#212529', textTransform: 'uppercase', marginBottom: 28 }}>
        SPECIAL EVENTS &amp; TRAINING
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }}>
        {specialEvents.map((event) => {
          const config = typeStyles[event.type] || typeStyles.Workshop

          return (
            <div
              key={`${event.date}-${event.title}`}
              style={{
                background: config.bg,
                borderRadius: 14,
                padding: '26px 30px',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={(entry) => {
                entry.currentTarget.style.transform = 'translateY(-3px)'
                entry.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(entry) => {
                entry.currentTarget.style.transform = 'translateY(0)'
                entry.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: config.color,
                    backgroundColor: 'rgba(255,255,255,0.75)',
                  }}
                >
                  {config.icon} {event.type}
                </span>
                <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                  <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {event.date}
                </span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#222', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                {event.title}
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', margin: '0 0 10px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} /> {event.location}
              </p>
              <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.55)', margin: 0, lineHeight: 1.7 }}>
                {event.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function LegacyAthleteProfileClient({
  athleteInfo,
  categories,
  nextEvents,
  beltExaminations,
  specialEvents,
  beltColors,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: FONT,
        color: '#212529',
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div style={{ height: 80, backgroundColor: '#080b14', width: '100%' }} />

      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 20px' }}>
        <AthleteHero athleteInfo={athleteInfo} categories={categories} />
        <CareerStats categories={categories} athleteInfo={athleteInfo} />
        <NextEventsSection nextEvents={nextEvents} />
        <TabbedCompetitions categories={categories} />
        <BeltJourney beltExaminations={beltExaminations} beltColors={beltColors} />
        <SpecialEventsSection specialEvents={specialEvents} />
      </div>

      <div style={{ height: 80 }} />
    </div>
  )
}
