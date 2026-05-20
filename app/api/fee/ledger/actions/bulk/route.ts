import { feeConsoleBulkActionSchema } from '@/src/server/api/validators/fees.validator'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    bodySchema: feeConsoleBulkActionSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, body }) => ok(await FeeOperationsService.runBulkLedgerActions(adminSession!, body))
)
