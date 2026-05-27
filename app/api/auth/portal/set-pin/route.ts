import { withRoute } from '@/src/server/lib/route'

const DISABLED_RESPONSE = {
  error: 'PIN setup is disabled',
  message: 'Re-enable only after OTP verification is implemented as a prerequisite.',
}

const disabled = withRoute({}, async () => Response.json(DISABLED_RESPONSE, { status: 503 }))

export const GET = disabled
export const POST = disabled
export const PUT = disabled
export const PATCH = disabled
export const DELETE = disabled
