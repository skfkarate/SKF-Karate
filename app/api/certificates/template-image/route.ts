import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { ValidationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'
import { z } from 'zod'

const MAX_TEMPLATE_IMAGE_BYTES = 5 * 1024 * 1024

const templateImageQuerySchema = z.object({
  url: z.string().url(),
})

function allowedTemplateImageHosts() {
  const hosts = new Set<string>()

  for (const value of [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN,
  ]) {
    if (!value) continue
    try {
      hosts.add(new URL(value).hostname)
    } catch {
      // Ignore invalid optional configuration and keep the allow-list strict.
    }
  }

  return hosts
}

function validateTemplateImageUrl(rawUrl: string) {
  const parsed = new URL(rawUrl)
  const allowedHosts = allowedTemplateImageHosts()

  if (parsed.protocol !== 'https:') {
    throw new ValidationError({ url: ['Only HTTPS template image URLs are allowed.'] })
  }

  if (!allowedHosts.has(parsed.hostname)) {
    throw new ValidationError({ url: ['Template image host is not allowed.'] })
  }

  return parsed.toString()
}

async function readLimitedImage(response: Response) {
  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > MAX_TEMPLATE_IMAGE_BYTES) {
    throw new ValidationError({ url: ['Template image is larger than 5MB.'] })
  }

  if (!response.body) {
    return response.arrayBuffer()
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_TEMPLATE_IMAGE_BYTES) {
      await reader.cancel()
      throw new ValidationError({ url: ['Template image is larger than 5MB.'] })
    }
    chunks.push(value)
  }

  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }

  return output.buffer
}

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    querySchema: templateImageQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, max-age=3600',
  },
  async ({ query }) => {
    if (!isCertificatesEnabled()) {
      return disabledResponse('Certificates', 503)
    }

    const url = validateTemplateImageUrl(query.url)
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })

    if (!response.ok) {
      return new Response('Failed to load template image', { status: 502 })
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    if (!contentType.startsWith('image/')) {
      throw new ValidationError({ url: ['Template URL must return an image.'] })
    }

    const body = await readLimitedImage(response)
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.skfkarate.org'

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': allowedOrigin,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  }
)
