import { NextResponse } from 'next/server'
import { getStudentBySkfId } from '@/lib/server/sheets'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const skfId = searchParams.get('skfId')

    if (!skfId) {
      return NextResponse.json({ success: false, error: 'skfId parameter is required' }, { status: 400 })
    }

    const student = await getStudentBySkfId(skfId.trim().toUpperCase())

    if (student) {
      // Intentionally omitting sensitive fields like monthlyFee, exact dob etc. not needed for the camp prepopulation
      return NextResponse.json({
        success: true,
        student: {
          name: student.name,
          parent: student.parentName,
          phone: student.phone,
          branch: student.branch,
          batch: student.batch,
        }
      })
    } else {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Lookup student error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
