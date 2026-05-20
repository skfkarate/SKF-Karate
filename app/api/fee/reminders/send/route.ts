import { feeReminderSendSchema } from '@/src/server/api/validators/fees.validator'
import { created } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    bodySchema: feeReminderSendSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, body }) => created(await FeeOperationsService.sendReminders(adminSession!, body))
)
