import { env } from '@/src/server/config/env'
import { hasTelegramChannel, sendTelegramMessage } from '@/src/server/services/telegram.service'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogPayload = Record<string, unknown> | undefined

const REDACT_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'creditCard',
  'ssn',
  'pin_hash',
  'otp_hash',
  'cookie',
])

const SYSTEM_ALERT_LEVELS = new Set<LogLevel>(['warn', 'error'])
const SYSTEM_ALERT_THROTTLE_MS = 60_000
const SYSTEM_ALERT_MAX_JSON_CHARS = 2500

declare global {
  var __skfSystemAlertThrottle: Map<string, number> | undefined
}

function shouldRedactKey(key: string) {
  const normalized = key.toLowerCase()
  return (
    REDACT_KEYS.has(normalized) ||
    normalized.includes('token') ||
    normalized.includes('secret') ||
    normalized.includes('password') ||
    normalized.includes('authorization') ||
    normalized.includes('cookie') ||
    normalized.includes('private_key') ||
    normalized.includes('api_key')
  )
}

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    const errorWithMeta = value as Error & {
      code?: unknown
      statusCode?: unknown
      details?: unknown
      expose?: unknown
    }

    return {
      name: value.name,
      message: value.message,
      code: errorWithMeta.code,
      statusCode: errorWithMeta.statusCode,
      details: errorWithMeta.details === undefined ? undefined : serialize(errorWithMeta.details),
      expose: errorWithMeta.expose,
      stack: env.NODE_ENV === 'development' ? value.stack : undefined,
    }
  }

  if (Array.isArray(value)) {
    return value.map(serialize)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (shouldRedactKey(key)) {
          return [key, '[REDACTED]']
        }

        return [key, serialize(entry)]
      })
    )
  }

  return value
}

function compact(value: unknown, maxChars = SYSTEM_ALERT_MAX_JSON_CHARS) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars)}\n... truncated`
}

function alertKey(record: Record<string, unknown>) {
  const error = record.error
  const errorMessage =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message || '')
      : ''

  return [
    record.level,
    record.event,
    record.path || '',
    record.status || '',
    errorMessage.slice(0, 180),
  ].join('|')
}

function shouldSendSystemAlert(record: Record<string, unknown>) {
  if (record.systemAlert === false) return false
  if (!SYSTEM_ALERT_LEVELS.has(record.level as LogLevel)) return false
  if (!hasTelegramChannel('system')) return false

  const key = alertKey(record)
  const now = Date.now()
  const throttle = globalThis.__skfSystemAlertThrottle || new Map<string, number>()
  globalThis.__skfSystemAlertThrottle = throttle

  const lastSentAt = throttle.get(key) || 0
  if (now - lastSentAt < SYSTEM_ALERT_THROTTLE_MS) return false

  throttle.set(key, now)
  return true
}

function notifySystem(record: Record<string, unknown>) {
  if (!shouldSendSystemAlert(record)) return

  const title = record.level === 'error' ? 'SKF Website Error' : 'SKF Website Warning'
  const text = [
    title,
    '',
    `Event: ${record.event}`,
    `Env: ${record.env}`,
    `Time: ${record.time}`,
    record.requestId ? `Request ID: ${record.requestId}` : '',
    record.method || record.path ? `Request: ${record.method || ''} ${record.path || ''}`.trim() : '',
    record.status ? `Status: ${record.status}` : '',
    '',
    compact(record),
  ].filter(Boolean).join('\n')

  void sendTelegramMessage({
    channel: 'system',
    text,
    timeoutMs: 5000,
  }).catch((error) => {
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'system.telegram_alert_failed',
        env: env.NODE_ENV,
        time: new Date().toISOString(),
        error: serialize(error),
      })
    )
  })
}

function write(level: LogLevel, event: string, payload?: LogPayload) {
  const serializedPayload =
    payload && typeof payload === 'object' ? (serialize(payload) as Record<string, unknown>) : undefined

  const record = {
    level,
    event,
    env: env.NODE_ENV,
    time: new Date().toISOString(),
    ...(serializedPayload || {}),
  }

  const line = JSON.stringify(record)

  notifySystem(record)

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  if (level === 'debug') {
    console.info(line)
    return
  }

  console.info(line)
}

export const logger = {
  debug(event: string, payload?: LogPayload) {
    write('debug', event, payload)
  },
  info(event: string, payload?: LogPayload) {
    write('info', event, payload)
  },
  warn(event: string, payload?: LogPayload) {
    write('warn', event, payload)
  },
  error(event: string, payload?: LogPayload) {
    write('error', event, payload)
  },
}
