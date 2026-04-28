import { redirect } from 'next/navigation'

import AdminLoginForm from '@/app/_components/admin/AdminLoginForm'
import { getAdminSession } from '@/lib/server/auth/session'

export const dynamic = 'force-dynamic'

export default async function FeeLoginPage() {
  const session = await getAdminSession()

  if (session?.user?.role && ['admin', 'instructor'].includes(session.user.role)) {
    redirect('/fee')
  }

  return <AdminLoginForm defaultCallbackUrl="/fee" />
}
