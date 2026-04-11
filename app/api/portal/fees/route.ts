import { requireRole } from '@/lib/server/requireRole'
import { getFeesBySkfId } from '@/lib/server/sheets'

export async function GET() {
  try {
    const jwt = await requireRole(['student', 'branch_admin', 'super_admin'])
    const fees = await getFeesBySkfId(jwt.skfId!)
    return Response.json({ fees })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return Response.json({ error: 'Failed to fetch fees' }, { status: 500 })
  }
}
