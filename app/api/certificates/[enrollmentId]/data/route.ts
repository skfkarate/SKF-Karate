import { NextResponse } from 'next/server'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import { getPortalSession } from '@/lib/server/auth/portal'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { certificateDataQuerySchema } from '@/src/server/api/validators/certificates.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    querySchema: certificateDataQuerySchema,
    rateLimit: { tier: 'certificateLookup' },
  },
  async ({ request, params, query }) => {
    if (!isCertificatesEnabled()) {
      return disabledResponse('Certificates', 503)
    }

    try {
    const adminSession = await getAuthorizedApiSession('admin')
    const portalSession = getPortalSession(request)
    const isAdmin = adminSession?.user?.role === 'admin'
    const skfId = isAdmin ? query.skfId || '' : portalSession?.skfId || ''

    if (!isAdmin && !portalSession?.skfId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const renderer = new CertificateRenderer()
    const data = await renderer.getData(params.enrollmentId, skfId, isAdmin)
    
    return NextResponse.json({ data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load certificate data'
      const status = message === 'FORBIDDEN' ? 403 : message === 'ENROLLMENT_NOT_FOUND' ? 404 : 500
      return NextResponse.json({ error: message }, { status })
    }
  }
)
