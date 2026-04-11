import { requireRole } from '@/lib/server/requireRole'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function GET() {
    try {
        const jwt = await requireRole(['student'])

        const { data: points } = await supabaseAdmin
            .from('student_points')
            .select('current_balance, tier, total_earned')
            .eq('skf_id', jwt.skfId!)
            .single()

        return Response.json({
            balance: points?.current_balance ?? 0,
            tier: points?.tier ?? 'white',
            totalEarned: points?.total_earned ?? 0
        })

    } catch (e: any) {
        if (e.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
        return Response.json({ error: 'Failed to fetch balance' }, { status: 500 })
    }
}
