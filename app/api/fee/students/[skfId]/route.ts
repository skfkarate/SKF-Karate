import { z } from 'zod'

import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

const studentQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
})

const billingUpdateSchema = z.object({
  billing_status: z.enum(['active', 'paused', 'discontinued']).optional(),
  monthly_fee: z.coerce.number().min(0).max(1000000).optional(),
  admission_fee: z.coerce.number().min(0).max(1000000).optional(),
  dress_fee: z.coerce.number().min(0).max(1000000).optional(),
  dress_cost: z.coerce.number().min(0).max(1000000).optional(),
  billing_start_date: z.string().trim().max(20).optional().nullable(),
  billing_end_date: z.string().trim().max(20).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
})

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    querySchema: studentQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, params, query }) =>
    ok(await FeeOperationsService.getStudent(adminSession!, params.skfId, query.year))
)

export const PATCH = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    bodySchema: billingUpdateSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ adminSession, params, body }) =>
    ok(await FeeOperationsService.updateBilling(adminSession!, params.skfId, body))
)
