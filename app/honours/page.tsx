import Link from 'next/link'

import AthleteCard from '@/app/_components/athlete/AthleteCard'
import DanCarousel from '@/app/_components/athlete/DanCarousel'
import {
  getAllAthletesLive,
  getRankSnapshotsLive,
} from '@/lib/server/repositories/athletes-live'
import { getPublicSenseisLive } from '@/lib/server/repositories/senseis-live'
import { normaliseEventTier, normaliseResult } from '@/lib/utils/points'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'
import './honours.css'

export const revalidate = 300

export const metadata = buildSeoMetadata(
  '/honours',
  'Celebrate SKF Karate black belts, champions, top performers, medal winners, instructors, and athletes recognized for karate excellence in Karnataka today.'
)

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

function beltSort(belt: string): number {
  if (belt.includes('3rd')) return 3
  if (belt.includes('2nd')) return 2
  if (belt.includes('1st')) return 1
  return 0
}

function danSort(label: string): number {
  const normalized = String(label || '').toLowerCase()
  if (normalized.includes('5th')) return 5
  if (normalized.includes('4th')) return 4
  if (normalized.includes('3rd')) return 3
  if (normalized.includes('2nd')) return 2
  if (normalized.includes('1st')) return 1
  if (normalized.includes('black')) return 0
  return -1
}

function medalEmoji(medal: string) {
  return medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'
}

type AthleteAchievement = {
  id?: string
  type?: string
  competitionResult?: string
  result?: string
  sourceEventLevel?: string
  tournamentLevel?: string
  tournamentName?: string
  title?: string
  date?: string
  eventCategory?: string
  sourceEventId?: string
}

type PublicAthlete = {
  id: string
  skfId: string
  firstName: string
  lastName: string
  branchName: string
  currentBelt: string
  photoUrl?: string
  isPublic?: boolean
  achievements?: AthleteAchievement[]
}

type RankingSnapshot = {
  athleteId: string
  skfId: string
  athleteName: string
  branchName: string
  currentBelt: string
  totalPoints?: number
}

type TournamentAchievement = {
  id: string
  athleteId: string
  athleteName: string
  skfId: string
  branchName: string
  belt: string
  photoUrl?: string
  medal: string
  level: string
  tournament: string
  date: string
  category: string
  sourceEventId: string
}

