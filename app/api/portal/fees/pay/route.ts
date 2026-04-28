import { portalFeePaymentSchema } from '@/src/server/api/validators/fees.validator'
import { ValidationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    bodySchema: portalFeePaymentSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async () => {
    throw new ValidationError({
      payment: ['Payment action is unavailable.'],
    })
  }
)
