export function getApiErrorMessage(payload: unknown, fallback = 'Something went wrong.') {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return fallback
  }

  if (payload instanceof Error) {
    return payload.message || fallback
  }

  const record = payload as Record<string, unknown>
  const directMessage = textValue(record.message)
  if (directMessage) return directMessage

  const error = record.error
  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (error && typeof error === 'object') {
    const errorRecord = error as Record<string, unknown>
    const message = textValue(errorRecord.message)
    if (message) return message

    const detailsMessage = formatDetails(errorRecord.details)
    if (detailsMessage) return detailsMessage
  }

  const detailsMessage = formatDetails(record.details)
  return detailsMessage || fallback
}

function textValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function formatDetails(details: unknown): string {
  if (!details) return ''

  if (typeof details === 'string') {
    return details.trim()
  }

  if (Array.isArray(details)) {
    return details.map(formatDetails).filter(Boolean).join(', ')
  }

  if (typeof details === 'object') {
    const messages = Object.entries(details as Record<string, unknown>).flatMap(
      ([field, value]) => {
        if (Array.isArray(value)) {
          return value
            .map((entry) => textValue(entry))
            .filter(Boolean)
            .map((entry) => `${field}: ${entry}`)
        }

        const message = textValue(value)
        return message ? [`${field}: ${message}`] : []
      }
    )

    return messages.join(', ')
  }

  return ''
}
