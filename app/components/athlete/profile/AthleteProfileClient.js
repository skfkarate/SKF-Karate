'use client'

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Award,
  CalendarDays,
  ChevronRight,
  MapPin,
  Medal,
  Search,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'

import { beltColors } from './mockAthleteProfileData'

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function SectionHeader({ label, title, copy }) {
  return (
    <div className="profile-panel__header">
      <div>
        <span className="profile-section-label">{label}</span>
        <h2 className="profile-section-title">{title}</h2>
        {copy ? <p className="profile-section-copy">{copy}</p> : null}
      </div>
    </div>
  )
}

function MedalBadge({ rank }) {
  if (rank === '*' || rank === '-' || rank == null) {
    return <span className="text-sm font-semibold text-white/45">{rank ?? '-'}</span>
  }

  const parsed = typeof rank === 'number' ? rank : Number.parseInt(rank, 10)
  const gradients = {
    1: 'linear-gradient(180deg, #FDE02F 0%, #D89F00 100%)',
    2: 'linear-gradient(180deg, #D4D4D4 0%, #9E9E9E 100%)',
    3: 'linear-gradient(180deg, #C27A27 0%, #8A4B0A 100%)',
  }

  if (parsed >= 1 && parsed <= 3) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white"
        style={{
          background: gradients[parsed],
          textShadow: '0 1px 1px rgba(0,0,0,0.3)',
        }}
      >
        {parsed}
      </span>
    )
  }

  return <span className="text-sm font-semibold text-white/75">{rank}</span>
}

function HeroStats({ athlete }) {
  const stats = [
    {
      label: 'Overall Rank',
      value: athlete.overallRank ? `#${athlete.overallRank}` : 'NA',
      copy: 'Current position across the active athlete pool.',
    },
    {
      label: 'Branch Rank',
      value: athlete.branchRank ? `#${athlete.branchRank}` : 'NA',
      copy: `Standing inside SKF ${athlete.branchName}.`,
    },
    {
      label: 'Active Points',
      value: athlete.activePoints.toFixed(0),
      copy: 'Current ranking score used for dashboard standings.',
    },
    {
      label: 'Medals',
      value: athlete.totalMedals,
      copy: 'Mock medal ledger restored for the profile preview.',
    },
  ]

  return (
    <div className="profile-hero-shell__stats">
      {stats.map((stat) => (
        <div key={stat.label} className="profile-hero-shell__stat">
          <div className="profile-hero-shell__statValue">{stat.value}</div>
          <div className="profile-hero-shell__statLabel">{stat.label}</div>
          <p className="profile-hero-shell__statCopy">{stat.copy}</p>
        </div>
      ))}
    </div>
  )
}

