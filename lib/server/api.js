import { NextResponse } from 'next/server'
import { checkRateLimit } from './rate-limit'

export class ApiError extends Error {
  constructor(status, message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = options.details
    this.headers = options.headers || {}
  }
}

export async function readJsonBody(request) {
  try {
    return await request.json()
  } catch {
    throw new ApiError(400, 'Invalid request format.')
  }
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function enforceRateLimit(request, options) {
  const result = checkRateLimit(options.name, getClientIp(request), {
    limit: options.limit,
    windowMs: options.windowMs,
  })

  if (!result.allowed) {
    throw new ApiError(429, 'Too many requests. Please try again shortly.', {
      headers: {
        'Retry-After': String(result.retryAfter),
      },
    })
  }

  return result
}

export function createErrorResponse(error, fallbackMessage = 'Something went wrong.') {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      {
        status: error.status,
        headers: error.headers,
      }
    )
  }

  console.error(error)
  return NextResponse.json({ error: fallbackMessage }, { status: 500 })
}
