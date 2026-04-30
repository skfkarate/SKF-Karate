import { supabaseAdmin } from '@/lib/server/supabase'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    const { data: points, error } = await supabaseAdmin
      .from('student_points')
      .select('current_balance, tier, total_earned')
      .eq('skf_id', portalSession!.skfId!)
      .maybeSingle()

    if (error) throw error

    return Response.json({
      balance: points?.current_balance ?? 0,
      tier: points?.tier ?? 'white',
      totalEarned: points?.total_earned ?? 0,
    })
  }
)
