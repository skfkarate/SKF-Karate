/**
 * Detect PostgREST error codes.
 *
 * PGRST303 — "JWT issued at future"
 *   Caused by clock skew between the Supabase gateway that mints the
 *   service-role JWT at request time and the PostgREST server clock.
 *   Transient and self-healing; retry with backoff resolves the window.
 */

interface PgrstError {
  code?: string
  message?: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isPgrst303(error: unknown): boolean {
  if (!isObject(error)) return false
  const code = 'code' in error ? String((error as PgrstError).code ?? '') : ''
  return code === 'PGRST303'
}

export function isPgrstError(error: unknown): boolean {
  if (!isObject(error)) return false
  const code = 'code' in error ? String((error as PgrstError).code ?? '') : ''
  return code.startsWith('PGRST')
}
