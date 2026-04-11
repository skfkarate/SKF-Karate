import { requireRole } from '@/lib/server/requireRole'
import { redeemPoints } from '@/lib/points/pointsService'

export async function POST(request: Request) {
    try {
        const jwt = await requireRole(['student'])
        const { points, orderId, reason } = await request.json()

        if (!points || points <= 0 || !reason) {
            return Response.json({ error: 'Invalid redemption parameters' }, { status: 400 })
        }

        const result = await redeemPoints(jwt.skfId!, points, reason, { orderId })

        if ('error' in result) {
            return Response.json({ error: result.error }, { status: 400 })
        }

        return Response.json({ success: true, newBalance: result.newBalance })

    } catch (e: any) {
        if (e.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
        console.error('Redeem points error:', e)
        return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
