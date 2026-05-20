import { feeProofReviewSchema } from '@/src/server/api/validators/fees.validator'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    bodySchema: feeProofReviewSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, params, body }) =>
    ok(await FeeOperationsService.approvePaymentProof(adminSession!, params.id, body.note))
)
