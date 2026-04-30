import { supabaseAdmin } from '@/lib/server/supabase'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { normaliseRegistrationNumber } from '@/lib/utils/registration'
import { withRoute } from '@/src/server/lib/route'

type LeaderboardAthlete = {
  firstName?: string | null
  lastName?: string | null
  currentBelt?: string | null
}

function formatLeaderboardName(athlete?: LeaderboardAthlete | null) {
  const first = String(athlete?.firstName || '').trim()
  const lastInitial = String(athlete?.lastName || '').trim().charAt(0)
  const combined = [first, lastInitial ? `${lastInitial}.` : ''].filter(Boolean).join(' ').trim()
  return combined || 'Unknown Athlete'
}

function formatLeaderboardBelt(athlete?: LeaderboardAthlete | null) {
  const belt = String(athlete?.currentBelt || 'white').trim().toLowerCase()
  if (!belt) return 'white'
  if (belt.startsWith('black')) return 'black'
  return belt
}

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, max-age=60',
  },
  async () => {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: transactions, error } = await supabaseAdmin
      .from('point_transactions')
      .select('skf_id, points')
      .eq('type', 'EARN')
      .gte('created_at', startOfMonth.toISOString())

    if (error) throw error
    if (!transactions) return Response.json({ leaderboard: [] })

    const sums: Record<string, number> = {}
    for (const transaction of transactions) {
      const key = normaliseRegistrationNumber(String(transaction.skf_id || ''))
      if (!key) continue
      sums[key] = (sums[key] || 0) + Number(transaction.points || 0)
    }

    const sorted = Object.entries(sums)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const athletes = await getAllAthletesLive()
    const athleteMap = new Map(
      athletes.map((athlete) => [normaliseRegistrationNumber(athlete.registrationNumber), athlete])
    )

    const leaderboard = sorted.map(([registrationNumber, points], index) => {
      const athlete = athleteMap.get(registrationNumber)

      return {
        rank: index + 1,
        name: formatLeaderboardName(athlete),
        belt: formatLeaderboardBelt(athlete),
        points,
      }
    })

    return Response.json({ leaderboard })
  }
)
