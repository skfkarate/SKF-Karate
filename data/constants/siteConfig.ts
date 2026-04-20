/**
 * Site Configuration — Organization Identity
 * Single source of truth for brand strings, URLs, and structured data.
 */

export const SITE_CONFIG = Object.freeze({
  ORG_NAME: 'SKF Karate',
  ORG_FULL_NAME: 'Sports Karate-do Fitness & Self Defence Association®',
  MOTTO: 'Nothing is Impossible',
  TAGLINE: 'Sports Karate-do Fitness & Self Defence Association®',
  FOUNDED_YEAR: 2011,
  SPORT: 'Karate',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'https://skfkarate.org',
  LOGO_PATH: '/logo/SKF logo.png',
  CITY: 'Bangalore',
  STATE: 'Karnataka',
  COUNTRY: 'IN',
})

/** About page dashboard stats */
export const ORG_STATS = Object.freeze({
  TOTAL_ATHLETES: '5,100+',
  BLACK_BELTS: '20+',
  CHAMPIONSHIPS: '300+',
  BRANCHES: '3',
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
    '@type': 'SportsOrganization',
    name: SITE_CONFIG.ORG_NAME,
    url: SITE_CONFIG.URL,
    logo: `${SITE_CONFIG.URL}${SITE_CONFIG.LOGO_PATH}`,
    sport: SITE_CONFIG.SPORT,
    foundingDate: String(SITE_CONFIG.FOUNDED_YEAR),
    description: 'WKF-affiliated karate federation in Bangalore',
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_CONFIG.CITY,
      addressRegion: SITE_CONFIG.STATE,
      addressCountry: SITE_CONFIG.COUNTRY,
    },
    sameAs: [
      'https://www.instagram.com/skf_karate/',
      'https://www.facebook.com/share/1DG1UZ3vKp/?mibextid=wwXIfr',
      'https://www.youtube.com/@skfkarate',
    ],
  }
}
