import { NextResponse } from 'next/server'
import { z } from 'zod'
import { submitLead } from '@/lib/server/sheets'
import { Resend } from 'resend'

import { BRANCH_SLUGS } from '@/data/constants/branches'

// The schema matching FreeTrialForm.tsx
const leadSchema = z.object({
  studentName: z.string().min(2).max(100),
  parentPhone: z.string().regex(/^\+91[0-9]{10}$/),
  childAge: z.number().min(5).max(60),
  branch: z.enum(BRANCH_SLUGS),
  preferredBatch: z.string().min(2),
  hearAboutUs: z.string().optional()
})

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = leadSchema.parse(body)

    const dateStr = new Date().toISOString()
    const status = 'New'

    // Columns: Name | Phone | Age | Branch | Batch | Source | Date | Status
    const row = [
      validatedData.studentName,
      validatedData.parentPhone,
      String(validatedData.childAge),
      validatedData.branch,
      validatedData.preferredBatch,
      validatedData.hearAboutUs || '',
      dateStr,
      status
    ]

    const success = await submitLead(row)
    if (!success) {
      throw new Error('Failed to save lead to Sheets')
    }

    // Send email to admin
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'SKF Karate <noreply@skfkarate.com>',
        to: process.env.ADMIN_EMAIL || 'admin@skfkarate.com',
        subject: `New trial request — ${validatedData.branch} — ${validatedData.studentName}`,
        html: `
          <h3>New Free Trial Request</h3>
          <p><strong>Student Name:</strong> ${validatedData.studentName}</p>
          <p><strong>Parent Phone:</strong> ${validatedData.parentPhone}</p>
          <p><strong>Age:</strong> ${validatedData.childAge}</p>
          <p><strong>Branch:</strong> ${validatedData.branch}</p>
          <p><strong>Preferred Batch:</strong> ${validatedData.preferredBatch}</p>
          <p><strong>Source:</strong> ${validatedData.hearAboutUs || 'Not provided'}</p>
          <p><strong>Submitted At:</strong> ${dateStr}</p>
        `
      }).catch(err => console.error('Failed to send Resend email:', err)) // fire and forget
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leads API Error:', error)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 400 })
  }
}
