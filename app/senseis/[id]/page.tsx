import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCamera,
  FaEnvelope,
  FaMedal,
  FaTrophy,
} from 'react-icons/fa'
import { GiBlackBelt, GiKatana } from 'react-icons/gi'

import { getSenseiBySlugLive } from '@/lib/server/repositories/senseis-live'

import './sensei-profile.css'

export const dynamic = 'force-dynamic'

const bgMap: Record<string, string> = {
  gold: 'linear-gradient(135deg, rgba(255,183,3,0.1), transparent)',
  crimson: 'linear-gradient(135deg, rgba(214,40,40,0.1), transparent)',
  blue: 'linear-gradient(135deg, rgba(63,81,181,0.1), transparent)',
  neutral: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)',
}

function getProfileIcon(slug: string) {
  return slug.includes('akira') ? <GiKatana className="stat-icon" /> : <GiBlackBelt className="stat-icon" />
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sensei = await getSenseiBySlugLive(id)

  if (!sensei) {
    return { title: 'Sensei Not Found' }
  }

  return {
    title: `${sensei.name} — SKF Sensei Profile`,
    description: sensei.description,
  }
}

export default async function SenseiProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const master = await getSenseiBySlugLive(id)

  if (!master || !master.isPublic || !master.isActive) {
    notFound()
  }

  const primaryAssignments = master.assignments.slice(0, 3)
  const primaryLocation =
    primaryAssignments.length > 0
      ? primaryAssignments.map((assignment) => `${assignment.branchName} (${assignment.cityName})`).join(' • ')
      : 'SKF Karate'

  return (
    <div className="sensei-profile-page">
      <section
        className="page-hero profile-hero"
        style={{ background: bgMap[master.accent] || bgMap.gold }}
      >
        <div className="container">
          <Link href="/senseis" className="back-link">
            <FaArrowLeft /> Back to Council of Masters
          </Link>

          <div className="profile-hero__grid">
            <div className="profile-hero__image-wrapper">
              <div className={`profile-hero__image-placeholder ring-${master.accent === 'neutral' ? 'gold' : master.accent}`}>
                {master.imageUrl ? (
                  <Image
                    src={master.imageUrl}
                    alt={master.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="photo-placeholder-icon">
                    <FaCamera />
                    <span>Portrait Photo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-hero__content">
              <span className="profile-hero__dan">{master.dan}</span>
              <h1 className="profile-hero__name">{master.name}</h1>
              <span className="profile-hero__role">{master.role}</span>

              <div className="profile-hero__quick-stats">
                <div className="quick-stat">
                  {getProfileIcon(master.slug)}
                  <div>
                    <strong>Specialty</strong>
                    <span>{master.specialty}</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <FaCalendarAlt className="stat-icon" />
                  <div>
                    <strong>Experience</strong>
                    <span>{master.experience || 'SKF Coaching Team'}</span>
                  </div>
                </div>
              </div>

              <div className="profile-hero__bio glass-card">
                <p>{master.fullBio}</p>
              </div>

              <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
                <strong style={{ color: '#fff' }}>Training Centres:</strong> {primaryLocation}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section achievements-section section--tint-mid">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">
              <FaTrophy /> Honors
            </span>
            <h2 className="section-title">
              Career <span className="text-gradient">Achievements</span>
            </h2>
          </div>

          <div className="achievements-grid">
            {(master.achievements.length > 0 ? master.achievements : [master.description]).map(
              (achievement, idx) => (
                <div className="glass-card achievement-card" key={`${master.id}-${idx}`}>
                  <div className={`achievement-icon icon-glow-${master.accent === 'neutral' ? 'gold' : master.accent}`}>
                    <FaMedal />
                  </div>
                  <h3>{achievement}</h3>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section gallery-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">
              <FaCamera /> Branch Links
            </span>
            <h2 className="section-title">
              Train Under <span className="text-gradient">{master.name}</span>
            </h2>
          </div>

          <div className="action-gallery-grid">
            {primaryAssignments.length > 0 ? (
              primaryAssignments.map((assignment) => (
                <Link
                  key={`${assignment.citySlug}-${assignment.branchSlug}`}
                  href={`/classes/${assignment.citySlug}/${assignment.branchSlug}`}
                  className="gallery-placeholder glass-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <FaCamera className="placeholder-cam" />
                  <span>{assignment.branchName}</span>
                </Link>
              ))
            ) : (
              <div className="gallery-placeholder glass-card">
                <FaCamera className="placeholder-cam" />
                <span>Branch assignment coming soon</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section profile-cta section--tint-cool">
        <div className="container">
          <div className="glass-card profile-cta__inner">
            <h2 className="section-title">Train with {master.name.split(' ')[1] || master.name}</h2>
            <p className="section-subtitle">
              Ready to learn {master.specialty.toLowerCase()} under the direct guidance of{' '}
              {master.name}? Reach out to inquire about class schedules and branch availability.
            </p>
            <div className="profile-cta__actions">
              <Link href="/contact" className="btn btn-primary">
                <FaEnvelope /> Inquire About Classes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
