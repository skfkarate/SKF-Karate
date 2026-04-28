import { afterEach, describe, expect, it } from 'vitest'

import { resolveMediaUrl } from '@/lib/media/resolveMediaUrl'

const ORIGINAL_MEDIA_CDN = process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN

describe('resolveMediaUrl', () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN = ORIGINAL_MEDIA_CDN
  })

  it('resolves manifest keys to concrete local paths', () => {
    process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN = ''
    expect(resolveMediaUrl('home.bookTrial.background')).toBe('/gallery/In Dojo 3.jpeg')
  })

  it('prefixes local media paths with configured CDN origin', () => {
    process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN = 'https://media.skfkarate.org'
    expect(resolveMediaUrl('home.bookTrial.background')).toBe('https://media.skfkarate.org/gallery/In Dojo 3.jpeg')
  })

  it('falls back when a drive URL is provided by default', () => {
    process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN = ''
    expect(resolveMediaUrl('https://drive.google.com/file/d/abc/view')).toBe('/gallery/Training.jpeg')
  })

  it('allows drive URL only when explicitly enabled', () => {
    process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN = ''
    expect(resolveMediaUrl('https://drive.google.com/file/d/abc/view', { allowDriveUrl: true })).toBe(
      'https://drive.google.com/file/d/abc/view'
    )
  })

  it('returns fallback for unknown keys', () => {
    process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN = ''
    expect(resolveMediaUrl('home.unknown.missing')).toBe('/gallery/Training.jpeg')
    expect(resolveMediaUrl('home.unknown.missing', { fallback: '/logo/SKF logo.png' })).toBe('/logo/SKF logo.png')
  })
})

