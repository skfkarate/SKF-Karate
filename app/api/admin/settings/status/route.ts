import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      sheets: !!(process.env.GOOGLE_SPREADSHEET_ID && process.env.GOOGLE_SHEETS_CLIENT_EMAIL),
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      resend: !!process.env.RESEND_API_KEY
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
