'use client'

import Link from 'next/link'
import { FaCalendarCheck, FaArrowRight, FaPhoneAlt } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './BookTrialCTA.css'

export default function BookTrialCTA() {
  return (
    <section className="trial-cta">
      {/* Animated background elements */}
      <div className="trial-cta__bg">
        <div className="trial-cta__glow trial-cta__glow--1"></div>
        <div className="trial-cta__glow trial-cta__glow--2"></div>
        <div className="trial-cta__glow trial-cta__glow--3"></div>
        <div className="trial-cta__grid-overlay"></div>
      </div>

      <div className="container trial-cta__container">
        {/* Left side — content */}
        <div className="trial-cta__content">
          <span className="section-label"><FaCalendarCheck /> Free Trial Class</span>
          <h2 className="trial-cta__title">
            Step on the Mat.<br />
            <span className="text-gradient">Feel the Difference.</span>
          </h2>
          <p className="trial-cta__desc">
            One class is all it takes. Join a complimentary 60-minute session —
            meet our Senseis, experience the discipline, and discover why 5,100+ students
            call SKF Karate home.
          </p>

          <div className="trial-cta__features">
            <div className="trial-cta__feature">
              <span className="trial-cta__feature-dot"></span>
              No commitment required
            </div>
            <div className="trial-cta__feature">
              <span className="trial-cta__feature-dot"></span>
              All ages welcome (3+)
            </div>
            <div className="trial-cta__feature">
              <span className="trial-cta__feature-dot"></span>
              Explore a new discipline
            </div>
          </div>

          <div className="trial-cta__actions">
            <Link href="/contact?subject=Trial%20Class" className="btn btn-primary trial-cta__btn-primary">
              Book Free Trial <FaArrowRight />
            </Link>
            <a href="tel:+919019971726" className="btn btn-secondary trial-cta__btn-secondary">
              <FaPhoneAlt /> Call Now
            </a>
          </div>
        </div>

        {/* Right side — visual element */}
        <div className="trial-cta__visual">
          <div className="trial-cta__ring trial-cta__ring--outer">
            <div className="trial-cta__ring trial-cta__ring--middle">
              <div className="trial-cta__ring trial-cta__ring--inner">
                <GiBlackBelt className="trial-cta__belt-icon" />
              </div>
            </div>
          </div>
          <div className="trial-cta__stat trial-cta__stat--1">
            <span className="trial-cta__stat-number">5,100+</span>
            <span className="trial-cta__stat-label">Active Students</span>
          </div>
          <div className="trial-cta__stat trial-cta__stat--2">
            <span className="trial-cta__stat-number">15+</span>
            <span className="trial-cta__stat-label">Years Legacy</span>
          </div>
        </div>
      </div>
    </section>
  )
}
