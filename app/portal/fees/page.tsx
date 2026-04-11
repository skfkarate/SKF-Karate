import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyStudentJWT } from '@/lib/server/auth'
import { getFeesBySkfId, getStudentBySkfId } from '@/lib/server/sheets'
import FeesClient from './FeesClient'
import './fees.css'

export const dynamic = 'force-dynamic'

export default async function FeesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('skf_student_token')?.value
  const session = token ? verifyStudentJWT(token) : null

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  // Handle Child Switcher Overrides
  const selectedSkfId = cookieStore.get('skf_portal_child_selection')?.value || session.skfId
  
  const student = await getStudentBySkfId(selectedSkfId)
  if (!student) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Student profile not found.</div>
  }

  // Initial SSR fetch of fees (will optionally hydrate via React Query in client)
  const fees = await getFeesBySkfId(student.skfId)

  return (
    <div className="portal-fees">
      <FeesClient initialFees={fees} student={student} />
    </div>
  )
}