function HeroAside({ athlete, primaryCategory }) {
  return (
    <div className="profile-hero-shell__aside">
      <div className="profile-panel profile-panel--compact">
        <div className="profile-panel__content">
          <span className="profile-section-label">Profile Snapshot</span>
          <h3 className="mt-3 text-xl font-black uppercase tracking-tight text-white">
            {primaryCategory.name}
          </h3>
          <div className="mt-5 space-y-4">
            <div className="profile-data-row">
              <span className="profile-data-label">Registration</span>
              <span className="profile-data-value">{athlete.id}</span>
            </div>
            <div className="profile-data-row">
              <span className="profile-data-label">Current Belt</span>
              <span className="profile-data-value">{athlete.currentBelt}</span>
            </div>
            <div className="profile-data-row">
              <span className="profile-data-label">Coach</span>
              <span className="profile-data-value">{athlete.coachName}</span>
            </div>
            <div className="profile-data-row">
              <span className="profile-data-label">Status</span>
              <span className="profile-data-value capitalize">{athlete.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-panel profile-panel--compact">
        <div className="profile-panel__content">
          <span className="profile-section-label">Career Pulse</span>
          <div className="mt-4 grid gap-3">
            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                Total Bouts
              </p>
              <p className="mt-2 text-3xl font-black text-white">{athlete.totalBouts}</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                Win Rate
              </p>
              <p className="mt-2 text-3xl font-black text-white">{athlete.winRate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CareerStatsPanel({ totals }) {
  const cards = [
    { label: 'Gold', value: totals.totalGolds, icon: <Award size={18} />, accent: 'text-[#facc15]' },
    { label: 'Silver', value: totals.totalSilvers, icon: <Medal size={18} />, accent: 'text-slate-300' },
    { label: 'Bronze', value: totals.totalBronzes, icon: <Trophy size={18} />, accent: 'text-amber-700' },
    { label: 'Events', value: totals.totalEvents, icon: <Zap size={18} />, accent: 'text-brand-red' },
    { label: 'Medals', value: totals.totalMedals, icon: <Star size={18} />, accent: 'text-gold' },
  ]

  return (
    <section className="profile-panel">
      <div className="profile-panel__content">
        <SectionHeader
          label="Career Stats"
          title="Performance Summary"
          copy="The restored mock profile data continues to drive medals, event count, and category totals for each athlete detail page."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
            >
              <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] ${card.accent}`}>
                {card.icon}
                {card.label}
              </div>
              <p className="mt-4 text-4xl font-black text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UpcomingEventsPanel({ nextEvents }) {
  return (
    <section className="profile-panel">
      <div className="profile-panel__content">
        <SectionHeader
          label="Upcoming"
          title="Athlete Schedule"
          copy="The upcoming block is restored with the same preview event structure used to test the dedicated athlete profile flow."
        />

        <div className="mt-8 grid gap-4">
          {nextEvents.map((event) => (
            <div
              key={`${event.dateRange}-${event.name}`}
              className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 transition hover:border-gold/35 hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                    {event.dateRange}
                  </p>
                  <h3 className="mt-3 text-lg font-black text-white">{event.name}</h3>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-brand-red" />
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm text-white/55">
                <img
                  src={event.flag}
                  alt=""
                  className="h-4 w-6 rounded object-cover"
                />
                <span>Mock tournament card restored for athlete preview mode.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResultsPanel({ categories }) {
  const [activeTab, setActiveTab] = useState(0)
  const [filter, setFilter] = useState('')
  const category = categories[activeTab]

  const filteredResults = useMemo(() => {
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
    <section className="profile-panel">
      <div className="profile-panel__content">
        <SectionHeader
          label="Competition Results"
          title="Category Rankings"
          copy="The tabbed competition section is back on the athlete route and still uses the restored fake profile result tables for preview and QA."
        />

        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setActiveTab(index)
                setFilter('')
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                index === activeTab
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/85'
              }`}
            >
              {item.name}
              {item.rank ? <span className="ml-2 text-white/80">#{item.rank}</span> : null}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Active points {category.points} of {category.totalPoints} total ranking points.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {category.honours.map((honour) => (
                <div
                  key={honour.name}
                  className="rounded-full border border-white/8 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70"
                >
                  {honour.name}: {honour.gold}G {honour.silver}S {honour.bronze}B
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter events by name, type, or date..."
              className="w-full rounded-full border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold/35"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                  <th className="border-b border-white/10 px-4 py-4">Date</th>
                  <th className="border-b border-white/10 px-4 py-4">Event</th>
                  <th className="border-b border-white/10 px-4 py-4">Type</th>
                  <th className="border-b border-white/10 px-4 py-4">Category</th>
                  <th className="border-b border-white/10 px-4 py-4 text-center">Factor</th>
                  <th className="border-b border-white/10 px-4 py-4 text-center">View</th>
                  <th className="border-b border-white/10 px-4 py-4 text-center">Rank</th>
                  <th className="border-b border-white/10 px-4 py-4 text-center">Wins</th>
                  <th className="border-b border-white/10 px-4 py-4 text-center">Points</th>
                  <th className="border-b border-white/10 px-4 py-4 text-center">Actual</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={`${result.date}-${result.event}`} className="transition hover:bg-white/[0.03]">
                    <td className="border-b border-white/6 px-4 py-5 font-semibold text-white/85">
                      {result.date}
                    </td>
                    <td className="border-b border-white/6 px-4 py-5 text-white/80">
                      <div className="flex min-w-[260px] items-center gap-3">
                        <img src={result.flag} alt="" className="h-5 w-7 rounded object-cover" />
                        <span>{result.event}</span>
                      </div>
                    </td>
                    <td className="border-b border-white/6 px-4 py-5 text-white/60">{result.type}</td>
                    <td className="border-b border-white/6 px-4 py-5 text-white/60">{result.category}</td>
                    <td className="border-b border-white/6 px-4 py-5 text-center text-white/60">{result.factor}</td>
                    <td className="border-b border-white/6 px-4 py-5 text-center text-white/45">
                      {result.hasView ? <Search className="mx-auto h-4 w-4" /> : null}
                    </td>
                    <td className="border-b border-white/6 px-4 py-5 text-center">
                      <MedalBadge rank={result.rank} />
                    </td>
                    <td className="border-b border-white/6 px-4 py-5 text-center text-white/75">{result.wins}</td>
                    <td className="border-b border-white/6 px-4 py-5 text-center font-semibold text-white/80">
                      {result.points}
                    </td>
                    <td className="border-b border-white/6 px-4 py-5 text-center font-semibold text-gold/80">
                      {result.actual}
                    </td>
                  </tr>
                ))}
                <tr className="bg-white/[0.02]">
                  <td className="px-4 py-4" />
                  <td className="px-4 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white/75" colSpan={7}>
                    Total Points: {category.totalPoints}
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-gold" colSpan={2}>
                    Actual: {category.points}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function BeltJourneyPanel({ examinations }) {
  return (
    <section className="profile-panel">
      <div className="profile-panel__content">
        <SectionHeader
          label="Belt Progression"
          title="Journey Through Gradings"
          copy="The restored athlete detail page keeps the fake grading ladder intact so the profile route can be reviewed end to end."
        />

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                <th className="border-b border-white/10 px-4 py-4">Date</th>
                <th className="border-b border-white/10 px-4 py-4">Belt</th>
                <th className="border-b border-white/10 px-4 py-4">Grade</th>
                <th className="border-b border-white/10 px-4 py-4">Examiner</th>
                <th className="border-b border-white/10 px-4 py-4">Dojo</th>
                <th className="border-b border-white/10 px-4 py-4 text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {examinations.map((exam) => {
                const color = beltColors[exam.belt] || '#888888'

                return (
                  <tr key={`${exam.date}-${exam.grade}`} className="transition hover:bg-white/[0.03]">
                    <td className="border-b border-white/6 px-4 py-5 font-semibold text-white/85">
                      {exam.date}
                    </td>
                    <td className="border-b border-white/6 px-4 py-5">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-12 rounded"
                          style={{
                            backgroundColor: color,
                            border: exam.belt === 'White' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
                          }}
                        />
                        <span className="font-semibold text-white/80">{exam.belt}</span>
                      </div>
                    </td>
                    <td className="border-b border-white/6 px-4 py-5 text-gold">{exam.grade}</td>
                    <td className="border-b border-white/6 px-4 py-5 text-white/65">{exam.examiner}</td>
                    <td className="border-b border-white/6 px-4 py-5 text-white/65">{exam.dojo}</td>
                    <td className="border-b border-white/6 px-4 py-5 text-center">
                      <span className="inline-flex rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
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
    </section>
  )
}

function HonoursPanel({ categories }) {
  return (
    <section className="profile-panel profile-panel--compact">
      <div className="profile-panel__content">
        <SectionHeader
          label="Honours"
          title="Medal Ledger"
          copy="Each category still carries the restored medal summary to mirror the original test data file."
        />

        <div className="mt-6 space-y-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="rounded-[24px] border border-white/8 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  {category.name}
                </h3>
                {category.rank ? (
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/65">
                    Rank #{category.rank}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                {category.honours.map((honour) => (
                  <div key={honour.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/65">{honour.name}</span>
                    <span className="font-semibold text-white/85">
                      {honour.gold}G / {honour.silver}S / {honour.bronze}B
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SpecialEventsPanel({ specialEvents }) {
  const typeStyles = {
    Seminar: {
      chip: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
      icon: <Star size={14} />,
    },
    'Training Camp': {
      chip: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
      icon: <Zap size={14} />,
    },
    Workshop: {
      chip: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
      icon: <Users size={14} />,
    },
  }

  return (
    <section className="profile-panel">
      <div className="profile-panel__content">
        <SectionHeader
          label="Special Events"
          title="Seminars And Camps"
          copy="These restored mock event cards keep the original preview content available while the athlete route is being validated."
        />

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {specialEvents.map((event) => {
            const config = typeStyles[event.type] || typeStyles.Workshop

            return (
              <div
                key={`${event.date}-${event.title}`}
                className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${config.chip}`}>
                    {config.icon}
                    {event.type}
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                    <CalendarDays size={14} />
                    {formatShortDate(event.date)}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-black text-white">{event.title}</h3>
                <p className="mt-3 flex items-center gap-2 text-sm text-white/55">
                  <MapPin size={14} />
                  {event.location}
                </p>
                <p className="mt-4 text-sm leading-7 text-white/62">{event.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function DetailPanel({ athlete }) {
  const rows = [
    ['Country', athlete.country],
    ['Branch', athlete.branchName],
    ['Date of Birth', athlete.dateOfBirth],
    ['Joined SKF', athlete.joinedOn],
    ['Lifetime Points', athlete.lifetimePoints.toLocaleString()],
    ['Coach', athlete.coachName],
  ]

  return (
    <section className="profile-panel profile-panel--compact">
      <div className="profile-panel__content">
        <SectionHeader
          label="Athlete File"
          title="Identity Details"
          copy="This panel keeps the dedicated athlete page grounded in the selected athlete record while the results remain intentionally mocked."
        />

        <div className="profile-data-list mt-6">
          {rows.map(([label, value]) => (
            <div key={label} className="profile-data-row">
              <span className="profile-data-label">{label}</span>
              <span className="profile-data-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AthleteProfileClient({ profile }) {
  const { athlete, primaryCategory, categories, nextEvents, beltExaminations, specialEvents, totals } = profile

  return (
    <div className="profile-dashboard">
      <div className="profile-dashboard__bg" />

      <div className="container profile-dashboard__content">
        <div className="profile-topbar">
          <Link href="/athlete" className="profile-topbar__link">
            <ArrowLeft size={16} />
            Back To Athlete Lookup
          </Link>

          <div className="profile-topbar__status">
            <span className="profile-status-pill profile-status-pill--accent">{athlete.currentBelt}</span>
            <span className="profile-status-pill">{athlete.branchName}</span>
            <span className="profile-status-pill profile-status-pill--success">Public Athlete Profile</span>
          </div>
        </div>

        <section className="profile-panel profile-hero-shell">
          <div className="profile-orb profile-orb--gold" />
          <div className="profile-orb profile-orb--crimson" />

          <div className="profile-hero-shell__grid">
            <div className="profile-hero-shell__visual">
              <div className="profile-hero-shell__portrait">
                <img
                  src={athlete.photo}
                  alt={athlete.shortName}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="profile-hero-shell__watermark">SKF ATHLETE</div>
                <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="profile-chip profile-chip--gold">{athlete.country}</span>
                    <span className="profile-chip profile-chip--blue">{athlete.id}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
                    {primaryCategory.name}
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="profile-panel profile-panel--compact">
                  <div className="profile-panel__content">
                    <span className="profile-section-label">Athlete Card</span>
                    <div className="mt-4 space-y-3">
                      <div className="profile-data-row">
                        <span className="profile-data-label">Age</span>
                        <span className="profile-data-value">{athlete.age}</span>
                      </div>
                      <div className="profile-data-row">
                        <span className="profile-data-label">Branch</span>
                        <span className="profile-data-value">{athlete.branchName}</span>
                      </div>
                      <div className="profile-data-row">
                        <span className="profile-data-label">Status</span>
                        <span className="profile-data-value capitalize">{athlete.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-panel profile-panel--compact">
                  <div className="profile-panel__content">
                    <span className="profile-section-label">Ranking Pulse</span>
                    <p className="mt-4 text-3xl font-black text-white">
                      {athlete.activePoints.toFixed(0)}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/55">
                      Live active points from the athlete store combined with the restored mock profile dataset.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="profile-section-label">Athlete Profile</span>
                <h1 className="profile-hero-shell__name mt-5">{athlete.name}</h1>
                <p className="profile-hero-shell__lede mt-5">{athlete.biography}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="profile-chip profile-chip--gold">Current Belt {athlete.currentBelt}</span>
                <span className="profile-chip profile-chip--blue">{primaryCategory.name}</span>
                <span className="profile-chip profile-chip--crimson">SKF {athlete.branchName}</span>
                <span className="profile-chip profile-chip--muted capitalize">{athlete.status}</span>
              </div>

              <HeroStats athlete={athlete} />

              <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                      Primary Category
                    </p>
                    <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white">
                      {primaryCategory.name}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/58">
                      Rank #{primaryCategory.rank || 'NA'} with {primaryCategory.points} active points and {primaryCategory.totalPoints} total points.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="profile-chip profile-chip--gold">{totals.totalGolds} Gold</span>
                    <span className="profile-chip">{totals.totalSilvers} Silver</span>
                    <span className="profile-chip">{totals.totalBronzes} Bronze</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="profile-action-link">
                    <ShieldCheck size={16} />
                    Dedicated athlete profile restored
                  </span>
                </div>
              </div>
            </div>

            <HeroAside athlete={athlete} primaryCategory={primaryCategory} />
          </div>
        </section>

        <div className="profile-utility-grid">
          <CareerStatsPanel totals={totals} />
          <UpcomingEventsPanel nextEvents={nextEvents} />
        </div>

        <div className="profile-main-grid">
          <div className="profile-col-left">
            <ResultsPanel categories={categories} />
            <SpecialEventsPanel specialEvents={specialEvents} />
          </div>

          <div className="profile-col-right">
            <BeltJourneyPanel examinations={beltExaminations} />
            <HonoursPanel categories={categories} />
            <DetailPanel athlete={athlete} />
          </div>
        </div>
      </div>
    </div>
  )
}
