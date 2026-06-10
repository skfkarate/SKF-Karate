/**
 * Route Constants — frequently used route paths.
 */

export const ROUTES = Object.freeze({
  HOME: '/',
  ABOUT: '/about',
  CLASSES: '/classes',
  CONTACT: '/contact',
  EVENTS: '/events',
  RESULTS: '/results',
  RANKINGS: '/rankings',
  HONOURS: '/honours',
  GALLERY: '/gallery',
  GRADING: '/grading',
  SHOP: '/shop',
  SHOP_CART: '/shop/cart',
  SHOP_CHECKOUT: '/shop/checkout',
  SHOP_ORDERS: '/shop/orders',
  TECHNIQUES: '/techniques',
  VERIFY: '/verify',
  ATHLETE_SEARCH: '/athlete/search',
  PORTAL: '/portal',
  PORTAL_LOGIN: '/portal/login',
  PORTAL_DASHBOARD: '/portal/dashboard',
  PRIVACY: '/privacy-policy',
  COOKIES: '/cookie-policy',
  TERMS: '/terms-of-service',
} as const)
