import withPWAInit from 'next-pwa'
import { withSentryConfig } from '@sentry/nextjs'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
})

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
const legacyAssetAliases = [
  { source: '/gallery/Belt Exam.HEIC', destination: '/gallery/Belt Exam.jpeg' },
  { source: '/gallery/In dojo2.HEIC', destination: '/gallery/In dojo2.jpeg' },
  { source: '/gallery/Kumite Training - Fun Day starred.HEIC', destination: '/gallery/Kumite Training - Fun Day starred.jpeg' },
  { source: '/gallery/In dojo1.HEIC', destination: '/gallery/In dojo1.jpeg' },
  { source: '/gallery/In dojo starred.HEIC', destination: '/gallery/In dojo starred.jpeg' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: false },
  turbopack: {},
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.sportdata.org' },
      { protocol: 'https', hostname: 'www.wkf.net' },
      ...(mediaCdnRemote ? [mediaCdnRemote] : []),
    ],
  },
  async rewrites() {
    return legacyAssetAliases
  },
  async headers() {
    return [
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
            key: 'X-XSS-Protection',
            value: '1; mode=block'
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
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default withSentryConfig(withPWA(nextConfig), {
  silent: true,
  org: "skf-karate",
  project: "skf-website",
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
// Trigger restart
