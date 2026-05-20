import { z } from 'zod'

import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeReceiptsService } from '@/src/server/services/fee-receipts.service'

const receiptSettingsSchema = z.object({
  activeThemeId: z.enum(['skf_classic', 'skf_minimal', 'skf_iconic']),
})

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async () => ok(await FeeReceiptsService.getSettings())
)

export const PATCH = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: receiptSettingsSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ adminSession, body }) =>
    ok(await FeeReceiptsService.updateSettings({
      activeThemeId: body.activeThemeId,
      updatedBy: adminSession?.user?.name || adminSession?.user?.id || 'Admin',
    }))
)
