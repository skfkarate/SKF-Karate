import Link from 'next/link'
import { FaShieldAlt, FaBolt, FaArrowRight, FaStar, FaPhoneAlt, FaTrophy, FaMedal } from 'react-icons/fa'
import { GiBlackBelt, GiPunch } from 'react-icons/gi'
import Counter from './components/Counter'
import HeroActions from './components/HeroActions'
import Testimonials from './components/Testimonials'
import BookTrialCTA from './components/BookTrialCTA'
import TournamentCard from './components/results/TournamentCard'
import { getFeaturedTournaments, getTournamentStats } from '../lib/data/tournaments'
import Image from 'next/image'
import './home.css'
import './results/results.css'

export default function HomePage() {
  const featuredTournaments = getFeaturedTournaments()
  const stats = getTournamentStats()

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
          <Counter target={5100} label="Active Students" />
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

      {/* ===== TESTIMONIALS ===== */}
      {/* <Testimonials /> */}

      {/* ===== CHAMPIONSHIP RECORD ===== */}
      <section className="section championship-record">
        <div className="glow glow-red championship-record__glow"></div>
        <div className="container">
          <div className="championship-record__header">
            <span className="section-label"><FaTrophy /> Championship Record</span>
            <h2 className="section-title">{stats.totalMedals}+ Champions. One <span className="text-gradient">Legacy.</span></h2>
            <p className="section-subtitle">
              From local dojos to national arenas — our athletes
              carry the SKF spirit to every podium.
            </p>
          </div>

          <div className="championship-record__stats">
            <div className="championship-record__stat">
              <span className="championship-record__stat-number">{stats.totalTournaments}</span>
              <span className="championship-record__stat-label">Tournaments</span>
            </div>
            <div className="championship-record__stat">
              <span className="championship-record__stat-number">{stats.totalGold}</span>
              <span className="championship-record__stat-label">Gold Medals</span>
            </div>
            <div className="championship-record__stat">
              <span className="championship-record__stat-number">{stats.totalTournaments}</span>
              <span className="championship-record__stat-label">State Champions</span>
            </div>
            <div className="championship-record__stat">
              <span className="championship-record__stat-number">{stats.nationalChampions}</span>
              <span className="championship-record__stat-label">National Champions</span>
            </div>
          </div>

          {featuredTournaments.length > 0 && (
            <div className="championship-record__cards">
              {featuredTournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          )}

          <div className="championship-record__cta">
            <Link href="/results" className="btn btn-primary">
              View Full Championship Record <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STUDENT LOOKUP ===== */}


      {/* ===== CAMP CTA ===== */}
      <section className="section camp-cta">
        <div className="glow glow-gold camp-cta__glow"></div>
        <div className="container camp-cta__inner">
          <div className="camp-cta__content">
            <span className="section-label camp-cta__label">Limited Slots</span>
            <h2 className="section-title">Summer Camp <span className="text-gold">2026</span></h2>
            <p className="section-subtitle">
              Transform your summer into a season of strength, discipline, and massive personal growth.
              Don&apos;t miss this opportunity.
            </p>
            <div className="camp-cta__actions">
              <Link href="/summer-camp" className="btn btn-primary">
                View Camp Details <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="camp-cta__visual">
            <div className="camp-cta__ring">
              <GiBlackBelt className="camp-cta__belt-icon" />
            </div>
          </div>
        </div>
      </section>
      {/* ===== BOOK TRIAL CTA ===== */}
      <BookTrialCTA />
    </div>
  )
}
