/**
 * Site Configuration — Organization Identity
 * Single source of truth for brand strings, URLs, and structured data.
 */

import { CONTACT, SOCIAL_LINKS_LIST } from './contact'

export const SITE_CONFIG = Object.freeze({
  ORG_NAME: 'SKF Karate',
  ORG_FULL_NAME: 'Sports Karate-do Fitness & Self Defence Association®',
  MOTTO: 'Nothing is Impossible',
  TAGLINE: 'Sports Karate-do Fitness & Self Defence Association®',
  FOUNDED_YEAR: 2011,
  SPORT: 'Karate',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'https://www.skfkarate.org',
  LOGO_PATH: '/logo/SKF logo.png',
  CITY: 'Bangalore',
  STATE: 'Karnataka',
  COUNTRY: 'IN',
})

export const DEFAULT_OG_IMAGE = '/og-image.png'
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.ADDRESS.full)}`

export function absoluteSiteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path

  const base = getCanonicalOrigin()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export function getCanonicalOrigin() {
  const url = new URL(SITE_CONFIG.URL)
  url.protocol = 'https:'
  url.pathname = ''
  url.search = ''
  url.hash = ''
  return url.toString().replace(/\/$/, '')
}

export function generateCanonicalUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path)
    url.protocol = 'https:'
    url.hash = ''
    url.search = ''
    return url.toString()
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(normalizedPath, `${getCanonicalOrigin()}/`)
  url.hash = ''
  url.search = ''
  return url.toString()
}

export function absoluteMediaUrl(path = DEFAULT_OG_IMAGE) {
  return absoluteSiteUrl(path)
}

/** About page dashboard stats */
export const ORG_STATS = Object.freeze({
  TOTAL_ATHLETES: '5,100+',
  BLACK_BELTS: '20+',
  CHAMPIONSHIPS: '300+',
  BRANCHES: '5',
})

/** Legacy highlights shown on the about page */
export const LEGACY_HIGHLIGHTS = Object.freeze([
  'Arjun Raghavendra — National Gold, Kumite Under 67kg, 2025',
  '87 Official Black Belt Graduations to Date',
  '6 Consecutive State and National Championships Won',
])

/** Affiliation logos */
export const AFFILIATIONS = Object.freeze([
  { src: '/affliciation/wkf.png', alt: 'WKF Logo', width: 120, height: 120 },
  { src: '/affliciation/akska.png', alt: 'AKSKA Logo', width: 110, height: 110 },
  { src: '/affliciation/kio.png', alt: 'KIO Logo', width: 120, height: 120 },
])

/** JSON-LD structured data factory */
export function buildOrgJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['SportsOrganization', 'LocalBusiness', 'SportsActivityLocation'],
    name: SITE_CONFIG.ORG_NAME,
    legalName: SITE_CONFIG.ORG_FULL_NAME,
    url: SITE_CONFIG.URL,
    logo: absoluteMediaUrl(SITE_CONFIG.LOGO_PATH),
    image: absoluteMediaUrl(DEFAULT_OG_IMAGE),
    sport: SITE_CONFIG.SPORT,
    telephone: CONTACT.PHONE,
    email: CONTACT.EMAIL,
    priceRange: '₹₹',
    openingHours: ['Mo-Su 06:00-21:00'],
    hasMap: MAP_URL,
    foundingDate: String(SITE_CONFIG.FOUNDED_YEAR),
    description: 'WKF-affiliated karate federation in Bangalore',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.ADDRESS.full,
      addressLocality: SITE_CONFIG.CITY,
      addressRegion: SITE_CONFIG.STATE,
      addressCountry: SITE_CONFIG.COUNTRY,
    },
    areaServed: ['Bangalore', 'Kunigal', 'Tumkur', 'Udupi'],
    sameAs: SOCIAL_LINKS_LIST,
  }
}
