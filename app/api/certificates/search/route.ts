import { NextResponse } from 'next/server'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { supabaseAdmin } from '@/lib/server/supabase'
import { certificateSearchQuerySchema } from '@/src/server/api/validators/certificates.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    querySchema: certificateSearchQuerySchema,
    rateLimit: { tier: 'certificateLookup' },
  },
  async ({ query }) => {
  if (!isCertificatesEnabled()) {
    return disabledResponse('Certificates', 503)
  }

  const id = query.id

  const { data, error } = await supabaseAdmin
    .from('certificates')
    .select('skf_id, enrollment_id')
    .or(`verification_code.eq.${id},enrollment_id.eq.${id}`)
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Certificate lookup failed' }, { status: 500 })
  }

  if (!data) {
    throw new NotFoundError('Certificate')
  }

  return NextResponse.json({
    skfId: data.skf_id,
    enrollmentId: data.enrollment_id,
  })
  }
)
