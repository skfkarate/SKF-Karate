import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getStudentById, updateStudent } from '@/lib/data/students'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateStudentPayload } from '@/lib/server/validation'

function isAdmin(session) {
  return session?.user?.role === 'admin'
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existingStudent = getStudentById(id)

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const payload = await readJsonBody(request)
    const student = updateStudent(id, validateStudentPayload({ ...existingStudent, ...payload }))

    revalidatePath('/admin/students')
    revalidatePath(`/admin/students/${id}/edit`)
    revalidatePath('/student')
    revalidatePath(`/student/${student.registrationNumber}`)

    return NextResponse.json({ student })
  } catch (error) {
    return createErrorResponse(error, 'Unable to update the student record.')
  }
}
