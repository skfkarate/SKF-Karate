import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
    'Supabase features will not work until these env vars are set.'
  )
}

/**
 * Server-side Supabase client using the service role key.
 * This bypasses RLS — only use in server-side code (API routes, server components).
 * NEVER import this in client components.
 */
export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Check if Supabase is configured and available.
 * Call this before any Supabase operation to provide graceful fallbacks.
 */
export function isSupabaseReady() {
  return supabase !== null
}
