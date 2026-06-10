import { notFound } from 'next/navigation'

import { AdmissionService } from '@/src/server/services/admission.service'
import { buildSeoMetadata } from '@/data/constants/seo'

import AdmissionFormClient from './AdmissionFormClient'
import './admission.css'


export async function generateMetadata({
  params,
}: {
  params: Promise<{ branchSlug: string }>
}) {
  const { branchSlug } = await params
  const config = await AdmissionService.getPublicBranchConfig(branchSlug).catch(() => null)
  const branchName = config?.branch.name || branchSlug.replace(/-/g, ' ')

  return buildSeoMetadata(
    `/admission/${branchSlug}`,
    `Apply for SKF Karate admission at ${branchName}. Submit student, guardian, branch, fee, and joining details securely for verification.`
  )
}

export default async function BranchAdmissionPage({
  params,
}: {
  params: Promise<{ branchSlug: string }>
}) {
  const { branchSlug } = await params
  const config = await AdmissionService.getPublicBranchConfig(branchSlug).catch(() => null)

  if (!config?.settings.isEnabled) notFound()

  return <AdmissionFormClient config={config} />
}
