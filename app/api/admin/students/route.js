import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createStudent } from '@/lib/data/students'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateStudentPayload } from '@/lib/server/validation'

function isAdmin(session) {
  return session?.user?.role === 'admin'
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await readJsonBody(request)
    const student = createStudent(validateStudentPayload(payload))

    revalidatePath('/admin/students')
    revalidatePath(`/admin/students/${student.id}/edit`)
    revalidatePath('/student')
    revalidatePath(`/student/${student.registrationNumber}`)

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Unable to save the student record.')
  }
}
