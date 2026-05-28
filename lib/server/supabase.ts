import { createClient } from '@supabase/supabase-js'
import type { WebSocketLikeConstructor } from '@supabase/realtime-js'
import WebSocket from 'ws'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const WebSocketTransport = WebSocket as unknown as WebSocketLikeConstructor
const serverClientOptions = {
  realtime: { transport: WebSocketTransport },
  auth: { autoRefreshToken: false, persistSession: false },
}

// Browser/client component client (anon key only)
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  serverClientOptions
)

// Server-side admin client (service role — never import in client components)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  serverClientOptions
)

export function isSupabaseReady() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
