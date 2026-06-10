import { withSentryConfig } from '@sentry/nextjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

function parseRemoteFromOrigin(originLike) {
  const raw = (originLike || '').trim()
  if (!raw) return null

  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port || undefined,
    }
  } catch {
    return null
  }
}

const mediaCdnRemote = parseRemoteFromOrigin(process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN)
const canonicalUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.skfkarate.org')
const canonicalHost = canonicalUrl.host.toLowerCase()
const alternateCanonicalHost = canonicalHost.startsWith('www.')
  ? canonicalHost.slice(4)
  : `www.${canonicalHost}`
const immutableAssetHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable'
  }
]
const legacyAssetAliases = [
  { source: '/gallery/Belt Exam.HEIC', destination: '/gallery/Belt Exam.jpeg' },
  { source: '/gallery/In dojo2.HEIC', destination: '/gallery/In dojo2.jpeg' },
  { source: '/gallery/Kumite Training - Fun Day starred.HEIC', destination: '/gallery/Kumite Training - Fun Day starred.jpeg' },
  { source: '/gallery/In dojo1.HEIC', destination: '/gallery/In dojo1.jpeg' },
  { source: '/gallery/In dojo starred.HEIC', destination: '/gallery/In dojo starred.jpeg' },
]
const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // CSP is generated per request in proxy.ts so scripts and style elements can use nonces.
  // TODO(framer-motion/react-inline-styles): remove the proxy style-src-attr fallback after runtime style attributes are eliminated.
  devIndicators: false,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  },
  typescript: { ignoreBuildErrors: false },
  cacheComponents: true,
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingIncludes: {
    '/api/profile-photos/[skfId]': ['./SKF Photos/**/*'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'skfkarate.github.io' },
      { protocol: 'https', hostname: 'www.sportdata.org' },
      { protocol: 'https', hostname: 'www.wkf.net' },
      ...(mediaCdnRemote ? [mediaCdnRemote] : []),
    ],
  },
  async rewrites() {
    return legacyAssetAliases
  },
  async redirects() {
    const productionRedirects = isProduction
      ? [
          {
            source: '/:path*',
            has: [{ type: 'host', value: alternateCanonicalHost }],
            destination: `https://${canonicalHost}/:path*`,
            permanent: true,
          },
          {
            source: '/:path*',
            has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
            destination: `https://${canonicalHost}/:path*`,
            permanent: true,
          },
        ]
      : []

    return [
      ...productionRedirects,
      {
        source: '/senseis',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/senseis/:slug',
        destination: '/instructors/:slug',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/gallery/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/Shop/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/logo/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/icons/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/affliciation/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/fonts/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/no-profile/:path*',
        headers: immutableAssetHeaders
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
	          {
	            key: 'Permissions-Policy',
	            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), browsing-topics=()'
	          },
	          {
	            key: 'Origin-Agent-Cluster',
	            value: '?1'
	          }
	        ]
	      }
	    ]
	  }
	};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG || "skf-karate",
  project: process.env.SENTRY_PROJECT || "skf-website",
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
