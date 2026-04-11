export const CONSENT_KEY = 'skf_cookie_consent'

export type CookieConsentData = {
  analytics: boolean
  marketing: boolean
  timestamp: string
}

export function getCookieConsent(): CookieConsentData | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(CONSENT_KEY)
    if (data) {
      return JSON.parse(data) as CookieConsentData
    }
  } catch (error) {
    console.error('Error parsing cookie consent:', error)
  }
  return null
}

export function saveCookieConsent(analytics: boolean, marketing: boolean): void {
  if (typeof window === 'undefined') return
  const data: CookieConsentData = {
    analytics,
    marketing,
    timestamp: new Date().toISOString()
  }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('skf_consent_updated'))
}
