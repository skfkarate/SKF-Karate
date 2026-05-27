import { getPortalSession } from '@/lib/server/auth/portal'
import { PortalAuthService } from '@/src/server/services/portal-auth.service'

export async function GET(request: Request) {
  try {
    const session = getPortalSession(request)
    if (!session || !session.skfId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const siblings = await PortalAuthService.getSiblings(session.skfId, session.parentPhone || null)

    return Response.json({
      success: true,
      data: siblings,
    })
  } catch {
    return Response.json({ success: false, error: 'Failed to fetch siblings' }, { status: 500 })
  }
}
