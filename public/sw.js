const CACHE_VERSION = 'skf-runtime-v3'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const PAGE_CACHE = `${CACHE_VERSION}-pages`
const RECEIPT_CACHE = `${CACHE_VERSION}-receipts`

const OFFLINE_URL = '/offline.html'
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192.png',
  '/videos/august-4th-poster.webp',
]
const STATIC_PREFIXES = [
  '/_next/static/',
  '/gallery/',
  '/videos/',
  '/logo/',
  '/icons/',
  '/Shop/',
  '/affliciation/',
  '/fonts/',
  '/no-profile/',
  '/timetables/',
  '/Summer camp/',
]
const PRIVATE_PREFIXES = ['/admin', '/portal', '/fee', '/admission', '/api']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('skf-') && !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

function isSameOrigin(url) {
  return url.origin === self.location.origin
}

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isStaticRequest(request, url) {
  return STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) ||
    ['font', 'image', 'script', 'style', 'video'].includes(request.destination)
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    if (fallbackUrl) return cache.match(fallbackUrl)
    throw new Error('Network unavailable')
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (!isSameOrigin(url)) return

  if (url.pathname.startsWith('/api/portal/receipts/')) {
    event.respondWith(networkFirst(request, RECEIPT_CACHE))
    return
  }

  if (isPrivatePath(url.pathname)) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGE_CACHE, OFFLINE_URL))
    return
  }

  if (isStaticRequest(request, url)) {
    event.respondWith(cacheFirst(request))
  }
})
