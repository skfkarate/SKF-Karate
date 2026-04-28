import { mediaManifest, type MediaManifestKey } from '@/data/media/manifest'

type ResolveMediaUrlOptions = {
  fallback?: string
  allowDriveUrl?: boolean
}

const DRIVE_HOSTS = new Set(['drive.google.com', 'docs.google.com'])
const ABSOLUTE_URL_RE = /^https?:\/\//i
const ROOT_PATH_RE = /^\//

function normalizeOrigin(originLike: string | undefined) {
  const raw = (originLike || '').trim()
  if (!raw) return ''

  try {
    const parsed = new URL(raw)
    if (!/^https?:$/.test(parsed.protocol)) return ''
    return parsed.origin
  } catch {
    return ''
  }
}

function isAbsoluteUrl(value: string) {
  return ABSOLUTE_URL_RE.test(value)
}

function withMediaCdn(pathname: string) {
  if (!ROOT_PATH_RE.test(pathname)) return pathname

  const cdnOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN)
  if (!cdnOrigin) return pathname

  return `${cdnOrigin}${pathname}`
}

export function isDriveUrl(urlLike: string) {
  try {
    const parsed = new URL(urlLike)
    return DRIVE_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

function resolveManifestEntry(key: string) {
  const entry = mediaManifest[key as MediaManifestKey]
  return typeof entry === 'string' ? entry : null
}

export function resolveMediaUrl(
  keyOrUrl: string | null | undefined,
  { fallback = mediaManifest['default.fallbackImage'], allowDriveUrl = false }: ResolveMediaUrlOptions = {}
) {
  const candidate = (keyOrUrl || '').trim()
  if (!candidate) return withMediaCdn(fallback)

  const manifestValue = resolveManifestEntry(candidate)
  const resolved = manifestValue || candidate

  if (isAbsoluteUrl(resolved)) {
    if (!allowDriveUrl && isDriveUrl(resolved)) {
      return withMediaCdn(fallback)
    }
    return resolved
  }

  if (ROOT_PATH_RE.test(resolved)) {
    return withMediaCdn(resolved)
  }

  return withMediaCdn(fallback)
}

