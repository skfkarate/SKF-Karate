import { describe, expect, it } from 'vitest'

import { extractYouTubeId } from '@/lib/youtube'

describe('Home Practice video links', () => {
  it('extracts the same video ID from a YouTube Short and standard lesson link', () => {
    expect(extractYouTubeId('https://www.youtube.com/shorts/abcDEF12345')).toBe('abcDEF12345')
    expect(extractYouTubeId('https://www.youtube.com/watch?v=abcDEF12345')).toBe('abcDEF12345')
  })
})
