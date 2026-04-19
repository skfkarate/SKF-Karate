export const INITIAL_CONTACT_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  preferredTime: '',
  interest: 'Regular Classes',
  message: '',
  website: '',
}

const QUEUE_KEY = 'skf_contact_queue'
const QUEUE_TTL_MS = 24 * 60 * 60 * 1000

type QueuedSubmission = typeof INITIAL_CONTACT_FORM_STATE & {
  queuedAt: number
}

type SubmissionApiError = Error & {
  retryable?: boolean
  status?: number
}

export function readQueue() {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
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

export function queueSubmission(data) {
  try {
    const queue = readQueue().slice(-4)
    queue.push({ ...data, queuedAt: Date.now() })
    persistQueue(queue)
  } catch {
    // localStorage unavailable
  }
}

export function persistQueue(queue) {
  if (queue.length) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } else {
    localStorage.removeItem(QUEUE_KEY)
  }
}

export async function sendToAPI(payload) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.error || 'Something went wrong') as SubmissionApiError
      err.retryable = data.retryable !== false
      err.status = res.status
      throw err
    }

    return data
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}
