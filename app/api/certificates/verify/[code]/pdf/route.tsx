import React from 'react'
import { z } from 'zod'
import { renderToStream } from '@react-pdf/renderer'

import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { CertificatePDF } from '@/lib/certificates/CertificatePDF'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import { withRoute } from '@/src/server/lib/route'

const certificateVerifyParamsSchema = z.object({
  code: z.string().trim().min(6).max(120),
})

function safeFileSegment(value: string) {
  return value.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '')
}

export const GET = withRoute(
  {
    rateLimit: { tier: 'certificateLookup' },
    cacheControl: 'private, no-store',
  },
  async ({ params }) => {
    if (!isCertificatesEnabled()) {
      return disabledResponse('Certificates', 503)
    }

    const { code } = certificateVerifyParamsSchema.parse(params)
    const renderer = new CertificateRenderer()
    const data = await renderer.getDataByVerificationCode(code)
    const stream = await renderToStream(<CertificatePDF data={data} />)

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFileSegment(data.certificateNumber)}_${safeFileSegment(data.studentName)}.pdf"`,
      },
    })
  }
)
