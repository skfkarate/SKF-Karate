export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: {
    page?: number
    total?: number
    cursor?: string
    requestId?: string
  }
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

type ResponseHeaders = HeadersInit | undefined

function mergeHeaders(...headersList: ResponseHeaders[]): Headers {
  const headers = new Headers()

  for (const init of headersList) {
    if (!init) continue
    const next = new Headers(init)
    next.forEach((value, key) => headers.set(key, value))
  }

  return headers
}

function json<T>(body: T, status: number, headers?: HeadersInit): Response {
  return Response.json(body, { status, headers })
}

export function ok<T>(
  data: T,
  options?: {
    meta?: ApiSuccess<T>['meta']
    headers?: HeadersInit
  }
): Response {
  return json<ApiSuccess<T>>(
    {
      success: true,
      data,
      ...(options?.meta ? { meta: options.meta } : {}),
    },
    200,
    options?.headers
  )
}

export function created<T>(data: T, headers?: HeadersInit): Response {
  return json<ApiSuccess<T>>({ success: true, data }, 201, headers)
}

export function noContent(headers?: HeadersInit): Response {
  return new Response(null, { status: 204, headers })
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  options?: {
    details?: unknown
    headers?: HeadersInit
  }
): Response {
  return json<ApiError>(
    {
      success: false,
      error: {
        code,
        message,
        ...(options?.details !== undefined ? { details: options.details } : {}),
      },
    },
    status,
    options?.headers
  )
}

export function withResponseHeaders(response: Response, ...headersList: ResponseHeaders[]): Response {
  const headers = mergeHeaders(response.headers, ...headersList)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
