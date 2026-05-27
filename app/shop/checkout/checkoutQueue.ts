export const CHECKOUT_QUEUE_KEY = 'skf_checkout_queue'
const QUEUE_TTL_MS = 24 * 60 * 60 * 1000

export type QueuedCheckout = {
  queuedAt: number
  payload: unknown
}

export function readCheckoutQueue(): QueuedCheckout[] {
  try {
    const queue = JSON.parse(localStorage.getItem(CHECKOUT_QUEUE_KEY) || '[]')
    const now = Date.now()

    if (!Array.isArray(queue)) return []

    return queue.filter((item) => {
      if (!item || typeof item !== 'object') return false
      if (!item.queuedAt) return false
      return now - item.queuedAt <= QUEUE_TTL_MS
    })
  } catch {
    return []
  }
}

export function queueCheckoutSubmission(payload: unknown) {
  try {
    const queue = readCheckoutQueue().slice(-4)
    queue.push({ payload, queuedAt: Date.now() })
    persistCheckoutQueue(queue)
  } catch {
    // localStorage unavailable
  }
}

export function persistCheckoutQueue(queue: QueuedCheckout[]) {
  if (queue.length) {
    localStorage.setItem(CHECKOUT_QUEUE_KEY, JSON.stringify(queue))
  } else {
    localStorage.removeItem(CHECKOUT_QUEUE_KEY)
  }
}

export async function flushCheckoutQueue() {
  try {
    const queue = readCheckoutQueue()
    if (!queue.length) return

    const remaining: QueuedCheckout[] = []
    for (const item of queue) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)

        const res = await fetch('/api/shop/orders', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
          signal: controller.signal
        })
        clearTimeout(timeout)

        if (!res.ok) {
           const data = await res.json().catch((): unknown => ({}))
           const retryable =
             data && typeof data === 'object' && 'retryable' in data
               ? (data as { retryable?: unknown }).retryable
               : undefined
           // Keep in queue if it's a 5xx error or retryable, drop if it's a 4xx validation error
           if (res.status >= 500 || retryable !== false) {
             remaining.push(item)
           }
        }
      } catch {
        remaining.push(item)
      }
    }
    persistCheckoutQueue(remaining)
  } catch {
    // silently fail
  }
}
