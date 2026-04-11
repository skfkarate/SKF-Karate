import { supabaseAdmin } from '@/lib/server/supabase'
import { getStudentBySkfId } from '@/lib/server/sheets'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'

function getProgramRelation<T extends { name?: string }>(programs: T | T[] | null | undefined) {
  return Array.isArray(programs) ? programs[0] : programs
}

export async function generateMetadata({ params }: { params: { skfId: string, enrollmentId: string } }) {
  const { skfId, enrollmentId } = await params
  
  const { data } = await supabaseAdmin
    .from('enrollments')
    .select('programs(name)')
    .eq('id', enrollmentId)
    .eq('skf_id', skfId)
    .eq('certificate_unlocked', true)
    .single()

  if (!data) return { title: 'Certificate Verification Failed | SKF Karate' }

  const program = getProgramRelation(data.programs)

  return {
    title: `Verified SKF Certificate - ${program?.name}`,
    description: `Official verification of SKF Karate certification authenticity for ID: ${skfId}`,
    openGraph: {
      title: `Verified SKF Certificate - ${program?.name}`,
      description: 'Official SKF Karate Certification Authenticity Check'
    }
  }
}

export default async function VerifyCertificatePage({ params }: { params: { skfId: string, enrollmentId: string } }) {
  const { skfId, enrollmentId } = await params

  const { data: cert } = await supabaseAdmin
    .from('enrollments')
    .select('programs(name), belt_level, completion_date, issuer_name, status, certificate_unlocked')
    .eq('id', enrollmentId)
    .eq('skf_id', skfId)
    .single()

  const isValid = cert && cert.status === 'completed' && cert.certificate_unlocked

  if (!isValid) {
    return (
      <div style={{ minHeight: '100vh', background: '#05080f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#111', padding: '3rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center', maxWidth: '500px' }}>
          <XCircle size={64} style={{ color: '#e74c3c', marginBottom: '1rem', display: 'inline-block' }} />
          <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Certificate Not Found</h1>
          <p style={{ color: '#888', marginBottom: '2rem', lineHeight: 1.5 }}>
            We could not verify the authenticity of this certificate. It may have been revoked, pending approval, or the link is incorrect.
          </p>
          <a href="/contact" style={{ display: 'inline-block', color: 'var(--gold, #f39c12)', textDecoration: 'none', border: '1px solid var(--gold, #f39c12)', padding: '0.75rem 1.5rem', borderRadius: '4px' }}>
            Contact SKF Administration
          </a>
        </div>
      </div>
    )
  }

  let studentName = 'Unknown Student'
  try {
    const student = await getStudentBySkfId(skfId)
    if (student) studentName = student.name
  } catch {}

  const program = getProgramRelation(cert.programs)

  return (
    <div style={{ minHeight: '100vh', background: '#05080f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(10px)', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(46, 204, 113, 0.3)', boxShadow: '0 10px 40px rgba(46, 204, 113, 0.1)', maxWidth: '500px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <CheckCircle2 size={64} style={{ color: '#2ecc71', marginBottom: '1rem', display: 'inline-block' }} />
          <h1 style={{ color: '#2ecc71', fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>Certificate Verified</h1>
          <p style={{ color: '#888', margin: 0 }}>This credential has been officially verified by SKF Karate.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Name</span>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{studentName}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKF ID</span>
                <div style={{ color: '#fff', fontFamily: 'monospace' }}>{skfId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion Date</span>
                <div style={{ color: '#fff' }}>{new Date(cert.completion_date).toLocaleDateString('en-GB')}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Program Completed</span>
              <div style={{ color: '#f39c12', fontSize: '1.1rem', fontWeight: 600 }}>{program?.name}</div>
            </div>
            
            {cert.belt_level && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank Result</span>
                <div style={{ color: '#fff' }}>{cert.belt_level}</div>
              </div>
            )}

            <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{cert.issuer_name || 'SKF Administration'}</div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>Authorized Examiner</div>
              </div>
            </div>
          </div>
        </div>

        <Link href={`/athlete/${skfId}`} style={{ display: 'block', width: '100%', textAlign: 'center', background: 'linear-gradient(135deg, #c0392b, #96281b)', color: '#fff', textDecoration: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 15px rgba(192, 57, 43, 0.4)' }}>
          View Full Athlete Profile
        </Link>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.85rem' }}>Return to Home</a>
        </div>
      </div>
    </div>
  )
}
