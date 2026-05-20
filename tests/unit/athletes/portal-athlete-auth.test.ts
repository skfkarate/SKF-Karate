import { describe, expect, it } from 'vitest'

import { isEligiblePortalAthlete } from '@/lib/server/auth/portal-athlete'

describe('portal athlete eligibility', () => {
  it('allows active athlete records', () => {
    expect(isEligiblePortalAthlete({ skfId: 'SKF26MP001', status: 'active' })).toBe(true)
  })

  it('rejects inactive, alumni, and missing athlete records', () => {
    expect(isEligiblePortalAthlete(null)).toBe(false)
    expect(isEligiblePortalAthlete({ skfId: 'SKF26MP001', status: 'inactive' })).toBe(false)
    expect(isEligiblePortalAthlete({ skfId: 'SKF26MP001', status: 'alumni' })).toBe(false)
  })
})
