import { getAthleteByRegistrationNumber } from '@/lib/server/repositories/athletes'
import Link from 'next/link'
import { CheckCircle2, XCircle, ShieldCheck, Search, Calendar, Award, User } from 'lucide-react'
import CertificateViewer from '@/components/CertificateViewer'
import './verify.css'

export const metadata = {
  title: 'Certificate Verification | SKF Karate',
  description: 'Verify the authenticity of SKF Karate certificates',
}

export default async function VerifyCertificatePage({ params }) {
  // Await params before using its properties in Next.js 15+
  const { skfId, enrollmentId } = await params
  
  // Clean the SKF ID (remove potentially added dashes if the QR code mangled it)
  const normalizedSkfId = skfId ? decodeURIComponent(skfId).trim().toUpperCase() : ''
  const athlete = getAthleteByRegistrationNumber(normalizedSkfId)

  // Certificate logic:
  // Since enrollments/certificates aren't fully migrated yet, we will look in the athlete's 'achievements' array.
  // We identify the relevant achievement based on 'enrollmentId' or match against the latest belt-grading.
  let isVerified = false
  let errorReason = ''
  let certificateDetails = null

  if (!athlete) {
    errorReason = `No athlete found with SKF ID: ${normalizedSkfId}`
  } else {
    // Find the achievement/enrollment that matches the enrollmentId
    const achievement = athlete.achievements?.find(a => a.id === enrollmentId)
    
    if (achievement) {
      if (achievement.type === 'belt-grading' || achievement.type === 'enrollment' || achievement.type.startsWith('tournament-')) {
        isVerified = true
        certificateDetails = {
          ...achievement,
          recipientName: `${athlete.firstName} ${athlete.lastName}`,
          programName: achievement.title || `${achievement.beltEarned} Belt Examination`,
          date: new Date(achievement.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
          completionDate: new Date(achievement.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
          issuerName: achievement.examiner || 'Sensei Arvind',
          skfId: athlete.registrationNumber,
          dojo: athlete.branchName
        }
      } else {
        errorReason = 'This record does not support digital certificates.'
      }
    } else {
      errorReason = `Certificate reference ID (${enrollmentId}) is invalid or has been revoked.`
    }
  }

  return (
    <main className="verify-page">
      <div className="verify-container">
        {/* DOJO SEAL / LOGO AREA */}
        <div className="verify-header">
          <div className="verify-seal">
            <ShieldCheck size={48} className={isVerified ? 'text-green-500' : 'text-red-500'} />
          </div>
          <h1>SKF Certificate Verification</h1>
          <p className="verify-subtitle">Global Authenticity Registry</p>
        </div>

        {/* RESULT CARD */}
        <div className={`verify-card ${isVerified ? 'verify-card--success' : 'verify-card--error'}`}>
          <div className="verify-status-banner">
            {isVerified ? (
              <>
                <CheckCircle2 size={24} className="verify-icon" />
                <h2>Certificate Verified</h2>
              </>
            ) : (
              <>
                <XCircle size={24} className="verify-icon" />
                <h2>Verification Failed</h2>
              </>
            )}
          </div>

          <div className="verify-card-body">
            {isVerified && certificateDetails ? (
              <div className="verify-details">
                <div className="verify-row">
                  <div className="verify-col">
                    <span className="verify-label"><User size={14} /> Issued To</span>
                    <strong className="verify-value verify-highlight">{certificateDetails.recipientName}</strong>
                  </div>
                  <div className="verify-col text-right">
                    <span className="verify-label"><Search size={14} /> SKF ID</span>
                    <strong className="verify-value">{certificateDetails.skfId}</strong>
                  </div>
                </div>

                <div className="verify-divider"></div>

                <div className="verify-row">
                  <div className="verify-col">
                    <span className="verify-label"><Award size={14} /> Program / Achievement</span>
                    <strong className="verify-value">{certificateDetails.programName}</strong>
                  </div>
                </div>

                <div className="verify-row">
                  <div className="verify-col">
                    <span className="verify-label"><Calendar size={14} /> Issue Date</span>
                    <strong className="verify-value">{certificateDetails.date}</strong>
                  </div>
                  <div className="verify-col text-right">
                    <span className="verify-label">Issued By</span>
                    <strong className="verify-value">{certificateDetails.issuerName}</strong>
                  </div>
                </div>
                
                <div className="verify-footer-note">
                  This certificate was issued by <strong>{certificateDetails.dojo} Dojo</strong> and is verified as authentic by the SKF Karate Board.
                </div>
              </div>
            ) : (
              <div className="verify-error">
                <p>{errorReason}</p>
                <div className="verify-help-box">
                  <p>If you believe this is an error:</p>
                  <ul>
                    <li>Check if the SKF ID and Certificate ID match exactly.</li>
                    <li>Ensure the certificate hasn't been revoked by the dojo.</li>
                    <li>Contact your instructor for support.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="verify-actions" style={{ marginTop: '1rem' }}>
          <Link href="/verify" className="verify-btn verify-btn--outline">
            Search Another Certificate
          </Link>
          {isVerified && (
            <Link href={`/athlete/${normalizedSkfId}`} className="verify-btn verify-btn--primary">
              View Athlete Profile
            </Link>
          )}
        </div>
        
        {/* DIGITAL CERTIFICATE CANVAS */}
        {isVerified && certificateDetails && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <h3 style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.9rem', marginBottom: '1rem' }}>Digital Certificate Replica</h3>
            <CertificateViewer enrollment={certificateDetails} student={{...athlete, registrationNumber: normalizedSkfId}} />
          </div>
        )}
      </div>
    </main>
  )
}
