export const INITIAL_TRIAL_FORM_STATE = {
  studentName: '',
  parentPhone: '',
  childAge: '',
  branch: '',
  hearAboutUs: '',
}

const QUEUE_KEY = 'skf_trial_queue'
const QUEUE_TTL_MS = 24 * 60 * 60 * 1000

type QueuedSubmission = typeof INITIAL_TRIAL_FORM_STATE & {
  queuedAt: number
  preferredBatch: string
}

export function readTrialQueue(): QueuedSubmission[] {
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

export function queueTrialSubmission(data: any) {
  try {
    const queue = readTrialQueue().slice(-4)
    queue.push({ ...data, queuedAt: Date.now() })
    persistTrialQueue(queue)
  } catch {
    // localStorage unavailable
  }
}

export function persistTrialQueue(queue: QueuedSubmission[]) {
  if (queue.length) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } else {
    localStorage.removeItem(QUEUE_KEY)
  }
}

export async function sendTrialToAPI(payload: any) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await res.json()
    if (!res.ok) {
      const err = new Error(data.error || 'Something went wrong') as any
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
