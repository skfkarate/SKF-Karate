import webPush, { WebPushError, type PushSubscription } from 'web-push'

import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '@/src/server/lib/logger'

type FeeTrackStaff = {
  id?: string
  name?: string
  role?: string
  branchScope?: string
}

type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

type PushSubscriptionRow = {
  id: string
  endpoint?: string | null
  subscription: PushSubscription
}

const DEFAULT_PUSH_URL = '/dashboard'
const DEFAULT_ICON = '/logo.png'
const DEFAULT_BADGE = '/logo.png'

function publicKey() {
  return process.env.FEETRACK_WEB_PUSH_PUBLIC_KEY || process.env.WEB_PUSH_PUBLIC_KEY || ''
}

function privateKey() {
  return process.env.FEETRACK_WEB_PUSH_PRIVATE_KEY || process.env.WEB_PUSH_PRIVATE_KEY || ''
}

function vapidSubject() {
  return process.env.FEETRACK_WEB_PUSH_SUBJECT || process.env.WEB_PUSH_SUBJECT || 'mailto:admin@skfkarate.com'
}

function isConfigured() {
  return Boolean(publicKey() && privateKey())
}

function configureWebPush() {
  if (!isConfigured()) return false
  webPush.setVapidDetails(vapidSubject(), publicKey(), privateKey())
  return true
}

function endpointFrom(subscription: unknown) {
  if (!subscription || typeof subscription !== 'object') return ''
  const endpoint = (subscription as { endpoint?: unknown }).endpoint
  return typeof endpoint === 'string' ? endpoint.trim() : ''
}

function isGone(error: unknown) {
  const statusCode = error instanceof WebPushError ? error.statusCode : 0
  return statusCode === 404 || statusCode === 410
}

export function getFeeTrackPushPublicKey() {
  return publicKey()
}

export async function saveFeeTrackPushSubscription(input: {
  staff: FeeTrackStaff
  subscription: PushSubscription
  userAgent?: string | null
}) {
  if (!isSupabaseReady()) {
    return { saved: false, reason: 'supabase_not_configured' }
  }

  const endpoint = endpointFrom(input.subscription)
  if (!endpoint) {
    return { saved: false, reason: 'missing_endpoint' }
  }

  const staffId = String(input.staff.id || input.staff.name || 'staff').trim().toLowerCase()
  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert({
      endpoint,
      audience: 'feetrack_staff',
      staff_id: staffId,
      skf_id: `feetrack:${staffId}`,
      branch: input.staff.branchScope || null,
      subscription: input.subscription,
      user_agent: input.userAgent || null,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

  if (error) {
    logger.warn('feetrack_push.subscription_save_failed', { error })
    return { saved: false, reason: 'database_error' }
  }

  return { saved: true }
}

export async function sendFeeTrackPushNotification(input: PushPayload) {
  if (!isSupabaseReady()) {
    return { sent: 0, failed: 0, skipped: true, reason: 'supabase_not_configured' }
  }

  if (!configureWebPush()) {
    return { sent: 0, failed: 0, skipped: true, reason: 'web_push_not_configured' }
  }

  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, subscription')
    .eq('audience', 'feetrack_staff')

  if (error) {
    logger.warn('feetrack_push.subscriptions_fetch_failed', { error })
    return { sent: 0, failed: 0, skipped: true, reason: 'database_error' }
  }

  const rows = (data || []) as PushSubscriptionRow[]
  if (!rows.length) return { sent: 0, failed: 0, skipped: false }

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.url || DEFAULT_PUSH_URL,
    tag: input.tag || `feetrack-${Date.now()}`,
    icon: DEFAULT_ICON,
    badge: DEFAULT_BADGE,
    timestamp: Date.now(),
  })

  let sent = 0
  let failed = 0
  const staleIds: string[] = []

  await Promise.all(rows.map(async (row) => {
    try {
      await webPush.sendNotification(row.subscription, payload, {
        TTL: 60,
        urgency: 'high',
        topic: input.tag?.slice(0, 32),
      })
      sent += 1
    } catch (error) {
      failed += 1
      if (isGone(error)) staleIds.push(row.id)
      else logger.warn('feetrack_push.send_failed', { endpoint: row.endpoint, error })
    }
  }))

  if (staleIds.length) {
    const { error: deleteError } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .in('id', staleIds)
    if (deleteError) logger.warn('feetrack_push.stale_delete_failed', { error: deleteError })
  }

  return { sent, failed, skipped: false }
}
