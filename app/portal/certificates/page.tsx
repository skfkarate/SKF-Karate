import { requireRole } from '@/lib/server/requireRole'
import { supabaseAdmin } from '@/lib/server/supabase'
import CertificatesClient from './CertificatesClient'
import '@/app/portal/fees/fees.css' // Import shared glassmorphic theme

export const dynamic = 'force-dynamic'

export default async function PortalCertificatesPage() {
  const jwt = await requireRole(['student'])
  
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('id, skf_id, programs(name, type), belt_level, completion_date, issuer_name, certificate_unlocked, status')
    .eq('skf_id', jwt.skfId)
    .order('completion_date', { ascending: false })

  const mapped = (enrollments || []).map(e => ({
    id: e.id,
    enrollmentId: e.id,
    skfId: e.skf_id,
    programName: e.programs?.name || 'Program',
    programType: e.programs?.type || 'training',
    beltLevel: e.belt_level,
    completionDate: e.completion_date,
    issuerName: e.issuer_name,
    unlocked: e.certificate_unlocked
  }))

  return (
    <div className="fees-page-wrapper">
      <div className="fees-container">
        <h1 className="fees-title">Digital Certificates</h1>
        <p className="fees-subtitle">A verified record of your completed programs, exams, and camps.</p>
        
        <div style={{ marginTop: '2rem' }}>
          <CertificatesClient initialCertificates={mapped} skfId={jwt.skfId!} />
        </div>
      </div>
    </div>
  )
}
