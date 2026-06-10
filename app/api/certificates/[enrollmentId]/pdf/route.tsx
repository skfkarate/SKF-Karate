import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { CertificatePDF } from '@/lib/certificates/CertificatePDF'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import { getPortalSession } from '@/lib/server/auth/portal'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import React from 'react'
import { certificateDataQuerySchema } from '@/src/server/api/validators/certificates.validator'
import { withRoute } from '@/src/server/lib/route'

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

    const stream = await renderToStream(<CertificatePDF data={data} />)
    
    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.studentName.replace(/\s+/g, '_')}_${data.programName}_Certificate.pdf"`
      }
    })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      const status = message === 'FORBIDDEN' ? 403 : message === 'ENROLLMENT_NOT_FOUND' ? 404 : 500
      return new Response(message, { status })
    }
  }
)
