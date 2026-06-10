import { HealthService } from '@/src/server/services/health.service'


export async function GET() {
  const health = await HealthService.check()

  return Response.json(
    {
      success: health.code < 500,
      data: health.body,
    },
    {
      status: health.code,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
}
