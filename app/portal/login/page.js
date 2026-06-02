import { redirect } from 'next/navigation'

import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import { sanitizePortalCallbackUrl } from '@/lib/server/auth/portal-callback'

import PortalLoginForm from './PortalLoginForm'
import './login.css'

export const dynamic = 'force-dynamic'

export default async function DojoLogin({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams || {})
  const callbackUrl = sanitizePortalCallbackUrl(resolvedSearchParams.callbackUrl)
  const portal = await getPortalAthleteFromCookies()

  if (portal) {
    redirect(callbackUrl)
  }

  return <PortalLoginForm callbackUrl={callbackUrl} />
}
