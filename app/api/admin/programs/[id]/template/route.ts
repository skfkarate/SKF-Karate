import { NextResponse } from 'next/server'
import { legacyProgramTemplateSchema } from '@/src/server/api/validators/template.validator'
import { withRoute } from '@/src/server/lib/route'
import { AdminProgramTemplateService } from '@/src/server/services/admin-program-template.service'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async ({ params }) => {
    const { id: programId } = params

    return NextResponse.json(await AdminProgramTemplateService.get(programId))
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: legacyProgramTemplateSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, params }) => {
    const { id: programId } = params

    return NextResponse.json({
      success: true,
      ...(await AdminProgramTemplateService.save(programId, body)),
    })
  }
)
