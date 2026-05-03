import Link from 'next/link'
import { Trophy, ArrowRight } from 'lucide-react'
import {
  getAllAthletesLive,
  getRankSnapshotsLive,
} from '@/lib/server/repositories/athletes-live'
import ScrollReveal from '@/app/_components/ScrollReveal'
import '@/app/honours/honours.css'
import './HomeTopAthletes.css'

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

function ProfileSvg({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default async function HomeTopAthletes() {
  const [athletes, snapshots] = await Promise.all([
    getAllAthletesLive(),
    getRankSnapshotsLive(),
  ])
  const athleteMap = new Map(
    athletes
      .filter((a) => a.isPublic && a.status === 'active')
      .map((a) => [String(a.id), a])
  )

  const topAthletes = snapshots
    .filter((s) => athleteMap.has(String(s.athleteId)) && Number(s.totalPoints || 0) > 0)
    .sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0))
    .slice(0, 3)
    .map((s) => {
      const athlete = athleteMap.get(String(s.athleteId))
      if (!athlete) return null
      return {
        name: `${athlete.firstName} ${athlete.lastName}`,
        belt: beltLabel(athlete.currentBelt),
        branch: athlete.branchName,
        totalPoints: s.totalPoints || 0,
        skfId: athlete.skfId,
      }
    })
    .filter(Boolean) as {
      name: string; belt: string; branch: string;
      totalPoints: number; skfId: string;
    }[]

  // Dev fallback
  let top3 = topAthletes
  if (top3.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      top3 = [
        { name: 'John Doe', belt: 'Black Belt', branch: 'Main Dojo', totalPoints: 1200, skfId: 'SKF001' },
        { name: 'Jane Smith', belt: 'Brown Belt', branch: 'West Side', totalPoints: 950, skfId: 'SKF002' },
        { name: 'Mike Ross', belt: 'Green Belt', branch: 'North Dojo', totalPoints: 800, skfId: 'SKF003' },
      ]
    } else {
      return null
    }
  }

  if (top3.length < 3) return null

  return (
    <section className="obs-athletes-section" id="top-athletes">
      <div className="container">
        <ScrollReveal>
          <div className="obs-athletes-header">
            <div className="obs-badge">
              <Trophy size={12} /> CHAMPIONS
            </div>
            <h2 className="obs-title">
              OUR TOP <span className="text-gradient">ATHLETES</span>
            </h2>
            <p className="obs-subtitle">
              The highest-ranked competitors across all SKF Karate branches.
            </p>
          </div>
        </ScrollReveal>

        {/* Reuse the hon-podium design from Honours Board */}
        <ScrollReveal delay={0.15}>
          <div className="hon-podium">
            {/* 2nd Place */}
            <Link href={`/athlete/${top3[1].skfId}`} className="hon-pcard hon-pcard--2">
              <span className="hon-pcard__medal">🥈</span>
              <div className="hon-pcard__photo hon-pcard__photo--silver"><ProfileSvg size={56} /></div>
              <h3 className="hon-pcard__name">{top3[1].name}</h3>
              <span className="hon-pcard__belt">{top3[1].belt}</span>
              <span className="hon-pcard__branch">{top3[1].branch}</span>
              <div className="hon-pcard__pts">{Number(top3[1].totalPoints).toFixed(0)}<small>pts</small></div>
            </Link>

            {/* 1st Place */}
            <Link href={`/athlete/${top3[0].skfId}`} className="hon-pcard hon-pcard--1">
              <span className="hon-pcard__medal">👑</span>
              <div className="hon-pcard__photo hon-pcard__photo--gold"><ProfileSvg size={70} /></div>
              <h3 className="hon-pcard__name">{top3[0].name}</h3>
              <span className="hon-pcard__belt">{top3[0].belt}</span>
              <span className="hon-pcard__branch">{top3[0].branch}</span>
              <div className="hon-pcard__pts">{Number(top3[0].totalPoints).toFixed(0)}<small>pts</small></div>
            </Link>

            {/* 3rd Place */}
            <Link href={`/athlete/${top3[2].skfId}`} className="hon-pcard hon-pcard--3">
              <span className="hon-pcard__medal">🥉</span>
              <div className="hon-pcard__photo hon-pcard__photo--bronze"><ProfileSvg size={56} /></div>
              <h3 className="hon-pcard__name">{top3[2].name}</h3>
              <span className="hon-pcard__belt">{top3[2].belt}</span>
              <span className="hon-pcard__branch">{top3[2].branch}</span>
              <div className="hon-pcard__pts">{Number(top3[2].totalPoints).toFixed(0)}<small>pts</small></div>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal className="obs-athletes-cta" delay={0.3}>
          <Link href="/rankings" className="obs-btn-outline">
            VIEW FULL RANKINGS <ArrowRight size={14} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
