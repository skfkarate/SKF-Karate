import { FaTrophy } from 'react-icons/fa'
import { getRankSnapshots } from '@/lib/data/athletes'
import { buildRankingBoards } from '@/app/_components/athlete/rankingBoardUtils'
import RankingDashboard from '@/app/_components/athlete/RankingDashboard'
import '@/app/rankings/rankings.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Global Rankings | SKF Karate',
  description: 'Official SKF Karate athlete rankings. View live standings across all belt divisions and academies.',
}

export default async function RankingsPage() {
  const snapshots = getRankSnapshots().filter((entry) => entry.totalPoints > 0)
  const boards = buildRankingBoards(snapshots)
  const dojos = [...new Set(snapshots.map((s) => s.branchName).filter(Boolean))].sort()

  return (
    <div className="rankings-page">
      <section className="rankings-hero">
        <div className="rankings-hero__bg">
          <div className="glow glow-red rankings-hero__glow-1"></div>
          <div className="glow glow-gold rankings-hero__glow-2"></div>
        </div>
        
        <div className="container rankings-hero__content">
          <span className="section-label"><FaTrophy /> Worldwide Performance</span>
          <h1 className="rankings-hero__title">
            SKF <span className="text-gradient">Rankings</span>
          </h1>
          <p className="rankings-hero__subtitle">
            Official standings across all belt divisions, divisions, and academies.
          </p>
        </div>
      </section>

      <div className="rankings-tab-content active view-dashboard-wrapper">
        <RankingDashboard 
          boards={boards} 
          dojos={dojos} 
          totalRanked={snapshots.length} 
        />
      </div>
    </div>
  )
}
