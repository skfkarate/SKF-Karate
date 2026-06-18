import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { supabaseAdmin } from '@/lib/server/supabase'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    const skfId = String(portalSession!.skfId || '').trim().toUpperCase()

    const { data, error } = await supabaseAdmin
      .from('fee_credits')
      .select('id, credit_code, amount, reason, description, status, earned_at, used_month, used_year, used_at')
      .eq('skf_id', skfId)
      .order('created_at', { ascending: false })

    if (error) {
      return ok({ credits: [], totalAvailable: 0, totalUsed: 0 })
    }

    const credits = (data || []).map((credit) => ({
      id: credit.id,
      creditCode: credit.credit_code,
      amount: Number(credit.amount || 0),
      reason: credit.reason || '',
      description: credit.description || '',
      status: credit.status,
      earnedAt: credit.earned_at,
      usedMonth: credit.used_month || null,
      usedYear: credit.used_year || null,
      usedAt: credit.used_at || null,
    }))

    const availableCredits = credits.filter((c) => c.status === 'available')
    const usedCredits = credits.filter((c) => c.status === 'used')

    return ok({
      credits,
      availableCredits,
      totalAvailable: availableCredits.reduce((sum, c) => sum + c.amount, 0),
      totalUsed: usedCredits.reduce((sum, c) => sum + c.amount, 0),
    })
  }
)
