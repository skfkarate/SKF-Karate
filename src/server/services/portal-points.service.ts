import { supabaseAdmin } from '@/lib/server/supabase'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { normaliseSkfId } from '@/lib/utils/registration'

type LeaderboardAthlete = {
  firstName?: string | null
  lastName?: string | null
  currentBelt?: string | null
  skfId?: string | null
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

export async function getPortalPointsBalance(skfId: string) {
  const { data: points, error } = await supabaseAdmin
    .from('student_points')
    .select('current_balance, tier, total_earned')
    .eq('skf_id', skfId)
    .maybeSingle()

  if (error) throw error

  return {
    balance: points?.current_balance ?? 0,
    tier: points?.tier ?? 'white',
    totalEarned: points?.total_earned ?? 0,
  }
}

export async function getMonthlyPointsLeaderboard(limit = 10) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: transactions, error } = await supabaseAdmin
    .from('point_transactions')
    .select('skf_id, points')
    .eq('type', 'EARN')
    .gte('created_at', startOfMonth.toISOString())

  if (error) throw error
  if (!transactions?.length) return []

  const sums: Record<string, number> = {}
  for (const transaction of transactions) {
    const key = normaliseSkfId(String(transaction.skf_id || ''))
    if (!key) continue
    sums[key] = (sums[key] || 0) + Number(transaction.points || 0)
  }

  const sorted = Object.entries(sums)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  const athletes = await getAllAthletesLive() as LeaderboardAthlete[]
  const athleteMap = new Map(
    athletes.map((athlete) => [normaliseSkfId(athlete.skfId), athlete])
  )

  return sorted.map(([skfId, points], index) => {
    const athlete = athleteMap.get(skfId)

    return {
      rank: index + 1,
      name: formatLeaderboardName(athlete),
      belt: formatLeaderboardBelt(athlete),
      points,
    }
  })
}

export async function getPortalPointsHistory(skfId: string, page = 1, limit = 10) {
  const safePage = Math.max(1, Number(page) || 1)
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10))
  const offset = (safePage - 1) * safeLimit

  const { data: transactions, count, error } = await supabaseAdmin
    .from('point_transactions')
    .select('*', { count: 'exact' })
    .eq('skf_id', skfId)
    .order('created_at', { ascending: false })
    .range(offset, offset + safeLimit - 1)

  if (error) throw error

  const total = count || 0

  return {
    transactions: transactions || [],
    total,
    page: safePage,
    limit: safeLimit,
    hasMore: offset + safeLimit < total,
  }
}
