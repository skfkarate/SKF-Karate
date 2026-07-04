import QRCode from 'qrcode'
import sharp from 'sharp'
import { z } from 'zod'

import { getCertificateQrPayload } from '@/lib/certificates/CertificateWorkflow'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

const qrParamsSchema = z.object({
  code: z.string().trim().min(6).max(120),
})

const qrQuerySchema = z.object({
  size: z.coerce.number().int().min(256).max(2400).default(1600),
  format: z.enum(['png', 'svg']).default('png'),
  label: z.string().trim().optional(),
})

function safeFileSegment(value: string) {
  return value.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '')
}

function wantsLabel(value: string | undefined) {
  return ['1', 'true', 'yes', 'named', 'label'].includes(String(value || '').trim().toLowerCase())
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fitText(value: string, max = 34) {
  const text = value.trim()
  return text.length > max ? `${text.slice(0, max - 1)}...` : text
}

async function studentNameForSkfId(skfId: string) {
  const athlete = await getAthleteBySkfIdLive(skfId)
  const name = athlete ? [athlete.firstName, athlete.lastName].filter(Boolean).join(' ').trim() : ''
  return name || skfId || 'SKF Athlete'
}

async function renderNamedQrPng(input: {
  qrBuffer: Buffer
  size: number
  studentName: string
  skfId: string
  certificateNumber: string
}) {
  const padding = Math.max(96, Math.round(input.size * 0.075))
  const headerHeight = Math.max(260, Math.round(input.size * 0.18))
  const footerHeight = Math.max(300, Math.round(input.size * 0.2))
  const width = input.size + padding * 2
  const height = headerHeight + input.size + footerHeight
  const center = width / 2
  const titleSize = Math.max(36, Math.round(input.size * 0.035))
  const nameSize = Math.max(52, Math.round(input.size * 0.055))
  const metaSize = Math.max(36, Math.round(input.size * 0.034))
  const noteSize = Math.max(28, Math.round(input.size * 0.026))

  const labelSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="${center}" y="${Math.round(padding * 0.75)}" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="800" fill="#111111">
        SKF KARATE CERTIFICATE
      </text>
      <text x="${center}" y="${Math.round(headerHeight - padding * 0.52)}" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="${nameSize}" font-weight="800" fill="#111111">
        ${escapeSvgText(fitText(input.studentName, 36))}
      </text>
      <text x="${center}" y="${headerHeight + input.size + Math.round(padding * 0.85)}" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="${metaSize}" font-weight="700" fill="#111111">
        ${escapeSvgText(input.skfId)}
      </text>
      <text x="${center}" y="${headerHeight + input.size + Math.round(padding * 1.42)}" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="${metaSize}" font-weight="700" fill="#111111">
        ${escapeSvgText(input.certificateNumber)}
      </text>
      <text x="${center}" y="${headerHeight + input.size + Math.round(padding * 2.12)}" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="${noteSize}" font-weight="500" fill="#555555">
        Scan to verify on the official SKF Karate registry
      </text>
    </svg>
  `)

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: '#ffffff',
    },
  })
    .composite([
      { input: labelSvg, left: 0, top: 0 },
      { input: input.qrBuffer, left: padding, top: headerHeight },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()
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
    const named = wantsLabel(query.label)

    if (query.format === 'svg' && !named) {
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

    const qrPng = await QRCode.toBuffer(payload.verifyUrl, {
      type: 'png',
      margin: 2,
      width: query.size,
      errorCorrectionLevel: 'H',
    })
    const png = named
      ? await renderNamedQrPng({
          qrBuffer: qrPng,
          size: query.size,
          studentName: await studentNameForSkfId(payload.skfId),
          skfId: payload.skfId,
          certificateNumber: payload.certificateNumber,
        })
      : qrPng

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${named ? safeFileSegment(`${payload.certificateNumber}_${payload.skfId}_named_qr.png`) : fileName}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }
)
