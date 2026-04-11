/**
 * Retry a function with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of attempts (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 500)
 * @returns {Promise<*>} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 500) {
  let lastError
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}
