import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const baseTelegramEnv = {
  TELEGRAM_BOT_TOKEN: '',
  TELEGRAM_CHAT_ID: '',
  TELEGRAM_LEADS_BOT_TOKEN: 'leads-token',
  TELEGRAM_LEADS_CHAT_ID: 'leads-chat',
  TELEGRAM_FEES_BOT_TOKEN: 'fees-token',
  TELEGRAM_FEES_CHAT_ID: 'fees-chat',
  TELEGRAM_ORDERS_BOT_TOKEN: '',
  TELEGRAM_ORDERS_CHAT_ID: '',
  TELEGRAM_SYSTEM_BOT_TOKEN: '',
  TELEGRAM_SYSTEM_CHAT_ID: '',
  TELEGRAM_REMINDERS_BOT_TOKEN: '',
  TELEGRAM_REMINDERS_CHAT_ID: '',
}

function mockTelegramEnv(overrides: Partial<typeof baseTelegramEnv> = {}) {
  vi.doUnmock('@/src/server/config/env')
  vi.doMock('@/src/server/config/env', () => ({
    env: {
      ...baseTelegramEnv,
      ...overrides,
    },
  }))
}

async function importTelegramService() {
  return import('@/src/server/services/telegram.service')
}

function okResponse() {
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

function errorResponse(detail: string) {
  return new Response(detail, { status: 400 })
}

function lastJsonBody(fetchMock: ReturnType<typeof vi.fn>) {
  const call = fetchMock.mock.calls.at(-1)
  if (!call) throw new Error('Expected fetch to be called.')
  return JSON.parse(String(call[1]?.body || '{}')) as Record<string, unknown>
}

describe('telegram service transport safety', () => {
  beforeEach(() => {
    vi.resetModules()
    mockTelegramEnv()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shortens oversized text messages before sending to Telegram', async () => {
    const fetchMock = vi.fn(async () => okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { sendTelegramMessage } = await importTelegramService()
    const result = await sendTelegramMessage({
      channel: 'fees',
      text: 'A'.repeat(5000),
    })

    const body = lastJsonBody(fetchMock)
    expect(result.ok).toBe(true)
    expect(String(body.text)).toHaveLength(4096)
    expect(String(body.text)).toContain('[Shortened to fit Telegram limit.]')
  })

  it('retries parse-mode failures as plain text', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse("Bad Request: can't parse entities"))
      .mockResolvedValueOnce(okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { sendTelegramMessage } = await importTelegramService()
    const result = await sendTelegramMessage({
      channel: 'fees',
      text: '*Broken _Markdown*',
      parseMode: 'Markdown',
    })

    const firstBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body || '{}')) as Record<string, unknown>
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body || '{}')) as Record<string, unknown>

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(firstBody.parse_mode).toBe('Markdown')
    expect(secondBody.parse_mode).toBeUndefined()
    expect(secondBody.text).toBe('*Broken _Markdown*')
  })

  it('does not retry unrelated Telegram 400 errors', async () => {
    const fetchMock = vi.fn(async () => errorResponse('Bad Request: chat not found'))
    vi.stubGlobal('fetch', fetchMock)

    const { sendTelegramMessage } = await importTelegramService()
    const result = await sendTelegramMessage({
      channel: 'fees',
      text: '*Valid Markdown*',
      parseMode: 'Markdown',
    })

    expect(result.ok).toBe(false)
    expect(result.error).toContain('chat not found')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shortens oversized photo URL captions', async () => {
    const fetchMock = vi.fn(async () => okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { sendTelegramPhotoUrl } = await importTelegramService()
    const result = await sendTelegramPhotoUrl({
      channel: 'fees',
      photoUrl: 'https://example.test/photo.jpg',
      caption: 'B'.repeat(1500),
    })

    const body = lastJsonBody(fetchMock)
    expect(result.ok).toBe(true)
    expect(String(body.caption)).toHaveLength(1024)
    expect(String(body.caption)).toContain('[Shortened to fit Telegram limit.]')
  })

  it('returns a skipped result when a channel is not configured', async () => {
    vi.resetModules()
    mockTelegramEnv({
      TELEGRAM_BOT_TOKEN: '',
      TELEGRAM_CHAT_ID: '',
      TELEGRAM_LEADS_BOT_TOKEN: '',
      TELEGRAM_LEADS_CHAT_ID: '',
      TELEGRAM_ORDERS_BOT_TOKEN: '',
      TELEGRAM_ORDERS_CHAT_ID: '',
    })
    const fetchMock = vi.fn(async () => okResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { sendTelegramMessage } = await importTelegramService()
    const result = await sendTelegramMessage({
      channel: 'orders',
      text: 'Order alert',
    })

    expect(result).toEqual({
      ok: false,
      skipped: true,
      error: 'Telegram orders channel is not configured.',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
