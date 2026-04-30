import { supabaseAdmin } from '@/lib/server/supabase'
import { pointHistoryQuerySchema } from '@/src/server/api/validators/points.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    querySchema: pointHistoryQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession, query }) => {
    const offset = (query.page - 1) * query.limit

    const { data: transactions, count, error } = await supabaseAdmin
      .from('point_transactions')
      .select('*', { count: 'exact' })
      .eq('skf_id', portalSession!.skfId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + query.limit - 1)

    if (error) throw error

    return Response.json({
      transactions: transactions || [],
      total: count || 0,
      page: query.page,
      limit: query.limit,
    })
  }
)
