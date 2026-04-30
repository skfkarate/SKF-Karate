import { portalFeePaymentSchema } from '@/src/server/api/validators/fees.validator'
import { disabledResponse, isPaymentsEnabled } from '@/lib/server/feature-flags'
import { ExternalServiceError, ValidationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ request }) => {
    if (!isPaymentsEnabled()) {
      return disabledResponse('Payments', 503)
    }

    let raw: unknown
    try {
      raw = await request.json()
    } catch {
      throw new ValidationError({ body: ['Invalid JSON body.'] })
    }
    portalFeePaymentSchema.parse(raw)

    throw new ExternalServiceError('Fee payment initialization is not implemented for live Razorpay yet.')
  }
)
