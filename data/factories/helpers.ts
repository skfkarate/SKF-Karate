/**
 * Factory Helpers — common utilities for generating test data.
 */

let idCounter = 0

/** Generate a unique prefixed ID like 'ath_001' */
export function generateId(prefix: string): string {
  idCounter++
  return `${prefix}_${String(idCounter).padStart(3, '0')}`
}

/** Reset ID counter (for test isolation) */
export function resetIdCounter() {
  idCounter = 0
}

/** Generate a random past date string (YYYY-MM-DD) within the last N years */
export function randomPastDate(yearsBack = 3): string {
  const now = new Date()
  const past = new Date(now.getFullYear() - yearsBack, 0, 1)
  const diff = now.getTime() - past.getTime()
  const randomDate = new Date(past.getTime() + Math.random() * diff)
  return randomDate.toISOString().split('T')[0]
}

/** Generate a random future date string (YYYY-MM-DD) within the next N months */
export function randomFutureDate(monthsAhead = 12): string {
  const now = new Date()
  const future = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1)
  const diff = future.getTime() - now.getTime()
  const randomDate = new Date(now.getTime() + Math.random() * diff)
  return randomDate.toISOString().split('T')[0]
}

/** Pick a random item from an array */
export function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** Pick N random items from an array without repetition */
export function pickN<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/** Generate a random integer between min (inclusive) and max (inclusive) */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Generate an ISO timestamp string */
export function isoNow(): string {
  return new Date().toISOString()
}

/** Generate a slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
