export const INITIAL_TRIAL_FORM_STATE = {
  studentName: '',
  parentPhone: '',
  childAge: 0,
  branch: '',
  hearAboutUs: '',
}

const QUEUE_KEY = 'skf_trial_queue'
const QUEUE_TTL_MS = 24 * 60 * 60 * 1000

type QueuedSubmission = typeof INITIAL_TRIAL_FORM_STATE & {
  queuedAt: number
  preferredBatch: string
}

type TrialSubmissionError = Error & {
  retryable?: boolean
  status?: number
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

export function queueTrialSubmission(data: Omit<QueuedSubmission, 'queuedAt'>) {
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

export async function sendTrialToAPI(payload: Omit<QueuedSubmission, 'queuedAt'>) {
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
      const message =
        data?.error?.message || data?.error || 'Something went wrong'
      const err = new Error(message) as TrialSubmissionError
      err.retryable = data?.retryable ?? (res.status >= 500 || res.status === 429)
      err.status = res.status
      throw err
    }

    return data
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}
