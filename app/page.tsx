import Link from 'next/link'
import HomeHeroActions from '@/app/_components/pages/home/HomeHeroActions'
import HomeBookTrialCTA from '@/app/_components/pages/home/HomeBookTrialCTA'
import CinematicValues from '@/app/_components/CinematicValues'
import HomePathsOfMastery from '@/app/_components/pages/home/HomePathsOfMastery'
import AnimatedSection from '@/components/AnimatedSection'
import FreeTrialForm from '@/components/FreeTrialForm'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import './home.css'

export const metadata = {
  title: 'SKF Karate Classes in Bangalore | Expert Self-Defense Training',
  description: 'Join SKF Karate in Bangalore. We offer professional martial arts, self-defense classes for kids and adults, and WKF black belt grading. Book a free trial today!',
}

export default function HomePage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "SKF Karate",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://skfkarate.org",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://skfkarate.org"}/logo/SKF logo.png`,
    "sport": "Karate",
    "description": "WKF-affiliated karate federation in Bangalore",
    "address": { "@type": "PostalAddress", "addressLocality": "Bangalore", "addressCountry": "IN" },
    "sameAs": ["https://instagram.com/skfkarate"]
  }

  return (
    <div className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero__bg">
          <div className="glow glow-red hero__glow-1"></div>
          <div className="glow glow-gold hero__glow-2"></div>
          <div className="glow glow-blue hero__glow-3"></div>
          <div className="hero__watermark">空手</div>
        </div>

        <div className="container hero__content">
          <div className="hero__badge animate-in">Nothing is Impossible</div>

          <h1 className="hero__title animate-in delay-1">
            SKF <span className="text-gradient">KARATE</span>
          </h1>

          <p className="hero__subtitle animate-in delay-2">
            Sports Karate-do Fitness & Self Defence Association®
          </p>

          <p className="hero__desc animate-in delay-3">
            Where discipline meets excellence. Train with masters, compete with champions,
            and forge an unbreakable spirit.
          </p>

          <HomeHeroActions />
        </div>
      </section>

      {/* ===== CINEMATIC VALUES SCROLL ===== */}
      <CinematicValues />

      {/* ===== BRANCH TIMETABLE WIDGET ===== */}
      <AnimatedSection className="timetable-widget" /* keeping style via a wrapper or modifying later, wait AnimatedSection spreads className */>
        <div style={{ padding: '4rem 1rem', background: '#05080f', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '1.5rem', color: '#fff', textTransform: 'uppercase' }}>Find Your Branch Schedule</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { name: 'Koramangala HQ', slug: 'koramangala' },
            { name: 'Whitefield', slug: 'whitefield' },
            { name: 'JP Nagar', slug: 'jp-nagar' }
          ].map(branch => (
            <Link 
              key={branch.slug} 
              href={`/timetable/${branch.slug}`}
              style={{
                background: 'rgba(214, 40, 40, 0.1)',
                border: '1px solid var(--crimson, #d62828)',
                color: '#fff',
                padding: '0.8rem 1.5rem',
                borderRadius: '50px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(214,40,40,0.2)'
              }}
              className="hover:bg-[rgba(255,183,3,0.15)] hover:border-[var(--gold,#ffb703)] hover:-translate-y-[2px]"
            >
              {branch.name}
            </Link>
          ))}
        </div>
        </div>
      </AnimatedSection>

      {/* ===== UPCOMING CORE PAGES WIDGET ===== */}
      <AnimatedSection className="core-pages-widget">
        <div style={{ padding: '4rem 1rem', background: '#070b14' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '2.5rem', color: '#fff', textTransform: 'uppercase', textAlign: 'center' }}>
            Inside SKF Karate
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Athlete Rankings */}
            <Link href="/athlete" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, border-color 0.3s', textDecoration: 'none' }}
              className="hover:-translate-y-[5px] hover:border-[var(--gold)]"
            >
              <span style={{ fontSize: '2rem', marginBottom: '1rem' }}>🥇</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Athlete Rankings</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                View complete performance profiles, worldwide rankings, and the official honours board. 
              </p>
              <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Search Profile →</span>
            </Link>

            {/* Upcoming Events */}
            <Link href="/events" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, border-color 0.3s', textDecoration: 'none' }}
              className="hover:-translate-y-[5px] hover:border-[var(--crimson)]"
            >
              <span style={{ fontSize: '2rem', marginBottom: '1rem' }}>🥋</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Upcoming Events</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                Register for upcoming international tournaments, specialized seminars, and elite high-performance camps.
              </p>
              <span style={{ color: 'var(--crimson)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>View Calendar →</span>
            </Link>

            {/* Next Grading */}
            <Link href="/grading" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, border-color 0.3s', textDecoration: 'none' }}
              className="hover:-translate-y-[5px] hover:border-[#38bdf8]"
            >
              <span style={{ fontSize: '2rem', marginBottom: '1rem' }}>📜</span>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Kyu & Dan Grading</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                Track the pathway to mastery. Find examination dates and read the syllabus for your next belt test.
              </p>
              <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Book Grading →</span>
            </Link>

          </div>
        </div>
        </div>
      </AnimatedSection>

      {/* ===== TESTIMONIALS ===== */}
      <AnimatedSection className="testimonials-section">
        <div style={{ padding: '6rem 1rem', background: '#050a15', textAlign: 'center' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    What Our <span style={{ color: 'var(--gold, #ffb703)' }}>Family Says</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto 3rem', fontSize: '1.1rem' }}>
                    Real stories from real students and parents whose lives have been transformed by SKF Karate.
                </p>
                <TestimonialCarousel />
            </div>
        </div>
      </AnimatedSection>

      {/* ===== FREE TRIAL FORM ===== */}
      <AnimatedSection className="free-trial-section">
        <div style={{ padding: '6rem 1rem 8rem', background: 'linear-gradient(180deg, #050a15 0%, #000 100%)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '700px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: '#fff', textTransform: 'uppercase', marginBottom: '1rem', lineHeight: 1.1 }}>
                        Start Your <span style={{ color: 'var(--crimson, #dc3545)' }}>Journey</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                        Book a free trial class today. No commitments.
                    </p>
                </div>
                <FreeTrialForm />
            </div>
        </div>
      </AnimatedSection>

      {/* ===== BOOK TRIAL CTA ===== */}
      <HomeBookTrialCTA />
    </div>
  )
}
