import { feeConsoleQuerySchema, feeCreditCreateSchema } from '@/src/server/api/validators/fees.validator'
import { created, ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    querySchema: feeConsoleQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, query }) => ok(await FeeOperationsService.getCredits(adminSession!, query))
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    bodySchema: feeCreditCreateSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, body }) => created(await FeeOperationsService.createCredit(adminSession!, body))
)
