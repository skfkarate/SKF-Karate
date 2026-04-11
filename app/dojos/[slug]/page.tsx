import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaArrowRight, FaCalendarAlt, FaSun } from 'react-icons/fa'
import { GiBlackBelt, GiJapan } from 'react-icons/gi'
import { getDojoBySlug, allDojos } from '@/lib/data/dojos'
import FreeTrialForm from '@/components/FreeTrialForm'
import AnimatedSection from '@/components/AnimatedSection'
import '../dojos.css'

export const dynamicParams = false;

export function generateStaticParams() {
    return allDojos.map((dojo) => ({
        slug: dojo.slug,
    }))
}

export function generateMetadata({ params }) {
    const dojo = getDojoBySlug(params.slug)
    if (!dojo) return { title: 'Dojo Not Found | SKF Karate' }
    return {
        title: `${dojo.name} | SKF Karate Branches`,
        description: dojo.desc,
    }
}

export default function DojoDetailPage({ params }) {
    const dojo = getDojoBySlug(params.slug)

    if (!dojo) {
        notFound()
    }

    const dojoSchema = {
      "@context": "https://schema.org",
      "@type": ["SportsOrganization", "LocalBusiness"],
      "name": `SKF Karate — ${dojo.name}`,
      "image": dojo.images?.[0] || `${process.env.NEXT_PUBLIC_APP_URL || 'https://skfkarate.org'}/og-default.jpg`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": dojo.address,
        "addressLocality": "Bangalore",
        "addressRegion": "Karnataka",
        "postalCode": dojo.pincode,
        "addressCountry": "IN"
      },
      "telephone": dojo.phone,
      "openingHoursSpecification": (dojo.batches || []).map((batch: any) => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": batch.days,
        "opens": batch.time.split(' - ')[0] || "17:00",
        "closes": batch.time.split(' - ')[1] || "19:00"
      })),
      "sport": "Karate",
      "priceRange": "₹₹"
    }

    return (
        <div className="dojos-page">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(dojoSchema) }}
            />
            {/* HERO */}
            <section className="page-hero dojos-hero pb-standard pt-huge">
                <div className="page-hero__bg opacity-40"></div>
                <div className="container page-hero__content">
                    <span className="section-label hero-label-pulse"><FaMapMarkerAlt /> Branch Details</span>
                    <h1 className="page-hero__title hero-title-fluid">
                        {dojo.name.split(' ')[0]} <span className="text-gradient">{dojo.name.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="page-hero__subtitle contained-subtitle">
                        {dojo.desc}
                    </p>
                </div>
            </section>

            <div className="container mb-standard pb-standard">
                
                {/* DOJO → TIMETABLE (Prominent View Schedule near the top) */}
                <div className="glass-card mb-huge center-text padded-card action-card">
                    <div className="action-card-glow-gold"></div>
                    <FaCalendarAlt size={32} color="var(--gold)" className="mb-small mt-small" />
                    <h2 className="section-title-sm text-primary mb-small">Training Schedule</h2>
                    <p className="text-secondary max-w-md mx-auto mb-standard">
                        View this month's detailed timings and class divisions for {dojo.name}.
                    </p>
                    <Link href={`/timetable/${dojo.slug}`} className="btn btn-primary large-action-btn">
                        View {new Date().toLocaleString('default', { month: 'long' })} Training Schedule <FaArrowRight />
                    </Link>
                </div>

                <div className="hq-card mb-huge">
                    <div className="hq-card__visual">
                        <div className="hq-image-placeholder">
                            <GiJapan className="hq-bg-icon" />
                            <div className="hq-badge" style={{ color: `var(--${dojo.color})` }}>
                                <GiBlackBelt /> {dojo.name}
                            </div>
                        </div>
                    </div>
                    <div className="hq-card__content">
                        <span className="hq-label">Branch Information</span>
                        <h2 className="hq-name">{dojo.name}</h2>
                        
                        <div className="hq-details-grid">
                            <div className="hq-detail-item">
                                <FaMapMarkerAlt className={`hq-icon text-${dojo.color}`} />
                                <div>
                                    <strong>Location</strong>
                                    <span>{dojo.address}</span>
                                </div>
                            </div>
                            <div className="hq-detail-item">
                                <FaClock className={`hq-icon text-${dojo.color}`} />
                                <div>
                                    <strong>Timings</strong>
                                    <span>{dojo.timings}</span>
                                </div>
                            </div>
                            <div className="hq-detail-item">
                                <FaPhoneAlt className={`hq-icon text-${dojo.color}`} />
                                <div>
                                    <strong>Contact</strong>
                                    <span>{dojo.phone}</span>
                                </div>
                            </div>
                            <div className="hq-detail-item">
                                <GiBlackBelt className={`hq-icon text-${dojo.color}`} />
                                <div>
                                    <strong>Ages Allowed</strong>
                                    <span>{dojo.ages.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hq-actions">
                            <Link href="/contact" className="btn btn-outline-dynamic">
                                Join Branch
                            </Link>
                        </div>
                    </div>
                </div>

                {/* DOJO → SUMMER CAMP */}
                <div className="glass-card mb-huge center-text padded-card camp-promo-card">
                    <FaSun size={32} color="var(--crimson)" className="mb-small mt-small" />
                    <h2 className="section-title-sm text-primary mb-small">Summer Camp 2026</h2>
                    <p className="text-secondary max-w-md mx-auto mb-standard">
                        Enrollment is open! Secure your spot for the high-intensity summer training bloc at {dojo.name}.
                    </p>
                    <Link href={`/summer-camp?branch=${dojo.slug}`} className="btn btn-primary">
                        Summer Camp at {dojo.name} <FaArrowRight />
                    </Link>
                </div>

                {/* DOJO → SENSEIS */}
                <div className="glass-card center-text padded-card">
                    <h2 className="section-title-sm text-primary mb-small">Lead Instructor</h2>
                    <p className="text-secondary max-w-md mx-auto mb-standard">
                        Train under the direct guidance of {dojo.sensei}.
                    </p>
                    <Link href={`/senseis/${dojo.senseiId}`} className="btn btn-outline-dynamic" style={{ borderColor: `var(--${dojo.color})`, color: `var(--${dojo.color})` }}>
                        View {dojo.sensei}'s Profile <FaArrowRight />
                    </Link>
                </div>

                {/* DOJO → FREE TRIAL */}
                <AnimatedSection className="glass-card mt-small center-text padded-card">
                    <h2 className="section-title-sm text-primary mb-small">Try a Class at {dojo.name}</h2>
                    <p className="text-secondary max-w-md mx-auto mb-standard">
                        Experience the training environment with a free trial session.
                    </p>
                    <div className="mx-auto" style={{ textAlign: 'left', maxWidth: '700px' }}>
                        <FreeTrialForm branch={dojo.slug as any} />
                    </div>
                </AnimatedSection>
            </div>
        </div>
    )
}
