import Link from 'next/link'
import { FaArrowRight, FaFire, FaPhoneAlt, FaQuestion, FaStar } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import SummerCampCountdownTimer from '@/app/_components/pages/summer-camp/SummerCampCountdownTimer'
import SummerCampFAQ from '@/app/_components/pages/summer-camp/SummerCampFAQ'
import SummerCampVideo from '@/app/_components/pages/summer-camp/SummerCampVideo'
import SummerCampBenefits from '@/app/_components/pages/summer-camp/SummerCampBenefits'
import SummerCampInstructor from '@/app/_components/pages/summer-camp/SummerCampInstructor'
import SummerCampLocation from '@/app/_components/pages/summer-camp/SummerCampLocation'
import SummerCampPrograms from '@/app/_components/pages/summer-camp/SummerCampPrograms'
import SummerCampTestimonials from '@/app/_components/pages/summer-camp/SummerCampTestimonials'
import './summer-camp.css'



export default function SummerCampPage() {
    return (
        <div className="camp-page">
            {/* ===== HERO ===== */}
            <section className="page-hero camp-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label camp-pulse"><FaFire /> Limited Slots Available</span>
                    <h1 className="page-hero__title">Summer Camp <span className="text-gradient">2026</span></h1>
                    <p className="page-hero__subtitle">
                        Transform their summer with focus and real-world self-defense.
                    </p>
                    <SummerCampCountdownTimer targetDate="2026-04-01T06:00:00+05:30" />
                </div>
            </section>

            <SummerCampBenefits />
            <SummerCampPrograms />
            <SummerCampLocation />
            <SummerCampInstructor />

            {/* ===== RECENT CAMP VIDEO ===== */}
            <section className="section recent-camp">
                <div className="container">
                    <div className="recent-camp__header">
                        <span className="section-label"><FaStar /> From Our Recent Camp</span>
                        <h2 className="section-title">We Taught. They <span className="text-gradient">Learned.</span></h2>
                        <p className="section-subtitle recent-camp__subtitle">
                            Here&apos;s a glimpse from our recent training camp — real athletes, real progress.
                        </p>
                    </div>

                    <div className="recent-camp__video-wrapper">
                        <SummerCampVideo />
                    </div>
                </div>
            </section>

            <SummerCampTestimonials />

            {/* ===== FAQ ===== */}
            <section className="section faq">
                <div className="container">
                    <div className="faq__header">
                        <span className="section-label"><FaQuestion /> FAQ</span>
                        <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
                        <p className="section-subtitle faq__subtitle">
                            Everything parents need to know before enrolling.
                        </p>
                    </div>
                    <SummerCampFAQ />
                </div>
            </section>

            {/* ===== BOTTOM CTA WITH WHATSAPP ===== */}
            <section className="section camp-bottom-cta">
                <div className="glow glow-red camp-bottom-cta__glow"></div>
                <div className="container">
                    <div className="camp-bottom-cta__inner glass-card">
                        <h2 className="section-title">Ready to Step on the Mat?</h2>
                        <p className="section-subtitle camp-bottom-cta__subtitle">
                            Enrollment is open but slots are limited. Secure your spot today.
                        </p>
                        <div className="camp-bottom-cta__buttons">
                            <Link href="/contact" className="btn btn-primary">Enroll Now <FaArrowRight /></Link>
                            <a href="tel:+919019971726" className="btn btn-secondary"><FaPhoneAlt /> Call Us</a>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}
