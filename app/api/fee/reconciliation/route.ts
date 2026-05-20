import { feeConsoleQuerySchema } from '@/src/server/api/validators/fees.validator'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    querySchema: feeConsoleQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, query }) => ok(await FeeOperationsService.getReconciliation(adminSession!, query))
)
