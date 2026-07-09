export const CERTIFICATE_NUMBER_PREFIX = 'SKF-C'
export const CERTIFICATE_RESERVED_SERIAL_MAX = 10000
export const CERTIFICATE_FIRST_DIGITAL_SERIAL = CERTIFICATE_RESERVED_SERIAL_MAX + 1
export const CERTIFICATE_LATEST_DISTRIBUTED_SERIAL = 10015
export const CERTIFICATE_NEXT_REGISTRATION_SERIAL = CERTIFICATE_LATEST_DISTRIBUTED_SERIAL + 1
export const CERTIFICATE_NUMBER_PATTERN = /^SKF-C-\d{6,}$/i
export const VERIFICATION_CODE_PATTERN = /^[a-f0-9]{32}$/i
export const PENDING_CERTIFICATE_NUMBER = 'SKF-C-PENDING'

export const PUBLIC_CERTIFICATE_STATUSES = ['issued', 'reissued'] as const
export type PublicCertificateStatus = (typeof PUBLIC_CERTIFICATE_STATUSES)[number]
export type CertificateStatus = 'draft' | PublicCertificateStatus | 'void' | 'revoked'

export function formatCertificateNumber(serial: number | string) {
  const parsed = Number(serial)
  if (!Number.isFinite(parsed) || parsed < 1) return PENDING_CERTIFICATE_NUMBER
  return `${CERTIFICATE_NUMBER_PREFIX}-${Math.trunc(parsed).toString().padStart(6, '0')}`
}

export function normalizeCertificateNumber(value: unknown) {
  const certificateNumber = String(value || '').trim().toUpperCase()
  return CERTIFICATE_NUMBER_PATTERN.test(certificateNumber) ? certificateNumber : null
}

export function isCertificateNumber(value: unknown) {
  return Boolean(normalizeCertificateNumber(value))
}

export function normalizeVerificationCode(value: unknown) {
  const verificationCode = String(value || '').trim().toLowerCase()
  return VERIFICATION_CODE_PATTERN.test(verificationCode) ? verificationCode : null
}

export function isVerificationCode(value: unknown) {
  return Boolean(normalizeVerificationCode(value))
}

export function certificateSerialFromNumber(value: unknown) {
  const certificateNumber = normalizeCertificateNumber(value)
  if (!certificateNumber) return null

  const serial = Number(certificateNumber.slice(`${CERTIFICATE_NUMBER_PREFIX}-`.length))
  return Number.isSafeInteger(serial) && serial > 0 ? serial : null
}

export function isPublicCertificateStatus(status: unknown): status is PublicCertificateStatus {
  return PUBLIC_CERTIFICATE_STATUSES.includes(status as PublicCertificateStatus)
}

export function publicCertificateStatusLabel(status: unknown) {
  if (status === 'reissued') return 'REISSUED'
  if (status === 'revoked') return 'REVOKED'
  if (status === 'void') return 'VOID'
  if (status === 'issued') return 'VALID'
  return 'PENDING'
}

export function certificateVerifyPath(lookup: string) {
  return `/verify/c/${encodeURIComponent(lookup)}`
}
