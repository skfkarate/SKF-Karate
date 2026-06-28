import QRCode from 'qrcode'
import { z } from 'zod'

import { getCertificateQrPayload } from '@/lib/certificates/CertificateWorkflow'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

const qrParamsSchema = z.object({
  code: z.string().trim().min(6).max(120),
})

const qrQuerySchema = z.object({
  size: z.coerce.number().int().min(256).max(2400).default(1600),
  format: z.enum(['png', 'svg']).default('png'),
})

function safeFileSegment(value: string) {
  return value.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '')
}

export const GET = withRoute(
  {
    rateLimit: { tier: 'certificateLookup' },
    cacheControl: 'private, max-age=300',
  },
  async ({ request, params }) => {
    if (!isCertificatesEnabled()) {
      return disabledResponse('Certificates', 503)
    }

    const { code } = qrParamsSchema.parse(params)
    const query = qrQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()))
    const payload = await getCertificateQrPayload(code)

    if (!payload) throw new NotFoundError('Certificate')

    const fileName = `${safeFileSegment(payload.certificateNumber)}_qr.${query.format}`

    if (query.format === 'svg') {
      const svg = await QRCode.toString(payload.verifyUrl, {
        type: 'svg',
        margin: 2,
        width: query.size,
        errorCorrectionLevel: 'H',
      })

      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }

    const png = await QRCode.toBuffer(payload.verifyUrl, {
      type: 'png',
      margin: 2,
      width: query.size,
      errorCorrectionLevel: 'H',
    })

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }
)
