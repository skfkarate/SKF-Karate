import Link from 'next/link'
import {
  getAllAthletesLive,
  getRankSnapshotsLive,
} from '@/lib/server/repositories/athletes-live'
import { hydrateRankingMovementsLive } from '@/lib/server/repositories/ranking-snapshots'
import { buildRankingBoards } from '@/app/_components/athlete/rankingBoardUtils'
import RankingDashboard from '@/app/_components/athlete/RankingDashboard'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'
import './rankings.css'

export const metadata = buildSeoMetadata(
  '/rankings',
  'View official SKF Karate athlete rankings by belt level, branches, tournament results, and performance divisions in Karnataka.'
)

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

export default async function RankingsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Rankings', '/rankings')
  const [athletes, allSnapshots] = await Promise.all([
    getAllAthletesLive(),
    getRankSnapshotsLive(),
  ])
  const publicActiveAthleteIds = new Set(
    athletes
      .filter((athlete) => athlete.isPublic && athlete.status === 'active')
      .map((athlete) => String(athlete.id))
  )
  const visibleSnapshots = allSnapshots.filter((entry) =>
    publicActiveAthleteIds.has(String(entry.athleteId))
  )
  const snapshots = await hydrateRankingMovementsLive(visibleSnapshots)
  const boards = buildRankingBoards(snapshots)
  const dojos = [...new Set(snapshots.map((s) => s.branchName).filter(Boolean))].sort()

  // Check if any athletes have tournament points
  const hasAnyTournamentPoints = snapshots.some((s) => Number(s.totalPoints || 0) > 0)
  const competitiveSnapshots = hasAnyTournamentPoints
    ? snapshots.filter((entry) => Number(entry.totalPoints || 0) > 0)
    : []

  // Podium: top 3 by current ranking (belt-based)
  const allSorted = [...snapshots].sort((a, b) => {
    const aBelt = a.beltOrder ?? 0
    const bBelt = b.beltOrder ?? 0
    if (bBelt !== aBelt) return bBelt - aBelt
    return (b.totalPoints || 0) - (a.totalPoints || 0)
  })
  const podium = allSorted.slice(0, 3)

  /* Top points for proportional bar widths in the graph */
  const topPts = competitiveSnapshots[0]?.totalPoints || 1

  return (
    <div className="rk-page">
      <JsonLdScript data={breadcrumbJsonLd} />

      {/* Ambient effects — identical to /athlete/search */}
      <div className="rk-orb rk-orb--1" />
      <div className="rk-orb rk-orb--2" />
      <div className="rk-orb rk-orb--3" />
      <div className="rk-watermark">順位</div>

      {/* ═══ HERO ═══ */}
      <section className="rk-hero">
        <div className="rk-hero__badge">
          <span className="rk-hero__badge-dot" /> Live Rankings
        </div>
        
        <h1 className="rk-hero__title">
          <span className="rk-hero__line1">SKF</span>
          <span className="rk-hero__line2">Rankings</span>
        </h1>
        
        <p className="rk-hero__sub">
          Official standings built from technical rankings{hasAnyTournamentPoints ? ', tournament results, and ranking points' : ' and training achievements'} across all divisions.
        </p>
      </section>

      {/* ═══ PODIUM ═══ */}
      {podium.length >= 3 && (
        <section className="rk-podium">
          {/* 2nd */}
          <Link href={`/athlete/${podium[1].skfId}`} className="rk-pod rk-pod--2">
            <div className="rk-pod__photo rk-pod__photo--silver">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="rk-pod__name">{podium[1].athleteName}</span>
            <span className="rk-pod__pts">{beltLabel(podium[1].currentBelt)}</span>
            <div className="rk-pod__pillar rk-pod__pillar--silver"><span>2</span></div>
          </Link>
          {/* 1st */}
          <Link href={`/athlete/${podium[0].skfId}`} className="rk-pod rk-pod--1">
            <div className="rk-pod__crown">👑</div>
            <div className="rk-pod__photo rk-pod__photo--gold">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="rk-pod__name">{podium[0].athleteName}</span>
            <span className="rk-pod__pts">{beltLabel(podium[0].currentBelt)}</span>
            <div className="rk-pod__pillar rk-pod__pillar--gold"><span>1</span></div>
          </Link>
          {/* 3rd */}
          <Link href={`/athlete/${podium[2].skfId}`} className="rk-pod rk-pod--3">
            <div className="rk-pod__photo rk-pod__photo--bronze">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="rk-pod__name">{podium[2].athleteName}</span>
            <span className="rk-pod__pts">{beltLabel(podium[2].currentBelt)}</span>
            <div className="rk-pod__pillar rk-pod__pillar--bronze"><span>3</span></div>
          </Link>
        </section>
      )}

      {/* ═══ TOP 3 POINTS GRAPH — only show when tournament points exist ═══ */}
      {hasAnyTournamentPoints && competitiveSnapshots.length >= 3 && (
        <section className="rk-graph">
          <div className="rk-graph__card">
            <div className="rk-graph__header">
              <span className="rk-graph__icon">📊</span>
              <h2 className="rk-graph__title">Points Comparison</h2>
            </div>

            {[competitiveSnapshots[0], competitiveSnapshots[1], competitiveSnapshots[2]].map((athlete, i) => {
              const rank = i + 1
              const pct = Math.max(8, ((athlete.totalPoints || 0) / topPts) * 100)
              const barClass = rank === 1 ? 'rk-graph__fill--gold' : rank === 2 ? 'rk-graph__fill--silver' : 'rk-graph__fill--bronze'

              return (
                <Link
                  key={athlete.skfId}
                  href={`/athlete/${athlete.skfId}`}
                  className="rk-graph__row"
                >
                  <div className="rk-graph__rank-badge" data-rank={rank}>
                    {rank}
                  </div>
                  <div className="rk-graph__info">
                    <span className="rk-graph__name">{athlete.athleteName}</span>
                    <span className="rk-graph__meta">
                      {athlete.branchName && <span>{athlete.branchName}</span>}
                      {athlete.totalMedals > 0 && <span>🏅 {athlete.totalMedals}</span>}
                    </span>
                  </div>
                  <div className="rk-graph__bar-wrap">
                    <div className={`rk-graph__fill ${barClass}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="rk-graph__value">{Number(athlete.totalPoints || 0).toFixed(0)}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ LEADERBOARD ═══ */}
      <section className="rk-board-section">
        <RankingDashboard boards={boards} dojos={dojos} totalRanked={snapshots.length} hasAnyTournamentPoints={hasAnyTournamentPoints} />
      </section>
    </div>
  )
}
