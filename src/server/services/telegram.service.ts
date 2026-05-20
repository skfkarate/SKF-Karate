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

function credentialsFor(channel: TelegramChannel) {
  switch (channel) {
    case 'fees':
      return {
        token: env.TELEGRAM_FEES_BOT_TOKEN,
        chatId: env.TELEGRAM_FEES_CHAT_ID,
      }
    case 'orders':
      return {
        token: env.TELEGRAM_ORDERS_BOT_TOKEN,
        chatId: env.TELEGRAM_ORDERS_CHAT_ID,
      }
    case 'system':
      return {
        token: env.TELEGRAM_SYSTEM_BOT_TOKEN,
        chatId: env.TELEGRAM_SYSTEM_CHAT_ID,
      }
    case 'reminders':
      return {
        token: env.TELEGRAM_REMINDERS_BOT_TOKEN,
        chatId: env.TELEGRAM_REMINDERS_CHAT_ID,
      }
    case 'leads':
    default:
      return {
        token: env.TELEGRAM_BOT_TOKEN,
        chatId: env.TELEGRAM_CHAT_ID,
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
    text: input.text,
  }
  if (input.parseMode) body.parse_mode = input.parseMode

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: timeoutSignal(input.timeoutMs ?? 5000),
  })

  return resultFromResponse(response)
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
  if (input.caption) formData.append('caption', input.caption)
  if (input.parseMode) formData.append('parse_mode', input.parseMode)
  formData.append('photo', input.photo, input.filename)

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: formData,
    signal: timeoutSignal(input.timeoutMs ?? 5000),
  })

  return resultFromResponse(response)
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
  if (input.caption) body.caption = input.caption
  if (input.parseMode) body.parse_mode = input.parseMode

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: timeoutSignal(input.timeoutMs ?? 5000),
  })

  return resultFromResponse(response)
}
