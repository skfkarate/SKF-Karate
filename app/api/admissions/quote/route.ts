import { NextResponse } from 'next/server'
import { z } from 'zod'

import { withRoute } from '@/src/server/lib/route'
import { AdmissionService } from '@/src/server/services/admission.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const admissionQuoteQuerySchema = z.object({
  branchSlug: z.string().trim().min(1).max(120),
  promoCode: z.string().trim().max(80).optional(),
  guardianPhone: z.string().trim().max(20).optional(),
})

export const GET = withRoute(
  {
    querySchema: admissionQuoteQuerySchema,
    rateLimit: { tier: 'public' },
    cacheControl: 'private, no-store',
  },
  async ({ query }) => {
    const quote = await AdmissionService.previewFeeQuote(query)
    return NextResponse.json({ success: true, data: quote })
  }
)
