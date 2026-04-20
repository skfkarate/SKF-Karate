/**
 * Contact & Social — Single Source of Truth
 * Real production data. All components import from here.
 */

export const CONTACT = Object.freeze({
  PHONE: '+91 90199 71726',
  PHONE_RAW: '919019971726',
  EMAIL: 'contact@skfkarate.org',
  WHATSAPP_LINK: 'https://wa.me/919019971726',
  ADDRESS: {
    line1: 'No.24, 12th Cross, Vigneshwara Nagar,',
    line2: 'Sunkadakatte, Vishwaneedam Post,',
    line3: 'Bengaluru - 560091',
    full: 'No.24, 12th Cross, Vigneshwara Nagar, Sunkadakatte, Vishwaneedam Post, Bengaluru - 560091',
  },
  HQ_ADDRESS: '14/1, 2nd Main Rd, M P M Layout, Mallathahalli, Bengaluru 560056',
})

export const SOCIAL_LINKS = Object.freeze({
  FACEBOOK: 'https://www.facebook.com/share/1DG1UZ3vKp/?mibextid=wwXIfr',
  INSTAGRAM: 'https://www.instagram.com/skf_karate/',
  YOUTUBE: 'https://www.youtube.com/@skfkarate',
  WHATSAPP: 'https://wa.me/919019971726',
})

export const SOCIAL_LINKS_LIST = Object.values(SOCIAL_LINKS)

/** Branch-specific WhatsApp numbers */
export const BRANCH_WHATSAPP_NUMBERS = Object.freeze({
  'mp-sports-club': '919019971726',
  'herohalli': '919019971726',
  'kunigal-main': '919019971726',
  'tumkur-main': '919019971726',
  'udupi-main': '919019971726',
  default: '919019971726',
} as Record<string, string>)
