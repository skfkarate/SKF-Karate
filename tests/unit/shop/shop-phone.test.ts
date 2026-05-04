import { describe, expect, it } from 'vitest'

import {
  normalizeIndianMobileNumber,
  SHOP_PHONE_ERROR_MESSAGE,
} from '@/lib/shop/phone'
import { shopOrderAddressSchema } from '@/src/server/api/validators/shop.validator'

const baseAddress = {
  fullName: 'Test Parent',
  addressLine1: 'SKF FREE TRAINING CAMP PICKUP',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '000000',
}

describe('shop phone validation', () => {
  it('normalizes common Indian mobile number formats', () => {
    expect(normalizeIndianMobileNumber('+91 98765 43210')).toBe('+919876543210')
    expect(normalizeIndianMobileNumber('+91   98765   43210')).toBe('+919876543210')
    expect(normalizeIndianMobileNumber('91-98765-43210')).toBe('+919876543210')
    expect(normalizeIndianMobileNumber('(98765) 43210')).toBe('+919876543210')
    expect(normalizeIndianMobileNumber('0 98765 43210')).toBe('+919876543210')
  })

  it('rejects invalid phone numbers instead of stripping every extra character', () => {
    expect(normalizeIndianMobileNumber('+1 98765 43210')).toBeNull()
    expect(normalizeIndianMobileNumber('+91 98765 432100')).toBeNull()
    expect(normalizeIndianMobileNumber('+91 98765 abcde')).toBeNull()
  })

  it('normalizes the checkout address phone before order handling', () => {
    const parsedAddress = shopOrderAddressSchema.parse({
      ...baseAddress,
      phone: '+91 98765 43210',
    })

    expect(parsedAddress.phone).toBe('+919876543210')
  })

  it('returns a clear checkout validation message for bad phone input', () => {
    const result = shopOrderAddressSchema.safeParse({
      ...baseAddress,
      phone: '+91 98765 432100',
    })

    if (result.success) {
      throw new Error('Expected invalid phone input to fail validation')
    }

    expect(result.error.issues[0]?.message).toBe(SHOP_PHONE_ERROR_MESSAGE)
  })
})
