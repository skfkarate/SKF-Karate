import { withRoute } from '@/src/server/lib/route'
import { HealthService } from '@/src/server/services/health.service'

export const dynamic = 'force-dynamic'

export const GET = withRoute({}, async () => {
  const result = await HealthService.check()
  return Response.json(
    {
      success: true,
      data: result.body,
    },
    { status: result.code }
  )
})