function ProfileSvg({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function buildTournamentAchievements(publicAthletes: PublicAthlete[]): TournamentAchievement[] {
  return publicAthletes
    .flatMap((athlete) =>
      (athlete.achievements || [])
        .filter((achievement) => achievement.type?.startsWith('tournament'))
        .map((achievement, index) => ({
          id: achievement.id || `${athlete.id}-${index}`,
          athleteId: athlete.id,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          skfId: athlete.skfId,
          branchName: athlete.branchName,
          belt: beltLabel(athlete.currentBelt),
          photoUrl: athlete.photoUrl,
          medal: normaliseResult(
            achievement.competitionResult ||
            achievement.result ||
            achievement.type.replace('tournament-', '')
          ),
          level: normaliseEventTier(achievement.sourceEventLevel || achievement.tournamentLevel),
          tournament: achievement.tournamentName || achievement.title || 'Tournament',
          date: achievement.date || '',
          category: achievement.eventCategory || '',
          sourceEventId: achievement.sourceEventId || '',
        }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getLatestSpotlight(achievements: TournamentAchievement[]) {
  const latestGold = achievements.find((achievement) => achievement.medal === 'gold')
  if (!latestGold) {
    return {
      title: '',
      athletes: [],
      date: '',
    }
  }

  const sourceKey = latestGold.sourceEventId || `${latestGold.tournament}-${latestGold.date}`
  return {
    title: latestGold.tournament,
    date: latestGold.date,
    athletes: achievements
      .filter(
        (achievement) =>
          achievement.medal === 'gold' &&
          (achievement.sourceEventId || `${achievement.tournament}-${achievement.date}`) === sourceKey
      )
      .slice(0, 3),
  }
}

export default async function HonoursPage() {
  const [athletes, snapshots, senseis] = await Promise.all([
    getAllAthletesLive(),
    getRankSnapshotsLive(),
    getPublicSenseisLive(),
  ])
  const publicAthletes = (athletes as PublicAthlete[]).filter((athlete) => athlete.isPublic)
  const publicAthleteMap = new Map(publicAthletes.map((athlete) => [String(athlete.id), athlete]))
  const filteredSnapshots = (snapshots as RankingSnapshot[]).filter(
    (entry) => publicAthleteMap.has(String(entry.athleteId)) && Number(entry.totalPoints || 0) > 0
  )
  const tournamentAchievements = buildTournamentAchievements(publicAthletes)

  const senseiDanHolders = senseis
    .filter((sensei) => sensei.isActive && sensei.isPublic)
    .sort((a, b) => danSort(b.dan) - danSort(a.dan) || a.sortOrder - b.sortOrder)
    .map((sensei) => {
      const primaryAssignment = sensei.assignments?.[0]

      return {
        id: sensei.id,
        slug: sensei.slug,
        displayName: sensei.name,
        danLabel: sensei.dan,
        subtitle: primaryAssignment?.branchName
          ? `SKF ${primaryAssignment.branchName}`
          : sensei.title,
        imageUrl: sensei.imageUrl,
        profileHref: primaryAssignment
          ? `/classes/${primaryAssignment.citySlug}/${primaryAssignment.branchSlug}`
          : '/classes',
        assignments: sensei.assignments,
      }
    })

  const athleteDanHolders = publicAthletes
    .filter((athlete) => athlete.currentBelt?.startsWith('black'))
    .sort((a, b) => beltSort(b.currentBelt) - beltSort(a.currentBelt))

  const danHolders = senseiDanHolders.length > 0 ? senseiDanHolders : athleteDanHolders

  const top3 = [...filteredSnapshots]
    .sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0))
    .slice(0, 3)
    .map((snapshot) => ({
      ...snapshot,
      athlete: publicAthleteMap.get(String(snapshot.athleteId)),
    }))
    .filter((entry) => entry.athlete)

  const nationalGolds = tournamentAchievements.filter(
    (achievement) => achievement.level === 'national' && achievement.medal === 'gold'
  )
  const stateGolds = tournamentAchievements.filter(
    (achievement) => achievement.level === 'state' && achievement.medal === 'gold'
  )
  const latestSpotlight = getLatestSpotlight(tournamentAchievements)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Honours', '/honours')

  return (
    <div className="hon-page">
      <JsonLdScript data={breadcrumbJsonLd} />

      <div className="hon-orb hon-orb--1" />
      <div className="hon-orb hon-orb--2" />
      <div className="hon-orb hon-orb--3" />
      <div className="hon-watermark">栄誉</div>

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

      {danHolders.length > 0 && (
        <section className="hon-section hon-section--wide">
          <div className="hon-section__header">
            <span className="hon-section__tag">🥋 The Dan Board</span>
            <h2 className="hon-section__title">Black Belt Holders</h2>
            <p className="hon-section__sub">
              Athletes who have reached Dan grade appear here automatically.
            </p>
          </div>

          <DanCarousel danHolders={danHolders} />
        </section>
      )}

      {top3.length >= 3 && (
        <section className="hon-section">
          <div className="hon-section__header">
            <span className="hon-section__tag">🏆 Top Performers</span>
            <h2 className="hon-section__title">Overall Top 3</h2>
            <p className="hon-section__sub">
              The highest-ranked athletes across all current competitive divisions.
            </p>
          </div>

          <div className="hon-podium">
            <Link href={`/athlete/${top3[1].skfId}`} className="hon-pcard hon-pcard--2">
              <span className="hon-pcard__medal">🥈</span>
              <div className="hon-pcard__photo hon-pcard__photo--silver"><ProfileSvg size={56} /></div>
              <h3 className="hon-pcard__name">{top3[1].athleteName}</h3>
              <span className="hon-pcard__belt">{beltLabel(top3[1].currentBelt)}</span>
              <span className="hon-pcard__branch">{top3[1].branchName}</span>
              <div className="hon-pcard__pts">{Number(top3[1].totalPoints || 0).toFixed(0)}<small> pts</small></div>
            </Link>

            <Link href={`/athlete/${top3[0].skfId}`} className="hon-pcard hon-pcard--1">
              <span className="hon-pcard__medal">👑</span>
              <div className="hon-pcard__photo hon-pcard__photo--gold"><ProfileSvg size={64} /></div>
              <h3 className="hon-pcard__name">{top3[0].athleteName}</h3>
              <span className="hon-pcard__belt">{beltLabel(top3[0].currentBelt)}</span>
              <span className="hon-pcard__branch">{top3[0].branchName}</span>
              <div className="hon-pcard__pts">{Number(top3[0].totalPoints || 0).toFixed(0)}<small> pts</small></div>
            </Link>

            <Link href={`/athlete/${top3[2].skfId}`} className="hon-pcard hon-pcard--3">
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

      {nationalGolds.length > 0 && (
        <section className="hon-section">
          <div className="hon-section__header">
            <span className="hon-section__tag">🏅 National Level</span>
            <h2 className="hon-section__title">National Gold Medalists</h2>
          </div>
          <div className="hon-medal-grid">
            {nationalGolds.map((achievement) => (
              <Link
                key={`nat-${achievement.id}`}
                href={`/athlete/${achievement.skfId}`}
                className="hon-medal-card"
              >
                <div className="hon-medal-card__photo"><ProfileSvg size={36} /></div>
                <div className="hon-medal-card__info">
                  <h3 className="hon-medal-card__name">{achievement.athleteName}</h3>
                  <span className="hon-medal-card__detail">{achievement.belt} · {achievement.branchName}</span>
                  <span className="hon-medal-card__event">{medalEmoji(achievement.medal)} {achievement.tournament}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {stateGolds.length > 0 && (
        <section className="hon-section">
          <div className="hon-section__header">
            <span className="hon-section__tag">🏆 State Level</span>
            <h2 className="hon-section__title">State Gold Medalists</h2>
          </div>
          <div className="hon-medal-grid">
            {stateGolds.map((achievement) => (
              <Link
                key={`state-${achievement.id}`}
                href={`/athlete/${achievement.skfId}`}
                className="hon-medal-card"
              >
                <div className="hon-medal-card__photo"><ProfileSvg size={36} /></div>
                <div className="hon-medal-card__info">
                  <h3 className="hon-medal-card__name">{achievement.athleteName}</h3>
                  <span className="hon-medal-card__detail">{achievement.belt} · {achievement.branchName}</span>
                  <span className="hon-medal-card__event">{medalEmoji(achievement.medal)} {achievement.tournament}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {latestSpotlight.athletes.length > 0 && (
        <section className="hon-section hon-section--records">
          <div className="hon-section__header">
            <span className="hon-section__tag">🔥 Recent Spotlight</span>
            <h2 className="hon-section__title">{latestSpotlight.title}</h2>
            <p className="hon-section__sub">
              Gold medalists from the latest published tournament result set
              {latestSpotlight.date
                ? ` — ${new Date(latestSpotlight.date).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}`
                : ''}
            </p>
          </div>

          <div className="hon-spotlight-grid">
            {latestSpotlight.athletes.map((achievement) => (
              <AthleteCard
                key={`spot-${achievement.id}`}
                name={achievement.athleteName}
                belt={achievement.belt}
                branch={achievement.branchName}
                category={achievement.category?.replace(/-/g, ' ')}
                medal="gold"
                photoUrl={achievement.photoUrl}
                href={`/athlete/${achievement.skfId}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
