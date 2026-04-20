import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyJWT, COOKIE_NAME } from '@/lib/server/auth_legacy'
import TimetableClient from './TimetableClient'
import { getTimetableByBranch } from '@/lib/server/sheets'

export const dynamic = 'force-dynamic'

export default async function TimetablePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = verifyJWT(token)

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  const branchName = session.branch || 'Unknown Dojo'
  const timetableData = await getTimetableByBranch(branchName)

  return <TimetableClient branchName={branchName} timetableData={timetableData || []} />
}

