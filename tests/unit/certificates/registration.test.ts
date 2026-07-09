import { describe, expect, it } from 'vitest'

import {
  certificateSerialFromNumber,
  CERTIFICATE_FIRST_DIGITAL_SERIAL,
  CERTIFICATE_LATEST_DISTRIBUTED_SERIAL,
  CERTIFICATE_NEXT_REGISTRATION_SERIAL,
  CERTIFICATE_RESERVED_SERIAL_MAX,
  formatCertificateNumber,
  isPublicCertificateStatus,
  normalizeCertificateNumber,
  normalizeVerificationCode,
  publicCertificateStatusLabel,
} from '@/lib/certificates/registration'

describe('certificate registration numbers', () => {
  it('reserves the first ten thousand serials and starts the digital register at 10001', () => {
    expect(CERTIFICATE_RESERVED_SERIAL_MAX).toBe(10000)
    expect(CERTIFICATE_FIRST_DIGITAL_SERIAL).toBe(10001)
    expect(CERTIFICATE_LATEST_DISTRIBUTED_SERIAL).toBe(10015)
    expect(CERTIFICATE_NEXT_REGISTRATION_SERIAL).toBe(10016)
    expect(formatCertificateNumber(CERTIFICATE_FIRST_DIGITAL_SERIAL)).toBe('SKF-C-010001')
    expect(formatCertificateNumber(CERTIFICATE_NEXT_REGISTRATION_SERIAL)).toBe('SKF-C-010016')
  })

  it('normalizes and parses SKF-C certificate numbers', () => {
    expect(normalizeCertificateNumber(' skf-c-010015 ')).toBe('SKF-C-010015')
    expect(certificateSerialFromNumber('SKF-C-010015')).toBe(10015)
    expect(normalizeCertificateNumber('SKF-010015')).toBeNull()
    expect(normalizeCertificateNumber('SKF-C-ABCDEF')).toBeNull()
  })

  it('normalizes hidden verification codes separately from certificate numbers', () => {
    expect(normalizeVerificationCode('A'.repeat(32))).toBe('a'.repeat(32))
    expect(normalizeVerificationCode('SKF-C-010015')).toBeNull()
  })

  it('treats issued and reissued certificates as publicly valid statuses', () => {
    expect(isPublicCertificateStatus('issued')).toBe(true)
    expect(isPublicCertificateStatus('reissued')).toBe(true)
    expect(isPublicCertificateStatus('draft')).toBe(false)
    expect(isPublicCertificateStatus('void')).toBe(false)
    expect(isPublicCertificateStatus('revoked')).toBe(false)

    expect(publicCertificateStatusLabel('issued')).toBe('VALID')
    expect(publicCertificateStatusLabel('reissued')).toBe('REISSUED')
    expect(publicCertificateStatusLabel('revoked')).toBe('REVOKED')
  })
})
