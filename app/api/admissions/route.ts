import { NextResponse } from 'next/server'

import {
  AdmissionService,
  parsePublicAdmissionFormData,
} from '@/src/server/services/admission.service'
import { withRoute } from '@/src/server/lib/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ADMISSION_BODY_BYTES = 20 * 1024 * 1024

export const POST = withRoute(
  {
    rateLimit: { tier: 'upload' },
    maxBodyBytes: MAX_ADMISSION_BODY_BYTES,
  },
  async ({ request }) => {
    const formData = await request.formData()
    const parsed = parsePublicAdmissionFormData(formData)

    const photoValue = formData.get('studentPhoto')
    const photo = photoValue instanceof File ? photoValue : null
    const paymentProofValue = formData.get('paymentProof')
    const paymentProof = paymentProofValue instanceof File ? paymentProofValue : null
    const application = await AdmissionService.createApplication(parsed, {
      studentPhoto: photo,
      paymentProof,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          applicationId: application.id,
          branchName: application.branchName,
          status: application.status,
          quotedMonthlyFee: application.quotedMonthlyFee,
          quotedAdmissionFee: application.quotedAdmissionFee,
          quotedDressFee: application.quotedDressFee,
          quotedJoiningTotal: application.quotedJoiningTotal,
          promoSnapshot: application.promoSnapshot,
        },
      },
      { status: 201 }
    )
  }
)
