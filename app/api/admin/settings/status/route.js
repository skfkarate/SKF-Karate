import { NextResponse } from 'next/server'
import { isSupabaseReady } from '@/lib/server/supabase'
import { isGoogleSheetsReady } from '@/lib/server/sheets'
import { isEmailConfigured } from '@/lib/email/resend'

export async function GET() {
  try {
    return NextResponse.json({
      supabase: isSupabaseReady(),
      sheets: isGoogleSheetsReady(),
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      resend: isEmailConfigured()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
