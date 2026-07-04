import Link from 'next/link'
import {
  BadgeCheck,
  CalendarClock,
  Clock3,
  IdCard,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react'

import type { CertificateData } from '@/lib/certificates/CertificateRenderer'
import { CertificateRenderer } from '@/lib/certificates/CertificateRenderer'
import { buildNoIndexMetadata } from '@/data/constants/seo'
import { CertificatePublishingCountdown } from './CertificatePublishingCountdown'
import './certificate-publishing.css'

const CERTIFICATE_PUBLISH_TARGET_ISO = '2026-07-11T00:00:00+05:30'

export const metadata = buildNoIndexMetadata(
  '/verify/c',
  'Official SKF Karate certificate verification with certificate registration number, QR code, student identity, and program authenticity.'
)

/* ─── Invalid / Not Found State ─── */
function InvalidCertificate({ reason }: { reason?: string }) {
  return (
    <div className="cv-page">
      <div className="cv-orb cv-orb--1" />
      <div className="cv-orb cv-orb--2" />
      <div className="cv-orb cv-orb--3" />
      <div className="cv-card">
        <div className="cv-card__shine" />

        <div style={{ textAlign: 'center' }}>
          <div className="cv-seal" style={{ background: 'linear-gradient(135deg, #fca5a5, #ef4444)' }}>
            <XCircle size={32} />
          </div>

          <div className="cv-hero">
            <h1 className="cv-hero__title">Certificate Not Verified</h1>
            <p className="cv-hero__subtitle">
              {reason || 'We could not verify this certificate in the official SKF Karate registry.'}
            </p>
          </div>

          <div className="cv-divider" />

          <div className="cv-details">
            <div className="cv-detail-row">
              <ShieldCheck size={18} />
              <div className="cv-detail-row__content">
                <span className="cv-detail-row__label">What to check</span>
                <span className="cv-detail-row__value">The QR code was scanned completely and the certificate has been officially issued by SKF Karate.</span>
              </div>
            </div>
          </div>

          <div className="cv-actions" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/verify" className="cv-btn cv-btn--primary">Try Manual Search</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Data Loader ─── */
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

/* ─── Verified Certificate (Publishing Hold) ─── */
function VerifiedCertificate({ data }: { data: CertificateData }) {
  const firstName = data.studentName.split(/\s+/).filter(Boolean)[0] || 'Student'
  const publishDate = new Date(CERTIFICATE_PUBLISH_TARGET_ISO).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="cv-page">
      <div className="cv-orb cv-orb--1" />
      <div className="cv-orb cv-orb--2" />
      <div className="cv-orb cv-orb--3" />
      <div className="cv-card">
        <div className="cv-card__shine" />

        {/* Seal */}
        <div style={{ textAlign: 'center' }}>
          <div className="cv-seal" aria-hidden="true">
            <ShieldCheck size={32} />
          </div>

          {/* Status Chip */}
          <div className="cv-chip">
            <BadgeCheck size={13} />
            <span>Verified &bull; SKF Registry</span>
          </div>
        </div>

        {/* Hero */}
        <div className="cv-hero">
          <h1 className="cv-hero__title">
            {firstName}, your certificate is verified
          </h1>
          <p className="cv-hero__subtitle">
            The online certificate view is being prepared and will be published here soon.
          </p>

          <div className="cv-date-chip" style={{ display: 'inline-flex' }}>
            <Clock3 size={13} />
            <span>Expected: {publishDate}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="cv-countdown-section">
          <CertificatePublishingCountdown targetIso={CERTIFICATE_PUBLISH_TARGET_ISO} />
        </div>

        <div className="cv-divider" />

        {/* Details */}
        <div className="cv-details">
          <div className="cv-detail-row">
            <UserRound size={17} />
            <div className="cv-detail-row__content">
              <span className="cv-detail-row__label">Student</span>
              <span className="cv-detail-row__value">{data.studentName}</span>
            </div>
          </div>

          <div className="cv-detail-row">
            <IdCard size={17} />
            <div className="cv-detail-row__content">
              <span className="cv-detail-row__label">Certificate</span>
              <span className="cv-detail-row__value">{data.certificateNumber}</span>
            </div>
          </div>

          {data.beltLevel && (
            <div className="cv-detail-row">
              <BadgeCheck size={17} />
              <div className="cv-detail-row__content">
                <span className="cv-detail-row__label">Promoted Rank</span>
                <span className="cv-detail-row__value">{data.beltLevel}</span>
              </div>
            </div>
          )}

          <div className="cv-detail-row">
            <CalendarClock size={17} />
            <div className="cv-detail-row__content">
              <span className="cv-detail-row__label">Date</span>
              <span className="cv-detail-row__value">{data.completionDate}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cv-actions">
          <Link href={`/athlete/${data.skfId}`} className="cv-btn cv-btn--primary">
            View Athlete Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Route Handler ─── */
export default async function VerifyCodePage({ params }: { params: Promise<{ code: string }> | { code: string } }) {
  const { code } = await Promise.resolve(params)
  const result = await loadCertificate(code)

  if (!result.data) return <InvalidCertificate reason={result.reason} />

  return <VerifiedCertificate data={result.data} />
}
