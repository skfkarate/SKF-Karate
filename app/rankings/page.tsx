import { getRankSnapshots } from '@/lib/server/repositories/athletes'
import { buildRankingBoards } from '@/app/_components/athlete/rankingBoardUtils'
import RankingDashboard from '@/app/_components/athlete/RankingDashboard'
import './rankings.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Global Rankings | SKF Karate',
  description: 'Official SKF Karate athlete rankings across all belt divisions and academies.',
}

export default async function RankingsPage() {
  const snapshots = getRankSnapshots().filter((entry) => entry.totalPoints > 0)
  const boards = buildRankingBoards(snapshots)
  const dojos = [...new Set(snapshots.map((s) => s.branchName).filter(Boolean))].sort()
  const allSorted = [...snapshots].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
  const podium = allSorted.slice(0, 3)

  return (
    <div className="rk-page">
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
          Official standings built from tournament results, belt progression, and ranking points across all divisions.
        </p>
      </section>

      {/* ═══ PODIUM ═══ */}
      {podium.length >= 3 && (
        <section className="rk-podium">
          {/* 2nd */}
          <div className="rk-pod rk-pod--2">
            <div className="rk-pod__photo rk-pod__photo--silver">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="rk-pod__name">{podium[1].athleteName}</span>
            <span className="rk-pod__pts">{podium[1].totalPoints?.toFixed(0)}</span>
            <div className="rk-pod__pillar rk-pod__pillar--silver"><span>2</span></div>
          </div>
          {/* 1st */}
          <div className="rk-pod rk-pod--1">
            <div className="rk-pod__crown">👑</div>
            <div className="rk-pod__photo rk-pod__photo--gold">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="rk-pod__name">{podium[0].athleteName}</span>
            <span className="rk-pod__pts">{podium[0].totalPoints?.toFixed(0)}</span>
            <div className="rk-pod__pillar rk-pod__pillar--gold"><span>1</span></div>
          </div>
          {/* 3rd */}
          <div className="rk-pod rk-pod--3">
            <div className="rk-pod__photo rk-pod__photo--bronze">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span className="rk-pod__name">{podium[2].athleteName}</span>
            <span className="rk-pod__pts">{podium[2].totalPoints?.toFixed(0)}</span>
            <div className="rk-pod__pillar rk-pod__pillar--bronze"><span>3</span></div>
          </div>
        </section>
      )}

      {/* ═══ LEADERBOARD ═══ */}
      <section className="rk-board-section">
        <RankingDashboard boards={boards} dojos={dojos} totalRanked={snapshots.length} />
      </section>
    </div>
  )
}
