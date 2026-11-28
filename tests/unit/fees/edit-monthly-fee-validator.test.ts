import { describe, expect, it } from 'vitest'

import { editMonthlyFeeSchema } from '@/src/server/api/validators/fees.validator'

describe('editMonthlyFeeSchema', () => {
  it('accepts a 2027 monthly fee edit with an optional reason', () => {
    const parsed = editMonthlyFeeSchema.parse({
      skfId: 'SKF26MP001',
      month: 'June',
      year: 2027,
      amount: '1800',
      reason: 'Correction',
    })

    expect(parsed).toEqual({
      skfId: 'SKF26MP001',
      month: 'June',
      year: 2027,
      amount: 1800,
      reason: 'Correction',
    })
  })

  it('rejects non-positive amounts and oversized reasons', () => {
    const base = { skfId: 'SKF26MP001', month: 'June', year: 2027 }

    expect(editMonthlyFeeSchema.safeParse({ ...base, amount: 0 }).success).toBe(false)
    expect(editMonthlyFeeSchema.safeParse({ ...base, amount: 1800, reason: 'x'.repeat(301) }).success).toBe(false)
    expect(editMonthlyFeeSchema.safeParse({ ...base, amount: 1800, month: 'Jnu' }).success).toBe(false)
  })
})
