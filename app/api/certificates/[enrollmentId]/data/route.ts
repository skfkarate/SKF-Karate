import { NextResponse } from 'next/server'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import { getPortalSession } from '@/lib/server/auth/portal'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { certificateDataQuerySchema } from '@/src/server/api/validators/certificates.validator'
import { withRoute } from '@/src/server/lib/route'
import { logger } from '@/src/server/lib/logger'

export const GET = withRoute(
  {
    querySchema: certificateDataQuerySchema,
    rateLimit: { tier: 'certificateLookup' },
  },
  async ({ request, params }) => {
    if (!isCertificatesEnabled()) {
      return disabledResponse('Certificates', 503)
    }

    try {
    const portalSession = getPortalSession(request)

    if (!portalSession?.skfId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const renderer = new CertificateRenderer()
    const data = await renderer.getData(params.enrollmentId, portalSession.skfId, false)
    
    return NextResponse.json({ data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load certificate data'
      if (message !== 'FORBIDDEN' && message !== 'ENROLLMENT_NOT_FOUND') {
        logger.warn('certificate_data.unhandled_error', { error })
      }
      const status = message === 'FORBIDDEN' ? 403 : message === 'ENROLLMENT_NOT_FOUND' ? 404 : 500
      const clientMessage = status === 403 ? 'Forbidden' : status === 404 ? 'Not found' : 'Unable to load certificate data'
      return NextResponse.json({ error: clientMessage }, { status })
    }
  }
)
