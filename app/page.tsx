import HomeHeroActions from '@/app/_components/pages/home/HomeHeroActions'
import HomeBookTrialCTA from '@/app/_components/pages/home/HomeBookTrialCTA'
import CinematicValues from '@/app/_components/CinematicValues'
import HomeClassesPreview from '@/app/_components/pages/home/HomeClassesPreview'
import HomeTopAthletes from '@/app/_components/pages/home/HomeTopAthletes'
import HomeWhyParentsChoose from '@/app/_components/pages/home/HomeWhyParentsChoose'
import HomeYourFirstClass from '@/app/_components/pages/home/HomeYourFirstClass'
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

      {/* ===== 1. HERO ===== */}
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

      {/* ===== 2. CINEMATIC VALUES ===== */}
      <CinematicValues />

      {/* ===== 3. CLASSES PREVIEW (City Cards) ===== */}
      <HomeClassesPreview />

      {/* ===== 4. TOP 3 ATHLETES ===== */}
      <HomeTopAthletes />

      {/* ===== 5. WHY PARENTS CHOOSE SKF ===== */}
      <HomeWhyParentsChoose />

      {/* ===== 6. YOUR FIRST CLASS ===== */}
      <HomeYourFirstClass />

      {/* ===== 7. FINAL CTA ===== */}
      <HomeBookTrialCTA />
    </div>
  )
}
