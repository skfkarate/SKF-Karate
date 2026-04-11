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
  reason: keyof typeof POINT_RULES,
  metadata: Record<string, unknown> = {}
): Promise<{ newBalance: number; pointsAwarded: number }> {
    const points = POINT_RULES[reason]

    const { data: existing } = await supabaseAdmin
        .from('student_points')
        .select('*')
        .eq('skf_id', skfId)
        .single()

    const currentBalance = existing?.current_balance ?? 0
    const totalEarned = (existing?.total_earned ?? 0) + points
    const newBalance = currentBalance + points
    const newTier = TIERS.filter(t => totalEarned >= t.min).pop()!.name

    await supabaseAdmin.from('point_transactions').insert({
        skf_id: skfId,
        type: 'EARN',
        reason,
        points,
        balance_before: currentBalance,
        balance_after: newBalance,
        metadata
    })

    await supabaseAdmin.from('student_points').upsert({
        skf_id: skfId,
        current_balance: newBalance,
        total_earned: totalEarned,
        tier: newTier,
        updated_at: new Date().toISOString()
    }, { onConflict: 'skf_id' })

    return { newBalance, pointsAwarded: points }
}

export async function redeemPoints(
  skfId: string,
  points: number,
  reason: string,
  metadata: Record<string, unknown> = {}
): Promise<{ newBalance: number } | { error: string }> {
    const { data: existing } = await supabaseAdmin
        .from('student_points')
        .select('current_balance')
        .eq('skf_id', skfId)
        .single()

    const currentBalance = existing?.current_balance ?? 0
    if (currentBalance < points) return { error: 'Insufficient points' }

    const newBalance = currentBalance - points

    await supabaseAdmin.from('point_transactions').insert({
        skf_id: skfId,
        type: 'REDEEM',
        reason,
        points: -points,
        balance_before: currentBalance,
        balance_after: newBalance,
        metadata
    })

    // Supabase rpc increment needs to be defined, if not, we can just fetch and add
    // Prompt indicated `total_redeemed: supabaseAdmin.rpc('increment', { x: points })` but standard JS client does not evaluate it like that directly in update.
    // I will fetch existing and add.
    const { data: dbPoints } = await supabaseAdmin.from('student_points').select('total_redeemed').eq('skf_id', skfId).single()
    const currentRedeemed = dbPoints?.total_redeemed ?? 0

    await supabaseAdmin.from('student_points')
        .update({ current_balance: newBalance, total_redeemed: currentRedeemed + points })
        .eq('skf_id', skfId)

    return { newBalance }
}
