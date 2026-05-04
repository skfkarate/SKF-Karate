export const SHOP_PHONE_ERROR_MESSAGE = 'Please enter a valid 10-digit mobile number.'

const COMMON_PHONE_SEPARATORS = /[\s().-]/g

export function normalizeIndianMobileNumber(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const compactValue = value.trim().replace(COMMON_PHONE_SEPARATORS, '')
  if (!compactValue || !/^\+?\d+$/.test(compactValue)) {
    return null
  }

  const digits = compactValue.replace(/\D/g, '')
  let nationalNumber = digits

  if (compactValue.startsWith('+')) {
    if (!digits.startsWith('91')) {
      return null
    }
    nationalNumber = digits.slice(2)
  } else if (digits.length === 12 && digits.startsWith('91')) {
    nationalNumber = digits.slice(2)
  } else if (digits.length === 11 && digits.startsWith('0')) {
    nationalNumber = digits.slice(1)
  }

  if (!/^\d{10}$/.test(nationalNumber)) {
    return null
  }

  return `+91${nationalNumber}`
}

export function isValidIndianMobileNumber(value: unknown): boolean {
  return normalizeIndianMobileNumber(value) !== null
}
