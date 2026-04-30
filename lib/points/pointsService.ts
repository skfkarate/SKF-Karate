import { supabaseAdmin } from '@/lib/server/supabase'

export const POINT_RULES = {
  // Attendance (manual award only — not auto-triggered)
  ATTENDANCE: 10,
  PERFECT_MONTH: 100,
  // Achievements (these ARE auto-triggered)
  GRADING_PASS: 200,
  TOURNAMENT_GOLD: 500,
  TOURNAMENT_SILVER: 300,
  TOURNAMENT_BRONZE: 200,
  TOURNAMENT_PARTICIPATION: 100,
  // Engagement (auto-triggered)
  BIRTHDAY: 50,
  REFERRAL: 300,
  WATCH_VIDEO: 20,
  LOGIN_BONUS: 10,      // first login of the month only
  PRACTICE_LOG: 5,
  // One-time bonuses
  TESTIMONIAL: 50,
  PROFILE_COMPLETE: 25,
  ANNIVERSARY: 500
} as const

export type PointAwardReason = keyof typeof POINT_RULES | 'REDEMPTION_REVERSAL'

export const TIERS = [
  { name: 'white',  label: 'White Belt Member',  min: 0,     color: '#e0e0e0' },
  { name: 'yellow', label: 'Yellow Belt Member', min: 1000,  color: '#f1c40f' },
  { name: 'orange', label: 'Orange Belt Member', min: 2500,  color: '#e67e22' },
  { name: 'green',  label: 'Green Belt Member',  min: 5000,  color: '#27ae60' },
  { name: 'blue',   label: 'Blue Belt Member',   min: 10000, color: '#2980b9' },
  { name: 'brown',  label: 'Brown Belt Member',  min: 20000, color: '#8B4513' },
  { name: 'black',  label: 'Black Belt Member',  min: 40000, color: '#1a1a1a' }
]

export const REDEMPTION_OPTIONS = [
  { id: 'disc5',   label: '5% discount on shop order',   cost: 100,  type: 'discount',   value: 5   },
  { id: 'disc10',  label: '10% discount on shop order',  cost: 200,  type: 'discount',   value: 10  },
  { id: 'item500', label: 'Free item (up to ₹500 value)', cost: 500,  type: 'free_item',  value: 500 },
  { id: 'belt',    label: 'Free standard belt',          cost: 800,  type: 'free_item',  value: 0   },
  { id: 'badge',   label: 'Champion badge on profile',   cost: 1000, type: 'badge',      value: 0   },
  { id: 'fee200',  label: '₹200 off next month fee',     cost: 2000, type: 'fee_credit',  value: 200 }
]

export async function awardPoints(
  skfId: string,
  reason: PointAwardReason,
  metadata: Record<string, unknown> = {},
  pointsOverride?: number
): Promise<{ newBalance: number; pointsAwarded: number }> {
  const points =
    pointsOverride ??
    (reason in POINT_RULES ? POINT_RULES[reason as keyof typeof POINT_RULES] : 0)

  if (!skfId || points <= 0) {
    throw new Error('Invalid points award request')
  }

  const { data, error } = await supabaseAdmin.rpc('award_points', {
    p_skf_id: skfId,
    p_reason: reason,
    p_points: points,
    p_metadata: metadata,
  })

  if (error) throw error

  const result = data as { new_balance?: number; points_awarded?: number } | null
  return {
    newBalance: Number(result?.new_balance ?? 0),
    pointsAwarded: Number(result?.points_awarded ?? points),
  }
}

export async function redeemPoints(
  skfId: string,
  points: number,
  reason: string,
  metadata: Record<string, unknown> = {}
): Promise<{ newBalance: number } | { error: string }> {
  if (!skfId || points <= 0) {
    return { error: 'Invalid points redemption request' }
  }

  const { data, error } = await supabaseAdmin.rpc('redeem_points', {
    p_skf_id: skfId,
    p_reason: reason,
    p_points: points,
    p_metadata: metadata,
  })

  if (error) {
    if (String(error.message || '').includes('INSUFFICIENT_POINTS')) {
      return { error: 'Insufficient points' }
    }
    throw error
  }

  const result = data as { new_balance?: number } | null
  return { newBalance: Number(result?.new_balance ?? 0) }
}

export async function restoreRedeemedPoints(
  skfId: string,
  points: number,
  metadata: Record<string, unknown> = {}
): Promise<{ newBalance: number; pointsAwarded: number }> {
  return awardPoints(skfId, 'REDEMPTION_REVERSAL', metadata, points)
}
