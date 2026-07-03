import { redirect } from 'next/navigation'
import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import { sanitizePortalCallbackUrl } from '@/lib/server/auth/portal-callback'
import PortalLoginForm from './PortalLoginForm'


export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const callbackUrl = sanitizePortalCallbackUrl(params?.callbackUrl)
  
  // 1. Server-side session check (eliminates the login flicker)
  let portal = null
  try {
    portal = await getPortalAthleteFromCookies()
  } catch {
    portal = null
  }
  
  // 2. Immediate server-side redirect if logged in
  if (portal) {
    redirect(callbackUrl)
  }

  // 3. Render login form only if definitely not logged in
  return <PortalLoginForm callbackUrl={callbackUrl} />
}
