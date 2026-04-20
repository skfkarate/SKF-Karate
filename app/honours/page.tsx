import Link from 'next/link'
import { getAllAthletes, getRankSnapshots } from '@/lib/server/repositories/athletes'
import { getAllTournaments } from '@/lib/server/repositories/tournaments'
import AthleteCard from '@/app/_components/athlete/AthleteCard'
import DanCarousel from '@/app/_components/athlete/DanCarousel'
import './honours.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Honours Board | SKF Karate',
  description: 'Celebrating our black belt holders, top performers, and tournament champions.',
}

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

function beltSort(belt: string): number {
  if (belt.includes('3rd')) return 3
  if (belt.includes('2nd')) return 2
  if (belt.includes('1st')) return 1
  return 0
}

function medalEmoji(medal: string) {
  return medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'
}

function ProfileSvg({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default async function HonoursPage() {
  const athletes = getAllAthletes()
  const publicAthletes = athletes.filter(a => a.isPublic)
  const snapshots = getRankSnapshots().filter(e => e.totalPoints > 0)
  const tournaments = getAllTournaments()

  // ── DAN BOARD ──
  const danHolders = publicAthletes
    .filter(a => a.currentBelt?.startsWith('black'))
    .sort((a, b) => beltSort(b.currentBelt) - beltSort(a.currentBelt))

  // ── TOP 3 OVERALL ──
  const allSorted = [...snapshots].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
  const top3 = allSorted.slice(0, 3).map(snap => {
    const athlete = publicAthletes.find(a => a.id === snap.athleteId)
    return { ...snap, athlete }
  })

  // ── NATIONAL GOLD ──
  const nationalGolds = tournaments
    .filter(t => t.level === 'national')
    .flatMap(t => t.winners.filter(w => w.medal === 'gold').map(w => ({ ...w, tournament: t.shortName, date: t.date })))

  // ── STATE GOLD ──
  const stateGolds = tournaments
    .filter(t => t.level === 'state')
    .flatMap(t => t.winners.filter(w => w.medal === 'gold').map(w => ({ ...w, tournament: t.shortName, date: t.date })))

  // ── LATEST HIGHLIGHTS ──
  const completedTournaments = tournaments
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestTournament = completedTournaments[0]
  const latestGolds = latestTournament
    ? latestTournament.winners.filter(w => w.medal === 'gold').slice(0, 3)
    : []

  return (
    <div className="hon-page">
      <div className="hon-orb hon-orb--1" />
      <div className="hon-orb hon-orb--2" />
      <div className="hon-orb hon-orb--3" />
      <div className="hon-watermark">栄誉</div>

      {/* ═══ HERO ═══ */}
      <section className="hon-hero">
        <div className="hon-hero__badge">
          <span className="hon-hero__badge-dot" /> Hall of Honour
        </div>
        <h1 className="hon-hero__title">
          <span className="hon-hero__line1">Honours</span>
          <span className="hon-hero__line2">Board</span>
        </h1>
        <p className="hon-hero__sub">
          Celebrating the discipline, dedication, and achievement of our finest karatekas.
        </p>
      </section>

      {/* ═══ DAN BOARD — Depth Carousel ═══ */}
      {danHolders.length > 0 && (
        <section className="hon-section hon-section--wide">
          <div className="hon-section__header">
            <span className="hon-section__tag">🥋 The Dan Board</span>
            <h2 className="hon-section__title">Black Belt Holders</h2>
            <p className="hon-section__sub">
              Achieving Dan grade is the highest milestone in karate.
            </p>
          </div>

          <DanCarousel danHolders={danHolders} />
        </section>
      )}

      {/* ═══ TOP 3 — Podium Style ═══ */}
      {top3.length >= 3 && (
        <section className="hon-section">
          <div className="hon-section__header">
            <span className="hon-section__tag">🏆 Top Performers</span>
            <h2 className="hon-section__title">Overall Top 3</h2>
            <p className="hon-section__sub">
              The highest-ranked athletes across all categories.
            </p>
          </div>

          <div className="hon-podium">
            {/* 2nd */}
            <Link href={`/athlete/${top3[1].registrationNumber}`} className="hon-pcard hon-pcard--2">
              <span className="hon-pcard__medal">🥈</span>
              <div className="hon-pcard__photo hon-pcard__photo--silver"><ProfileSvg size={56} /></div>
              <h3 className="hon-pcard__name">{top3[1].athleteName}</h3>
              <span className="hon-pcard__belt">{beltLabel(top3[1].currentBelt)}</span>
              <span className="hon-pcard__branch">{top3[1].branchName}</span>
              <div className="hon-pcard__pts">{Number(top3[1].totalPoints || 0).toFixed(0)}<small> pts</small></div>
            </Link>
            {/* 1st */}
            <Link href={`/athlete/${top3[0].registrationNumber}`} className="hon-pcard hon-pcard--1">
              <span className="hon-pcard__medal">👑</span>
              <div className="hon-pcard__photo hon-pcard__photo--gold"><ProfileSvg size={64} /></div>
              <h3 className="hon-pcard__name">{top3[0].athleteName}</h3>
              <span className="hon-pcard__belt">{beltLabel(top3[0].currentBelt)}</span>
              <span className="hon-pcard__branch">{top3[0].branchName}</span>
              <div className="hon-pcard__pts">{Number(top3[0].totalPoints || 0).toFixed(0)}<small> pts</small></div>
            </Link>
            {/* 3rd */}
            <Link href={`/athlete/${top3[2].registrationNumber}`} className="hon-pcard hon-pcard--3">
              <span className="hon-pcard__medal">🥉</span>
              <div className="hon-pcard__photo hon-pcard__photo--bronze"><ProfileSvg size={56} /></div>
              <h3 className="hon-pcard__name">{top3[2].athleteName}</h3>
              <span className="hon-pcard__belt">{beltLabel(top3[2].currentBelt)}</span>
              <span className="hon-pcard__branch">{top3[2].branchName}</span>
              <div className="hon-pcard__pts">{Number(top3[2].totalPoints || 0).toFixed(0)}<small> pts</small></div>
            </Link>
          </div>
        </section>
      )}

      {/* ═══ NATIONAL CHAMPIONS ═══ */}
      {nationalGolds.length > 0 && (
        <section className="hon-section">
          <div className="hon-section__header">
            <span className="hon-section__tag">🏅 National Level</span>
            <h2 className="hon-section__title">National Gold Medalists</h2>
          </div>
          <div className="hon-medal-grid">
            {nationalGolds.map((w: any, i: number) => (
              <div key={`nat-${w.id}-${i}`} className="hon-medal-card">
                <div className="hon-medal-card__photo"><ProfileSvg size={36} /></div>
                <div className="hon-medal-card__info">
                  <h3 className="hon-medal-card__name">{w.athleteName}</h3>
                  <span className="hon-medal-card__detail">{w.belt} · {w.branchName}</span>
                  <span className="hon-medal-card__event">{medalEmoji(w.medal)} {w.tournament}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ STATE CHAMPIONS ═══ */}
      {stateGolds.length > 0 && (
        <section className="hon-section">
          <div className="hon-section__header">
            <span className="hon-section__tag">🏆 State Level</span>
            <h2 className="hon-section__title">State Gold Medalists</h2>
          </div>
          <div className="hon-medal-grid">
            {stateGolds.map((w: any, i: number) => (
              <div key={`state-${w.id}-${i}`} className="hon-medal-card">
                <div className="hon-medal-card__photo"><ProfileSvg size={36} /></div>
                <div className="hon-medal-card__info">
                  <h3 className="hon-medal-card__name">{w.athleteName}</h3>
                  <span className="hon-medal-card__detail">{w.belt} · {w.branchName}</span>
                  <span className="hon-medal-card__event">{medalEmoji(w.medal)} {w.tournament}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ RECENT SPOTLIGHT — Full Athlete Cards ═══ */}
      {latestTournament && latestGolds.length > 0 && (
        <section className="hon-section hon-section--records">
          <div className="hon-section__header">
            <span className="hon-section__tag">🔥 Recent Spotlight</span>
            <h2 className="hon-section__title">{latestTournament.shortName}</h2>
            <p className="hon-section__sub">
              Gold medalists from our latest tournament — {new Date(latestTournament.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="hon-spotlight-grid">
            {latestGolds.map((w: any, i: number) => (
              <AthleteCard
                key={`spot-${w.id}-${i}`}
                name={w.athleteName}
                belt={w.belt}
                branch={w.branchName}
                category={w.category?.replace(/-/g, ' ')}
                medal="gold"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
