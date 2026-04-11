import { NextRequest } from 'next/server'
import { pinRatelimit } from '@/lib/ratelimit'
import { getStudentBySkfId } from '@/lib/server/sheets'
import { supabaseAdmin } from '@/lib/server/supabase'
import { hashPin, createStudentJWT } from '@/lib/server/auth'
import { setPinSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = setPinSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 })
  
  const { skfId, pin } = parsed.data
  
  // Rate limiting (shared with login to prevent brute force setup attempts)
  const { success } = await pinRatelimit.limit(skfId)
  if (!success) return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  
  // Verify student is Active in Google Sheets
  const student = await getStudentBySkfId(skfId)
  if (!student || student.status !== 'Active') {
    return Response.json({ error: 'SKF ID not found or inactive.' }, { status: 404 })
  }
  
  // Hash the new PIN
  const pinHash = await hashPin(pin)
  
  // Upsert into auth_sessions
  const { error: dbError } = await supabaseAdmin
    .from('auth_sessions')
    .upsert({ 
      skf_id: skfId, 
      pin_hash: pinHash,
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'skf_id' })
    
  if (dbError) {
    return Response.json({ error: 'Failed to set PIN securely.' }, { status: 500 })
  }
  
  // Issue JWT
  const token = createStudentJWT({
    skfId: student.skfId,
    role: 'student',
    branch: student.branch,
    batch: student.batch,
    belt: student.belt,
    name: student.name,
    parentPhone: student.phone
  })
  
  const response = Response.json({ success: true, name: student.name })
  response.headers.set('Set-Cookie', 
    `skf_student_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/`)
  return response
}
