import Link from 'next/link'
import { FaShieldAlt, FaBolt, FaArrowRight, FaStar, FaPhoneAlt } from 'react-icons/fa'
import { GiPunch } from 'react-icons/gi'
import Counter from './components/Counter'
import HeroActions from './components/HeroActions'
import BookTrialCTA from './components/BookTrialCTA'
import './home.css'

export default function HomePage() {
  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero__bg">
          <div className="glow glow-red hero__glow-1"></div>
          <div className="glow glow-gold hero__glow-2"></div>
          <div className="glow glow-blue hero__glow-3"></div>
          <div className="hero__grid-overlay"></div>
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

          <HeroActions />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats">
        <div className="container stats__grid">
          <Counter target={5100} label="Active Athletes" />
          <div className="stats__divider"></div>
          <Counter target={20} label="Expert Instructors" />
          <div className="stats__divider"></div>
          <Counter target={15} label="Years of Excellence" />
          <div className="stats__divider"></div>
          <Counter target={300} label="Championships Won" />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section features">
        <div className="glow glow-red features__glow"></div>
        <div className="container">
          <div className="features__header">
            <span className="section-label"><FaStar /> Why SKF Karate</span>
            <h2 className="section-title">Built on <span className="text-gradient">Excellence</span></h2>
            <p className="section-subtitle">
              More than a dojo — SKF Karate is a movement dedicated to transforming lives through
              the art and discipline of martial arts.
            </p>
          </div>

          <div className="features__grid">
            <Link href="/about" className="glass-card feature-card">
              <div className="feature-card__icon"><FaShieldAlt /></div>
              <h3>Standardized Training</h3>
              <p>Internationally recognized curriculum with structured belt progression and certified instruction.</p>
              <span className="feature-card__arrow"><FaArrowRight /></span>
            </Link>

            <Link href="/about" className="glass-card feature-card feature-card--accent">
              <div className="feature-card__icon"><GiPunch /></div>
              <h3>Combat Excellence</h3>
              <p>From kata precision to controlled sparring — develop real-world martial arts mastery.</p>
              <span className="feature-card__arrow"><FaArrowRight /></span>
            </Link>

            <Link href="/about" className="glass-card feature-card">
              <div className="feature-card__icon"><FaBolt /></div>
              <h3>Elite Conditioning</h3>
              <p>Modern sports science fused with traditional discipline to build peak physical performance.</p>
              <span className="feature-card__arrow"><FaArrowRight /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BOOK TRIAL CTA ===== */}
      <BookTrialCTA />
    </div>
  )
}
