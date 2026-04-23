import { supabaseAdmin } from '@/lib/server/supabase'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { normaliseRegistrationNumber } from '@/lib/utils/registration'

function formatLeaderboardName(athlete?: Record<string, any> | null) {
  const first = String(athlete?.firstName || '').trim()
  const lastInitial = String(athlete?.lastName || '').trim().charAt(0)
  const combined = [first, lastInitial ? `${lastInitial}.` : ''].filter(Boolean).join(' ').trim()
  return combined || 'Unknown Athlete'
}

function formatLeaderboardBelt(athlete?: Record<string, any> | null) {
  const belt = String(athlete?.currentBelt || 'white').trim().toLowerCase()
  if (!belt) return 'white'
  if (belt.startsWith('black')) return 'black'
  return belt
}

export async function GET() {
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: transactions } = await supabaseAdmin
      .from('point_transactions')
      .select('skf_id, points')
      .eq('type', 'EARN')
      .gte('created_at', startOfMonth.toISOString())

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
  } catch (error: any) {
    console.error('Leaderboard error:', error)
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
