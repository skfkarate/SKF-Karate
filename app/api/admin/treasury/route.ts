import {
  adminTrainingFeeActionSchema,
  adminTrainingFeeQuerySchema,
} from '@/src/server/api/validators/fees.validator'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    querySchema: adminTrainingFeeQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ query }) => {
    const ledger = await FeeLedgerService.getAdminLedger(query)
    return ok(ledger)
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: adminTrainingFeeActionSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ body }) => {
    if (body.action === 'mark_paid') {
      return ok(
        await FeeLedgerService.markPaid({
          skfId: body.skfId,
          month: body.month,
          year: body.year,
          paymentMethod: body.paymentMethod,
          paymentReference: body.paymentReference,
          receiptId: body.receiptId,
        })
      )
    }

    if (body.action === 'mark_due') {
      return ok(
        await FeeLedgerService.markDue({
          skfId: body.skfId,
          month: body.month,
          year: body.year,
        })
      )
    }

    if (body.action === 'sync_student') {
      return ok(
        await FeeLedgerService.syncStudent({
          skfId: body.skfId,
          year: body.year,
        })
      )
    }

    return ok(await FeeLedgerService.syncAllActiveAthletes(body.year))
  }
)
