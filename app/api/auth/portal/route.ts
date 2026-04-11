import { NextRequest } from 'next/server'
import { pinRatelimit } from '@/lib/ratelimit'
import { getStudentBySkfId } from '@/lib/server/sheets'
import { supabaseAdmin } from '@/lib/server/supabase'
import { verifyPin, createStudentJWT } from '@/lib/server/auth'
import { pinLoginSchema } from '@/lib/validators'
import { awardPoints } from '@/lib/points/pointsService'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = pinLoginSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 })
  
  const { skfId, pin } = parsed.data
  
  // Rate limiting
  const { success } = await pinRatelimit.limit(skfId)
  if (!success) return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  
  // Verify student is Active in Google Sheets
  const student = await getStudentBySkfId(skfId)
  if (!student || student.status !== 'Active') {
    return Response.json({ error: 'SKF ID not found' }, { status: 404 })
  }
  
  // Check auth_sessions in Supabase
  const { data: session } = await supabaseAdmin
    .from('auth_sessions')
    .select('pin_hash, locked_until')
    .eq('skf_id', skfId)
    .single()
  
  if (!session) return Response.json({ error: 'PIN not set. Please set your PIN first.' }, { status: 404 })
  
  if (session.locked_until && new Date(session.locked_until) > new Date()) {
    return Response.json({ error: 'Account locked. Try again later.' }, { status: 429 })
  }
  
  const valid = await verifyPin(pin, session.pin_hash)
  if (!valid) return Response.json({ error: 'Incorrect PIN' }, { status: 401 })
  
  const token = createStudentJWT({
    skfId: student.skfId,
    role: 'student',
    branch: student.branch,
    batch: student.batch,
    belt: student.belt,
    name: student.name,
    parentPhone: student.phone
  })

  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0,0,0,0)

    const { count } = await supabaseAdmin
      .from('point_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('skf_id', student.skfId)
      .eq('reason', 'LOGIN_BONUS')
      .gte('created_at', startOfMonth.toISOString())

    if (count === 0) {
      await awardPoints(student.skfId, 'LOGIN_BONUS')
    }
  } catch (err) {
    console.error('Gamification hook failed:', err)
  }
  
  const response = Response.json({ success: true, name: student.name })
  response.headers.set('Set-Cookie', 
    `skf_student_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/`)
  return response
}
