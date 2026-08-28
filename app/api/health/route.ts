import { connection } from 'next/server'

import { HealthService } from '@/src/server/services/health.service'

export async function GET() {
  try {
    await connection()

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
  } catch {
    return Response.json(
      { success: false, data: { status: 'error' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
