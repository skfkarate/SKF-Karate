import { env } from '@/src/server/config/env'

export type TelegramChannel = 'leads' | 'fees' | 'orders' | 'system' | 'reminders'

type TelegramResult = {
  ok: boolean
  skipped?: boolean
  status?: number
  error?: string
}

type TelegramMessageInput = {
  channel: TelegramChannel
  text: string
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  timeoutMs?: number
}

type TelegramPhotoInput = {
  channel: TelegramChannel
  photo: Blob
  filename: string
  caption?: string
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  timeoutMs?: number
}

type TelegramPhotoUrlInput = {
  channel: TelegramChannel
  photoUrl: string
  caption?: string
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  timeoutMs?: number
}

const TELEGRAM_MESSAGE_MAX_CHARS = 4096
const TELEGRAM_CAPTION_MAX_CHARS = 1024
const TRUNCATED_SUFFIX = '\n\n[Shortened to fit Telegram limit.]'

function credentialsFor(channel: TelegramChannel) {
  switch (channel) {
    case 'fees':
      return {
        token: env.TELEGRAM_FEES_BOT_TOKEN || env.TELEGRAM_LEADS_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN,
        chatId: env.TELEGRAM_FEES_CHAT_ID || env.TELEGRAM_LEADS_CHAT_ID || env.TELEGRAM_CHAT_ID,
      }
    case 'orders':
      return {
        token: env.TELEGRAM_ORDERS_BOT_TOKEN || env.TELEGRAM_LEADS_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN,
        chatId: env.TELEGRAM_ORDERS_CHAT_ID || env.TELEGRAM_LEADS_CHAT_ID || env.TELEGRAM_CHAT_ID,
      }
    case 'system':
      return {
        token: env.TELEGRAM_SYSTEM_BOT_TOKEN || env.TELEGRAM_LEADS_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN,
        chatId: env.TELEGRAM_SYSTEM_CHAT_ID || env.TELEGRAM_LEADS_CHAT_ID || env.TELEGRAM_CHAT_ID,
      }
    case 'reminders':
      return {
        token: env.TELEGRAM_REMINDERS_BOT_TOKEN || env.TELEGRAM_LEADS_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN,
        chatId: env.TELEGRAM_REMINDERS_CHAT_ID || env.TELEGRAM_LEADS_CHAT_ID || env.TELEGRAM_CHAT_ID,
      }
    case 'leads':
    default:
      return {
        token: env.TELEGRAM_LEADS_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN,
        chatId: env.TELEGRAM_LEADS_CHAT_ID || env.TELEGRAM_CHAT_ID,
      }
  }
}

export function hasTelegramChannel(channel: TelegramChannel) {
  const { token, chatId } = credentialsFor(channel)
  return Boolean(token && chatId)
}

function timeoutSignal(timeoutMs?: number) {
  if (!timeoutMs) return undefined
  return AbortSignal.timeout(timeoutMs)
}

async function resultFromResponse(response: Response): Promise<TelegramResult> {
  if (response.ok) return { ok: true, status: response.status }

  const detail = await response.text().catch(() => '')
  return {
    ok: false,
    status: response.status,
    error: detail ? `Telegram HTTP ${response.status}: ${detail.slice(0, 240)}` : `Telegram HTTP ${response.status}`,
  }
}

function resultFromError(error: unknown): TelegramResult {
  return {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  }
}

function limitTelegramText(value: string, maxChars: number) {
  if (value.length <= maxChars) return value

  const suffix = TRUNCATED_SUFFIX
  if (maxChars <= suffix.length) return value.slice(0, maxChars)

  return `${value.slice(0, maxChars - suffix.length)}${suffix}`
}

function shouldRetryWithoutParseMode(result: TelegramResult, parseMode?: TelegramMessageInput['parseMode']) {
  if (!parseMode || result.status !== 400) return false

  const message = String(result.error || '').toLowerCase()
  return (
    message.includes('parse') ||
    message.includes('entity') ||
    message.includes('markdown') ||
    message.includes('html')
  )
}

async function postTelegramJson(token: string, method: 'sendMessage' | 'sendPhoto', body: Record<string, unknown>, timeoutMs?: number) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: timeoutSignal(timeoutMs ?? 5000),
    })

    return resultFromResponse(response)
  } catch (error) {
    return resultFromError(error)
  }
}

async function postTelegramForm(token: string, method: 'sendPhoto', formData: FormData, timeoutMs?: number) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      body: formData,
      signal: timeoutSignal(timeoutMs ?? 5000),
    })

    return resultFromResponse(response)
  } catch (error) {
    return resultFromError(error)
  }
}

export async function sendTelegramMessage(input: TelegramMessageInput): Promise<TelegramResult> {
  const { token, chatId } = credentialsFor(input.channel)
  if (!token || !chatId) {
    return {
      ok: false,
      skipped: true,
      error: `Telegram ${input.channel} channel is not configured.`,
    }
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: limitTelegramText(input.text, TELEGRAM_MESSAGE_MAX_CHARS),
  }
  if (input.parseMode) body.parse_mode = input.parseMode

  const result = await postTelegramJson(token, 'sendMessage', body, input.timeoutMs)
  if (!shouldRetryWithoutParseMode(result, input.parseMode)) return result

  const fallbackBody = { ...body }
  delete fallbackBody.parse_mode

  const fallback = await postTelegramJson(token, 'sendMessage', fallbackBody, input.timeoutMs)
  return fallback.ok ? fallback : result
}

export async function sendTelegramPhoto(input: TelegramPhotoInput): Promise<TelegramResult> {
  const { token, chatId } = credentialsFor(input.channel)
  if (!token || !chatId) {
    return {
      ok: false,
      skipped: true,
      error: `Telegram ${input.channel} channel is not configured.`,
    }
  }

  const formData = new FormData()
  formData.append('chat_id', chatId)
  if (input.caption) formData.append('caption', limitTelegramText(input.caption, TELEGRAM_CAPTION_MAX_CHARS))
  if (input.parseMode) formData.append('parse_mode', input.parseMode)
  formData.append('photo', input.photo, input.filename)

  const result = await postTelegramForm(token, 'sendPhoto', formData, input.timeoutMs)
  if (!shouldRetryWithoutParseMode(result, input.parseMode)) return result

  const fallbackFormData = new FormData()
  fallbackFormData.append('chat_id', chatId)
  if (input.caption) fallbackFormData.append('caption', limitTelegramText(input.caption, TELEGRAM_CAPTION_MAX_CHARS))
  fallbackFormData.append('photo', input.photo, input.filename)

  const fallback = await postTelegramForm(token, 'sendPhoto', fallbackFormData, input.timeoutMs)
  return fallback.ok ? fallback : result
}

export async function sendTelegramPhotoUrl(input: TelegramPhotoUrlInput): Promise<TelegramResult> {
  const { token, chatId } = credentialsFor(input.channel)
  if (!token || !chatId) {
    return {
      ok: false,
      skipped: true,
      error: `Telegram ${input.channel} channel is not configured.`,
    }
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: input.photoUrl,
  }
  if (input.caption) body.caption = limitTelegramText(input.caption, TELEGRAM_CAPTION_MAX_CHARS)
  if (input.parseMode) body.parse_mode = input.parseMode

  const result = await postTelegramJson(token, 'sendPhoto', body, input.timeoutMs)
  if (!shouldRetryWithoutParseMode(result, input.parseMode)) return result

  const fallbackBody = { ...body }
  delete fallbackBody.parse_mode

  const fallback = await postTelegramJson(token, 'sendPhoto', fallbackBody, input.timeoutMs)
  return fallback.ok ? fallback : result
}
