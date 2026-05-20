import { NextResponse } from 'next/server'
import { z } from 'zod'

import { extractClientIp } from '@/lib/server/site-analytics'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

const clientErrorSchema = z.object({
  source: z.enum(['error_boundary', 'window_error', 'unhandled_rejection', 'client_fetch_error']).default('window_error'),
  name: z.string().trim().max(120).optional(),
  message: z.string().trim().min(1).max(1000),
  stack: z.string().trim().max(4000).optional(),
  digest: z.string().trim().max(200).optional(),
  path: z.string().trim().max(500).optional(),
})

export const POST = withRoute(
  {
    bodySchema: clientErrorSchema,
    rateLimit: { tier: 'public', keySuffix: 'client-error' },
    maxBodyBytes: 8_000,
  },
  async ({ request, body, requestId }) => {
    logger.error('client.runtime_error', {
      requestId,
      source: body.source,
      path: body.path || '',
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request.headers),
      error: {
        name: body.name || 'ClientError',
        message: body.message,
        stack: body.stack || undefined,
        digest: body.digest || undefined,
      },
    })

    return NextResponse.json({ success: true })
  }
)
