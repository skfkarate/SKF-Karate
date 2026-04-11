import { requireRole } from '@/lib/server/requireRole'
import { awardPoints } from '@/lib/points/pointsService'
import { getStudentBySkfId } from '@/lib/server/sheets'

export async function POST(request: Request) {
    try {
        await requireRole(['admin', 'branch_admin', 'super_admin'] as any)
        const { skfId, reason, note } = await request.json()

        if (!skfId || !reason) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const student = await getStudentBySkfId(skfId.toUpperCase())
        if (!student || student.status !== 'Active') {
            return Response.json({ error: 'Student not found or inactive' }, { status: 404 })
        }

        const { newBalance, pointsAwarded } = await awardPoints(student.skfId, reason, { manual: true, note })

        return Response.json({ success: true, newBalance, pointsAwarded })

    } catch (e: any) {
        if (e.message === 'UNAUTHORIZED' || e.message === 'FORBIDDEN') {
            return Response.json({ error: e.message }, { status: e.message === 'UNAUTHORIZED' ? 401 : 403 })
        }
        console.error('Award points error:', e)
        return Response.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
