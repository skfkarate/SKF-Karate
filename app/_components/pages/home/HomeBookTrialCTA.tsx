'use client'

import Link from 'next/link'
import { FaCalendarCheck, FaArrowRight, FaPhoneAlt } from 'react-icons/fa'

export default function HomeBookTrialCTA() {
  return (
    <section className="trial-cta">
      {/* Cinematic Background Image Layer */}
      <div className="trial-cta__bg" style={{ backgroundImage: "url('/gallery/In Dojo.jpeg')" }}></div>
      <div className="trial-cta__overlay"></div>
      
      <div className="container trial-cta__container">
        <div className="trial-cta__content">
          <span className="section-label" style={{ color: "var(--gold)", borderColor: "rgba(255, 183, 3, 0.3)", background: "rgba(255, 183, 3, 0.1)" }}>
            <FaCalendarCheck /> BECOME A CHAMPION
          </span>
          <h2 className="trial-cta__title">
            STEP ON THE MAT.<br />
            <span className="text-gradient">FEEL THE DIFFERENCE.</span>
          </h2>
          <p className="trial-cta__desc">
            One class is all it takes to ignite your potential. Join a complimentary 60-minute session—train with world-class Senseis, experience true discipline, and discover why we are the ultimate destination for martial arts excellence.
          </p>

          <div className="trial-cta__features">
            <div className="trial-cta__feature">
              <span className="trial-cta__feature-dot"></span> No commitment required
            </div>
            <div className="trial-cta__feature">
              <span className="trial-cta__feature-dot"></span> All ages and skill levels welcome
            </div>
            <div className="trial-cta__feature">
              <span className="trial-cta__feature-dot"></span> Train under Grandmasters
            </div>
          </div>

          <div className="trial-cta__actions">
            <Link href="/contact?subject=Trial%20Class" className="btn btn-primary trial-cta__btn-primary">
              Book Free Trial <FaArrowRight />
            </Link>
            <a href="tel:+919019971726" className="btn btn-secondary trial-cta__btn-secondary">
              <FaPhoneAlt /> +91 90199 71726
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
