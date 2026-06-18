import { env } from '@/src/server/config/env'

export const FEATURES = {
  SHOP: env.SHOP_ENABLED === 'true',
  CERTIFICATES: env.CERTIFICATES_ENABLED === 'true',
  POINTS: env.POINTS_ENABLED !== 'false',
  TECHNIQUE_VIDEOS: env.PUBLIC_TECHNIQUE_VIDEOS_ENABLED === 'true',
} as const

export function isPaymentsEnabled() {
  return FEATURES.SHOP
}

export function isCertificatesEnabled() {
  return FEATURES.CERTIFICATES
}

export function isPublicTechniqueVideosEnabled() {
  return FEATURES.TECHNIQUE_VIDEOS
}

export function disabledResponse(feature: string, status = 404) {
  return Response.json({ error: `${feature} is not enabled.` }, { status })
}
