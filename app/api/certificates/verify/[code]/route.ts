import { z } from 'zod'

import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import { withRoute } from '@/src/server/lib/route'
import { ok } from '@/src/server/lib/response'
import { NotFoundError } from '@/src/server/lib/errors'

const certificateVerifyParamsSchema = z.object({
  code: z.string().trim().min(6).max(120),
})

function statusFromCertificateError(message: string) {
  if (message === 'CERTIFICATE_REVOKED') return { code: 'CERTIFICATE_REVOKED', status: 410 }
  if (message === 'CERTIFICATE_NOT_FOUND' || message === 'ENROLLMENT_NOT_FOUND') {
    return { code: 'CERTIFICATE_NOT_FOUND', status: 404 }
  }
  if (message === 'CERTIFICATE_NOT_ISSUED' || message === 'CERTIFICATE_LOCKED' || message === 'NOT_COMPLETED') {
    return { code: 'CERTIFICATE_NOT_ISSUED', status: 404 }
  }
  return { code: 'CERTIFICATE_LOOKUP_FAILED', status: 500 }
}

export const GET = withRoute(
  {
    rateLimit: { tier: 'certificateLookup' },
    cacheControl: 'public, max-age=60',
  },
  async ({ params }) => {
    if (!isCertificatesEnabled()) {
      return disabledResponse('Certificates', 503)
    }

    const { code } = certificateVerifyParamsSchema.parse(params)

    try {
      const renderer = new CertificateRenderer()
      const data = await renderer.getDataByVerificationCode(code)

      return ok({ certificate: data })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'CERTIFICATE_LOOKUP_FAILED'
      const mapped = statusFromCertificateError(message)
      if (mapped.status === 404) throw new NotFoundError('Certificate')

      return Response.json({
        success: false,
        error: {
          code: mapped.code,
          message: mapped.code === 'CERTIFICATE_REVOKED'
            ? 'This certificate has been revoked.'
            : 'This certificate could not be verified.',
        },
      }, { status: mapped.status })
    }
  }
)
