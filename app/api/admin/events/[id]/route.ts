import { NextResponse } from 'next/server'
import { updateEventRecord, deleteEventRecord } from '@/lib/server/repositories/events'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function PUT(request: Request, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await Promise.resolve(context.params)
    const { id } = params
    const body = await request.json()
    
    const updated = updateEventRecord(id, body)
    if (!updated) {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, event: updated })
  } catch (error: any) {
    console.error('[API] Failed to update event:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await Promise.resolve(context.params)
    const { id } = params
    
    const deleted = deleteEventRecord(id)
    if (!deleted) {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] Failed to delete event:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
