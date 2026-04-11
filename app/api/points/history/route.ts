import { requireRole } from '@/lib/server/requireRole'
import { supabaseAdmin } from '@/lib/server/supabase'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const jwt = await requireRole(['student'])

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '20', 10)
        
        const offset = (page - 1) * limit

        const { data: transactions, count } = await supabaseAdmin
            .from('point_transactions')
            .select('*', { count: 'exact' })
            .eq('skf_id', jwt.skfId!)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        return Response.json({
            transactions: transactions || [],
            total: count || 0,
            page,
            limit
        })

    } catch (e: any) {
        if (e.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
        return Response.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
