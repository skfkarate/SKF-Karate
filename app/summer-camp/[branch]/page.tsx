import Link from 'next/link'
import Image from 'next/image'
import { FaFire, FaShieldAlt, FaUsers, FaMapMarkerAlt, FaStar, FaQuoteLeft, FaQuestion, FaArrowRight, FaClock } from 'react-icons/fa'
import { GiNunchaku, GiBlackBelt } from 'react-icons/gi'
import { getSummerCampByBranch } from '@/lib/server/sheets'
import ScrollVideo from '@/app/_components/pages/summer-camp/SummerCampVideo'
import CountdownTimer from '@/app/_components/pages/summer-camp/SummerCampCountdownTimer'
import FAQSection from '@/app/_components/pages/summer-camp/SummerCampFAQ'
import CampPricingCards from '@/app/_components/pages/summer-camp/CampPricingCards'
import '../summer-camp.css'

export default async function BranchSummerCampPage({ params }: { params: { branch: string } }) {
    const branchName = params.branch.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    
    // Fetch data from Google Sheets "SummerCamp" tab
    const campData = await getSummerCampByBranch(branchName)

    return (
        <div className="camp-page">
            {/* ===== HERO ===== */}
            <section className="page-hero camp-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label camp-pulse" style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '0.6rem 1.5rem' }}>
                        <FaMapMarkerAlt style={{ marginRight: '8px' }} /> {branchName} Dojo
                    </span>
                    <h1 className="page-hero__title" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
                        Summer Camp <span className="text-gradient">2026</span>
                    </h1>
                    <p className="page-hero__subtitle" style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
                        Transform their summer at {branchName} with focus and real-world self-defense.
                    </p>
                    <div style={{ marginTop: '3rem' }}>
                        <CountdownTimer targetDate="2026-04-03T16:30:00+05:30" />
                    </div>
                </div>
            </section>

            {/* ===== PRICING TIERS (SSR to Client Component) ===== */}
            <section className="section" id="pricing" style={{ background: '#080b14', position: 'relative' }}>
                <div className="glow glow-gold" style={{ top: '10%' }}></div>
                <div className="container relative z-10">
                    <div className="center-text mb-huge">
                        <span className="section-label camp-pulse"><FaFire className="mr-half" /> Registration Open</span>
                        <h2 className="section-title">Secure Your <span className="text-gradient">Spot</span></h2>
                        <p className="section-subtitle mx-auto">
                            Slots are strictly limited. Select your preferred tier to enroll securely.
                        </p>
                    </div>

                    {!campData?.registrationOpen || campData.availableSlots <= 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--crimson)', background: 'rgba(214, 40, 40, 0.1)' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Registrations for {branchName} are now closed</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>All slots have been filled or the deadline has passed.</p>
                            <Link href="/contact" className="btn btn-primary">Contact Us for Waiting List</Link>
                        </div>
                    ) : (
                        <CampPricingCards branch={branchName} campData={campData} />
                    )}
                </div>
            </section>

            {/* ===== WHAT TO EXPECT ===== */}
            <section className="section benefits section--tint-mid">
                <div className="container">
                    <div className="center-text mb-huge">
                        <span className="section-label"><FaClock /> Camp Details</span>
                        <h2 className="section-title">What to <span className="text-gradient">Expect</span></h2>
                    </div>
                    <div className="benefits__grid">
                        <div className="benefit-card">
                            <div className="benefit-card__icon-badge"><FaShieldAlt /></div>
                            <div className="benefit-card__content">
                                <h4>Screen-Free Environment</h4>
                                <p>Swap smartphones for smart moves. We build focus, respect, and physical fitness in a highly disciplined environment.</p>
                            </div>
                        </div>
                        <div className="benefit-card benefit-card--highlight" style={{ border: '1px solid rgba(255,183,3,0.3)' }}>
                            <div className="benefit-card__icon-badge benefit-card__icon-badge--crimson"><GiNunchaku /></div>
                            <div className="benefit-card__content">
                                <h4>Real Ninja Skills</h4>
                                <p>Master the Nunchaku, learn cool self-defense strikes, and earn your summer camp belt certification!</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-card__icon-badge"><FaUsers /></div>
                            <div className="benefit-card__content">
                                <h4>Expert Supervision</h4>
                                <p>10+ years experienced Senseis ensuring a 100% safe, injury-free, and encouraging mat experience.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== RECENT CAMP VIDEO ===== */}
            <section className="section recent-camp">
                <div className="container">
                    <div className="recent-camp__header">
                        <span className="section-label"><FaStar /> The Experience</span>
                        <h2 className="section-title">Real Students. <span className="text-gradient">Real Progress.</span></h2>
                    </div>
                    <div className="recent-camp__video-wrapper">
                        <ScrollVideo />
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIAL ===== */}
            <section className="section testimonials section--tint-mid">
                <div className="container">
                    <div className="featured-quote glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <FaQuoteLeft className="featured-quote__icon" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
                        <h3 className="featured-quote__text" style={{ fontSize: '1.4rem' }}>
                            &quot;I was worried it would be too violent, but it&apos;s actually all about <strong className="text-gold">discipline, respect, and fitness</strong>. My 8-year-old absolutely loves it and even wakes up early to practice!&quot;
                        </h3>
                        <div className="featured-quote__author" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                            <div className="featured-quote__avatar">A</div>
                            <div className="featured-quote__info" style={{ textAlign: 'left' }}>
                                <strong>Anjali M.</strong>
                                <span>Parent of 8-year-old</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section className="section faq">
                <div className="container">
                    <div className="faq__header">
                        <span className="section-label"><FaQuestion /> General Queries</span>
                        <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
                    </div>
                    <FAQSection />
                </div>
            </section>
        </div>
    )
}
