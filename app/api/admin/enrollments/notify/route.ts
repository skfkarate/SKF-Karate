import { NextResponse } from 'next/server'
import { enrollmentNotifySchema } from '@/src/server/api/validators/admin-certificates.validator'
import { withRoute } from '@/src/server/lib/route'
import { NotificationService } from '@/src/server/services/notification.service'

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: enrollmentNotifySchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, requestId }) => {
    const result = await NotificationService.sendCertificateReadyNotifications({
      enrollmentIds: body.enrollmentIds,
      requestId,
    })

    return NextResponse.json({ success: true, count: result.sent, failed: result.failed })
  }
)
