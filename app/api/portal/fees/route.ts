import { portalFeesQuerySchema } from '@/src/server/api/validators/fees.validator'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    querySchema: portalFeesQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession, query }) => {
    const ledger = await FeeLedgerService.getPortalLedger(portalSession!.skfId!, query.year)
    return ok(ledger)
  }
)
