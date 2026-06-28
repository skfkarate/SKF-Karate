import Link from 'next/link'
import { CheckCircle2, Download, ShieldCheck, XCircle } from 'lucide-react'

import { CertificateCanvas } from '@/components/CertificateCanvas'
import type { CertificateData } from '@/lib/certificates/CertificateRenderer'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import { buildNoIndexMetadata } from '@/data/constants/seo'
import '../../[skfId]/[enrollmentId]/verify.css'

export const metadata = buildNoIndexMetadata(
  '/verify/c',
  'Official SKF Karate certificate verification with certificate registration number, QR code, student identity, and program authenticity.'
)

function InvalidCertificate({ reason }: { reason?: string }) {
  return (
    <div className="verify-page verify-page--wide">
      <div className="verify-container">
        <div className="verify-header">
          <div className="verify-seal">
            <XCircle size={44} className="text-red-500" />
          </div>
          <h1>Certificate Not Verified</h1>
          <p className="verify-subtitle">SKF Karate official registry</p>
        </div>

        <div className="verify-card verify-card--error">
          <div className="verify-status-banner">
            <XCircle size={24} />
            <h2>Invalid or unavailable certificate</h2>
          </div>
          <div className="verify-card-body">
            <div className="verify-error">
              <p>
                {reason || 'We could not verify this certificate in the official SKF Karate registry.'}
              </p>
              <div className="verify-help-box">
                <p>Please check:</p>
                <ul>
                  <li>The QR code was scanned completely.</li>
                  <li>The certificate has not been revoked.</li>
                  <li>The certificate has been officially issued by SKF Karate.</li>
                </ul>
              </div>
              <div className="verify-actions">
                <Link href="/verify" className="verify-btn verify-btn--outline">Try Manual Search</Link>
                <Link href="/contact" className="verify-btn verify-btn--primary">Contact SKF</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function loadCertificate(code: string) {
  const renderer = new CertificateRenderer()

  try {
    const data = await renderer.getDataByVerificationCode(code)
    return { data, reason: undefined }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return {
	      data: null,
	      reason: message === 'CERTIFICATE_REVOKED'
	        ? 'This certificate exists, but it has been revoked by SKF Karate.'
	        : message === 'CERTIFICATE_NOT_ISSUED'
	          ? 'This certificate is registered with SKF Karate, but it has not been published for public verification yet.'
	        : undefined,
	    }
	  }
}

function VerifiedCertificate({ code, data }: { code: string; data: CertificateData }) {
  return (
    <div className="verify-page verify-page--wide">
      <div className="verify-container verify-container--wide">
        <div className="verify-header">
          <div className="verify-seal">
            <ShieldCheck size={44} className="text-green-500" />
          </div>
          <h1>Certificate Verified</h1>
          <p className="verify-subtitle">Official SKF Karate registry</p>
        </div>

        <div className="verify-certificate-layout">
          <div className="verify-preview-panel">
            <CertificateCanvas
              data={data}
              className="verify-certificate-canvas"
            />
          </div>

          <div className="verify-card verify-card--success">
            <div className="verify-status-banner">
              <CheckCircle2 size={24} />
              <h2>Authentic Certificate</h2>
            </div>
            <div className="verify-card-body">
              <div className="verify-details">
                <div className="verify-col">
                  <span className="verify-label">Certificate Registration No.</span>
                  <span className="verify-value verify-highlight">{data.certificateNumber}</span>
                </div>

                <div className="verify-divider" />

                <div className="verify-col">
                  <span className="verify-label">Student Name</span>
                  <span className="verify-value">{data.studentName}</span>
                </div>

                <div className="verify-row">
                  <div className="verify-col">
                    <span className="verify-label">SKF ID</span>
                    <span className="verify-value">{data.skfId}</span>
                  </div>
                  <div className="verify-col text-right">
                    <span className="verify-label">Certificate Type</span>
                    <span className="verify-value">{data.certificateType.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="verify-col">
                  <span className="verify-label">Program</span>
                  <span className="verify-value">{data.programName}</span>
                </div>

                {data.beltLevel && (
                  <div className="verify-col">
                    <span className="verify-label">Rank / Belt</span>
                    <span className="verify-value">{data.beltLevel}</span>
                  </div>
                )}

                <div className="verify-row">
                  <div className="verify-col">
                    <span className="verify-label">Date</span>
                    <span className="verify-value">{data.completionDate}</span>
                  </div>
                  <div className="verify-col text-right">
                    <span className="verify-label">Issuer</span>
                    <span className="verify-value">{data.issuerName || 'SKF Karate'}</span>
                  </div>
                </div>
              </div>

              <div className="verify-actions verify-actions--stacked">
                <a href={`/api/certificates/verify/${encodeURIComponent(code)}/pdf`} className="verify-btn verify-btn--primary">
                  <Download size={16} /> Download PDF
                </a>
                <Link href={`/athlete/${data.skfId}`} className="verify-btn verify-btn--outline">
                  View Athlete Profile
                </Link>
              </div>

              <p className="verify-footer-note">
                This certificate was verified directly against the official SKF Karate certificate registry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function VerifyCodePage({ params }: { params: Promise<{ code: string }> | { code: string } }) {
  const { code } = await Promise.resolve(params)
  const result = await loadCertificate(code)

  if (!result.data) return <InvalidCertificate reason={result.reason} />

  return <VerifiedCertificate code={code} data={result.data} />
}
