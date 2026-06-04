import { redirect } from 'next/navigation'
import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import PortalLoginForm from './PortalLoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const callbackUrl = params?.callbackUrl || '/portal/dashboard'
  
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
