import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { searchAthletesByNameLive } from '@/lib/server/repositories/athletes-live'
import { normaliseSkfId } from '@/lib/utils/registration'

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

describe('athlete search linkage', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  afterEach(() => {
    if (originalSupabaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
    }

    if (originalServiceRoleKey === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey
    }
  })

  it('normalizes branch-year imports into canonical SKF IDs', () => {
    expect(normaliseSkfId('mp25 001')).toBe('SKF25MP001')
  })

  it('finds public athletes by SKF ID, not only by name', async () => {
    const results = await searchAthletesByNameLive('skf24rj042')

    expect(results[0]).toEqual(
      expect.objectContaining({
        skfId: 'SKF24RJ042',
        firstName: 'Rohan',
      })
    )
  })
})
