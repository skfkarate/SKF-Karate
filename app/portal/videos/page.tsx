import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyStudentJWT } from '@/lib/server/auth'
import { getStudentBySkfId } from '@/lib/server/sheets'
import VideosClient from './VideosClient'

export const dynamic = 'force-dynamic'

export default async function VideosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('skf_student_token')?.value
  const session = token ? verifyStudentJWT(token) : null

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  const selectedSkfId = cookieStore.get('skf_portal_child_selection')?.value || session.skfId
  
  const student = await getStudentBySkfId(selectedSkfId)
  if (!student) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Student profile not found.</div>
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      <VideosClient student={student} />
    </div>
  )
}
