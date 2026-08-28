/**
 * Detect PostgREST error codes.
 *
 * PGRST303 — "JWT issued at future"
 *   Caused by clock skew between the Supabase service-role key's `iat`
 *   claim and the PostgREST server clock. Transient and self-healing.
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
