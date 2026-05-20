const RECEIPT_CACHE = 'skf-fee-receipts-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET' || !url.pathname.startsWith('/api/portal/receipts/')) {
    return
  }

  event.respondWith(
    caches.open(RECEIPT_CACHE).then(async (cache) => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          cache.put(request, response.clone())
        }
        return response
      } catch (error) {
        const cached = await cache.match(request)
        if (cached) return cached
        throw error
      }
    })
  )
})
