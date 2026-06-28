import { NextResponse } from 'next/server'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { supabaseAdmin } from '@/lib/server/supabase'
import { certificateSearchQuerySchema } from '@/src/server/api/validators/certificates.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

const CERTIFICATE_SELECT = 'skf_id, enrollment_id, verification_code, certificate_number'
const CERTIFICATE_NUMBER_PATTERN = /^SKF-C-\d{6,}$/i
const VERIFICATION_CODE_PATTERN = /^[a-f0-9]{32}$/i
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const GET = withRoute(
  {
    querySchema: certificateSearchQuerySchema,
    rateLimit: { tier: 'certificateLookup' },
    cacheControl: 'public, max-age=60',
  },
  async ({ query }) => {
  if (!isCertificatesEnabled()) {
    return disabledResponse('Certificates', 503)
  }

  const id = query.id
  const normalized = id.trim()
  const upper = normalized.toUpperCase()

  let request = supabaseAdmin
    .from('certificates')
    .select(CERTIFICATE_SELECT)
    .eq('status', 'issued')
    .limit(1)

  if (CERTIFICATE_NUMBER_PATTERN.test(normalized)) {
    request = request.eq('certificate_number', upper)
  } else if (VERIFICATION_CODE_PATTERN.test(normalized)) {
    request = request.eq('verification_code', normalized.toLowerCase())
  } else if (UUID_PATTERN.test(normalized)) {
    request = request.eq('enrollment_id', normalized)
  } else {
    throw new NotFoundError('Certificate')
  }

  const { data, error } = await request.maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Certificate lookup failed' }, { status: 500 })
  }

  if (!data) {
    throw new NotFoundError('Certificate')
  }

  return NextResponse.json({
    skfId: data.skf_id,
    enrollmentId: data.enrollment_id,
    verificationCode: data.verification_code,
    certificateNumber: data.certificate_number,
  })
  }
)
