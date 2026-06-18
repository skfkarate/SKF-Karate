import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { WebSocketLikeConstructor } from '@supabase/realtime-js'
import WebSocket from 'ws'

import { env } from '@/src/server/config/env'

const WebSocketTransport = WebSocket as unknown as WebSocketLikeConstructor
const serverClientOptions = {
  realtime: { transport: WebSocketTransport },
  auth: { autoRefreshToken: false, persistSession: false },
}

function createLazyClient(
  getUrl: () => string | undefined,
  getKey: () => string | undefined,
  label: string
): SupabaseClient {
  let client: SupabaseClient | null = null
  return new Proxy({} as unknown as SupabaseClient, {
    get(_, prop) {
      if (!client) {
        const url = getUrl()
        const key = getKey()
        if (!url || !key) {
          throw new Error(
            `[Supabase] ${label} is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.`
          )
        }
        client = createClient(url, key, serverClientOptions)
      }
      const value = (client as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? value.bind(client) : value
    },
  })
}

export const supabaseClient = createLazyClient(
  () => env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  () => env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
  'Public client'
)

export const supabaseAdmin = createLazyClient(
  () => env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  () => env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  'Admin client'
)

export function isSupabaseReady(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
}
