import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/server/requireRole'
import { editStudentSchema } from '@/lib/validators'
import { updateStudent, deactivateStudent } from '@/lib/server/sheets'

export async function PUT(request: Request, props: { params: Promise<{ skfId: string }> }) {
  let skfIdResolved = ''
  try {
    await requireRole(['admin', 'branch_admin', 'super_admin'] as any)
    const { skfId } = await props.params
    skfIdResolved = skfId
    const body = await request.json()
    const validatedUpdates = editStudentSchema.parse(body)

    const ok = await updateStudent(skfId.toUpperCase(), validatedUpdates)
    if (!ok) {
        return NextResponse.json({ error: 'Student not found or sheet edit failed' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error(`PUT /api/admin/students/${skfIdResolved} error:`, error)
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ skfId: string }> }) {
    let skfIdResolved = ''
    try {
        await requireRole(['admin', 'branch_admin', 'super_admin'] as any)
        const { skfId } = await props.params
        skfIdResolved = skfId
        const body = await request.json()
        
        if (!body.confirm) {
            return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
        }
        
        const ok = await deactivateStudent(skfId.toUpperCase())
        if (!ok) {
            return NextResponse.json({ error: 'Student not found or deactivation failed' }, { status: 404 })
        }
        
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error(`DELETE /api/admin/students/${skfIdResolved} error:`, error)
        if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
            return NextResponse.json({ error: error.message }, { status: error.message === 'UNAUTHORIZED' ? 401 : 403 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
