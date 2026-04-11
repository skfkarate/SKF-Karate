import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyStudentJWT } from '@/lib/server/auth'
import { 
  getStudentBySkfId, 
  getTournamentsBySkfId,
  getAttendanceBySkfId,
  getEnrollmentsBySkfId
} from '@/lib/server/sheets'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function PortalProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('skf_student_token')?.value
  const session = token ? verifyStudentJWT(token) : null

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  const selectedSkfId = cookieStore.get('skf_portal_child_selection')?.value || session.skfId
  
  const [student, tournaments, attendance, enrollments] = await Promise.all([
    getStudentBySkfId(selectedSkfId),
    getTournamentsBySkfId(selectedSkfId),
    getAttendanceBySkfId(selectedSkfId, new Date().toLocaleString('en-US', { month: 'long' })),
    getEnrollmentsBySkfId(selectedSkfId)
  ])

  if (!student) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Student profile not found.</div>
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <ProfileClient 
        student={student} 
        tournaments={tournaments} 
        attendance={attendance} 
        enrollments={enrollments} 
      />
    </div>
  )
}
