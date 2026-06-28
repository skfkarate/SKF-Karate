import { supabaseAdmin } from '@/lib/server/supabase'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { publicCertificatesQuerySchema } from '@/src/server/api/validators/certificates.validator'
import { AuthorizationError } from '@/src/server/lib/errors'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    querySchema: publicCertificatesQuerySchema,
    rateLimit: { tier: 'certificateLookup' },
  },
  async ({ portalSession, query }) => {
  if (!isCertificatesEnabled()) {
    return disabledResponse('Certificates', 503)
  }

    const skfId = query.skfId

    if (!portalSession?.skfId || portalSession.skfId.toUpperCase() !== skfId.toUpperCase()) {
      throw new AuthorizationError()
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, skf_id, programs(name, type), belt_level, completion_date, issuer_name, certificate_unlocked, certificates(certificate_number, verification_code, certificate_type, status)')
      .eq('skf_id', skfId)
      .eq('certificate_unlocked', true)
      .eq('status', 'completed')

    if (error) throw error

    return ok({
      certificates: (enrollments || []).map((enrollment) => {
        const program = Array.isArray(enrollment.programs)
          ? enrollment.programs[0]
          : enrollment.programs
        const certificate = Array.isArray(enrollment.certificates)
          ? enrollment.certificates[0]
          : enrollment.certificates

        return {
          id: enrollment.id,
          enrollmentId: enrollment.id,
          skfId: enrollment.skf_id,
          certificateNumber: certificate?.certificate_number || null,
          verificationCode: certificate?.verification_code || null,
          certificateType: certificate?.certificate_type || null,
          programName: program?.name || 'Program',
          programType: program?.type || 'training',
          beltLevel: enrollment.belt_level,
          completionDate: enrollment.completion_date,
          issuerName: enrollment.issuer_name,
          unlocked: enrollment.certificate_unlocked && certificate?.status === 'issued',
        }
      }).filter((certificate) => certificate.verificationCode),
    })
  }
)
