import { withSentryConfig } from '@sentry/nextjs'

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
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.sportdata.org' },
      { protocol: 'https', hostname: 'www.wkf.net' },
      ...(mediaCdnRemote ? [mediaCdnRemote] : []),
    ],
  },
  async rewrites() {
    return legacyAssetAliases
  },
  async redirects() {
    return [
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
          }
        ]
      }
    ]
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "skf-karate",
  project: "skf-website",
  widenClientFileUpload: true,
  hideSourceMaps: true,
});
// Trigger restart
