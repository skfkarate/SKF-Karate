export class AppError extends Error {
  readonly code: string
  readonly statusCode: number
  readonly details?: unknown
  readonly expose: boolean

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: unknown,
    expose = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.expose = expose
  }
}

export class ValidationError extends AppError {
  constructor(details?: unknown, message = 'Invalid input data') {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT', message, 409, details)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  readonly headers: Record<string, string>

  constructor(headers: Record<string, string>, message = 'Too many requests. Please slow down.') {
    super('RATE_LIMITED', message, 429)
    this.name = 'RateLimitError'
    this.headers = headers
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', details?: unknown) {
    super('EXTERNAL_SERVICE_ERROR', message, 503, details)
    this.name = 'ExternalServiceError'
  }
}
