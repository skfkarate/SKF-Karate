import { ZodError, type ZodType } from 'zod'

import { getPortalSession } from '@/lib/server/auth/portal'
import {
  buildCanonicalPortalSession,
  isEligiblePortalAthlete,
} from '@/lib/server/auth/portal-athlete'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import type { JWTPayload, UserRole } from '@/types'
import { AppError, AuthenticationError, AuthorizationError, RateLimitError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { captureError } from '@/src/server/lib/monitoring'
import { errorResponse, withResponseHeaders } from '@/src/server/lib/response'
import { applyRateLimit } from '@/src/server/lib/rate-limit'

type RequestLike = Request & { nextUrl?: URL }

type RouteOptions<TBody, TQuery> = {
  auth?:
    | { type: 'portal'; roles?: UserRole[] }
  bodySchema?: ZodType<TBody>
  querySchema?: ZodType<TQuery>
  rateLimit?: {
    tier: Parameters<typeof applyRateLimit>[1]
    keySuffix?: string
  }
  cacheControl?: string
  maxBodyBytes?: number
}

type RouteContext<TBody, TQuery> = {
  request: RequestLike
  params: Record<string, string>
  requestId: string
  body: TBody
  query: TQuery
  portalSession: JWTPayload | null
}

function getSearchParams(request: RequestLike) {
  if (request.nextUrl) {
    return request.nextUrl.searchParams
  }

  return new URL(request.url).searchParams
}

function parseQuery<TQuery>(request: RequestLike, schema?: ZodType<TQuery>): TQuery {
  if (!schema) {
    return {} as TQuery
  }

  const raw = Object.fromEntries(getSearchParams(request).entries())
  return schema.parse(raw)
}

function assertBodySize(request: RequestLike, maxBodyBytes?: number) {
  if (!maxBodyBytes) return

  const contentLength = request.headers.get('content-length')
  if (!contentLength) return

  const parsedLength = Number(contentLength)
  if (Number.isFinite(parsedLength) && parsedLength > maxBodyBytes) {
    throw new ValidationError({
      body: [`Request body exceeds ${maxBodyBytes} bytes.`],
    })
  }
}

async function parseBody<TBody>(
  request: RequestLike,
  schema?: ZodType<TBody>,
  maxBodyBytes?: number
): Promise<TBody> {
  if (!schema) {
    return {} as TBody
  }

  assertBodySize(request, maxBodyBytes)

  let raw: unknown
  let text: string

  try {
    text = await request.text()
  } catch {
    throw new ValidationError({ body: ['Invalid request body.'] })
  }

  const byteLength = new TextEncoder().encode(text).byteLength
  if (maxBodyBytes && byteLength > maxBodyBytes) {
    throw new ValidationError({
      body: [`Request body exceeds ${maxBodyBytes} bytes.`],
    })
  }

  try {
    raw = JSON.parse(text)
  } catch {
    throw new ValidationError({ body: ['Invalid JSON body.'] })
  }

  return schema.parse(raw)
}

async function resolveAuth(
  request: RequestLike,
  auth: RouteOptions<unknown, unknown>['auth']
): Promise<Pick<RouteContext<unknown, unknown>, 'portalSession'>> {
  if (!auth) {
    return { portalSession: null }
  }

  const portalSession = getPortalSession(request)
  if (!portalSession?.skfId) {
    throw new AuthenticationError()
  }

  const athlete = await getAthleteBySkfIdLive(portalSession.skfId)
  if (!isEligiblePortalAthlete(athlete)) {
    throw new AuthenticationError()
  }

  if (auth.roles && !auth.roles.includes(portalSession.role)) {
    throw new AuthorizationError()
  }

  return { portalSession: buildCanonicalPortalSession(portalSession, athlete!) }
}

function buildErrorResponse(error: unknown, requestId: string): Response {
  if (error instanceof RateLimitError) {
    return errorResponse(error.code, error.message, error.statusCode, {
      headers: error.headers,
    })
  }

  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, error.statusCode, {
      details: error.expose ? error.details : undefined,
    })
  }

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    typeof error.status === 'number' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return errorResponse('REQUEST_ERROR', error.message, error.status)
  }

  if (error instanceof ZodError) {
    return errorResponse('VALIDATION_ERROR', 'Invalid input data', 400, {
      details: error.flatten().fieldErrors,
    })
  }

  captureError(error, { requestId })
  return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred.', 500, {
    details: { requestId },
  })
}

function isNextPrerenderBailout(error: unknown) {
  if (!(error instanceof Error)) return false

  const digest = (error as Error & { digest?: unknown }).digest
  return (
    digest === 'NEXT_PRERENDER_INTERRUPTED' ||
    error.message.includes('needs to bail out of prerendering')
  )
}

export function withRoute<TBody = Record<string, never>, TQuery = Record<string, never>>(
  options: RouteOptions<TBody, TQuery>,
  handler: (context: RouteContext<TBody, TQuery>) => Promise<Response>
) {
  return async (
    request: RequestLike,
    context?: { params?: Promise<Record<string, string>> | Record<string, string> }
  ) => {
    const requestId = crypto.randomUUID()
    const startedAt = Date.now()
    let rateLimitHeaders: HeadersInit | undefined

    try {
      assertBodySize(request, options.maxBodyBytes)

      if (options.rateLimit) {
        const rateLimit = await applyRateLimit(
          request,
          options.rateLimit.tier,
          options.rateLimit.keySuffix
        )

        rateLimitHeaders = rateLimit.headers

        if (!rateLimit.allowed) {
          throw new RateLimitError(rateLimit.headers)
        }
      }

      const params = context?.params ? await Promise.resolve(context.params) : {}
      const authResult = await resolveAuth(request, options.auth)
      const query = parseQuery(request, options.querySchema)
      const body = await parseBody(request, options.bodySchema, options.maxBodyBytes)

      const response = await handler({
        request,
        params,
        requestId,
        body,
        query,
        ...authResult,
      })

      const finalResponse = withResponseHeaders(
        response,
        { 'X-Request-ID': requestId },
        rateLimitHeaders,
        options.cacheControl ? { 'Cache-Control': options.cacheControl } : undefined
      )

      logger.info('api.request', {
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        status: finalResponse.status,
        durationMs: Date.now() - startedAt,
      })

      return finalResponse
    } catch (error) {
      if (isNextPrerenderBailout(error)) {
        throw error
      }

      const response = buildErrorResponse(error, requestId)
      const status = response.status
      const isServerError = status >= 500

      logger[isServerError ? 'error' : 'warn']('api.request_failed', {
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        status,
        durationMs: Date.now() - startedAt,
        error,
        systemAlert: isServerError,
      })

      return withResponseHeaders(response, { 'X-Request-ID': requestId }, rateLimitHeaders)
    }
  }
}
