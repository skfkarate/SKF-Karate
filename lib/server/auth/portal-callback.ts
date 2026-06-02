const DEFAULT_PORTAL_CALLBACK = '/portal/dashboard'

export function sanitizePortalCallbackUrl(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return DEFAULT_PORTAL_CALLBACK

  const trimmed = raw.trim()
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_PORTAL_CALLBACK
  }

  try {
    const url = new URL(trimmed, 'https://www.skfkarate.org')
    const pathname = url.pathname || ''

    if (!pathname.startsWith('/portal') || pathname === '/portal/login' || pathname.startsWith('/portal/login/')) {
      return DEFAULT_PORTAL_CALLBACK
    }

    return `${pathname}${url.search}`
  } catch {
    return DEFAULT_PORTAL_CALLBACK
  }
}
