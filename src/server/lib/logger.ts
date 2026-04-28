import { env } from '@/src/server/config/env'

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

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: env.NODE_ENV === 'development' ? value.stack : undefined,
    }
  }

  if (Array.isArray(value)) {
    return value.map(serialize)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (REDACT_KEYS.has(key.toLowerCase())) {
          return [key, '[REDACTED]']
        }

        return [key, serialize(entry)]
      })
    )
  }

  return value
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
