'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { CalendarCheck, ArrowRight, Phone } from 'lucide-react'
import { homeBookTrialCTAFeatures } from '@/data/constants/homeContent'

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function HomeBookTrialCTA() {
  return (
    <section className="trial-cta" id="book-trial-cta">
      {/* Cinematic Background Image Layer */}
      <div
        className="trial-cta__bg"
        style={{ backgroundImage: "url('/gallery/In Dojo.jpeg')" }}
      />
      <div className="trial-cta__overlay" />

      <div className="container trial-cta__container">
        <motion.div
          className="trial-cta__content"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span
            className="section-label"
            style={{
              color: 'var(--gold)',
              borderColor: 'rgba(255, 183, 3, 0.3)',
              background: 'rgba(255, 183, 3, 0.1)',
            }}
            variants={item}
          >
            <CalendarCheck size={14} /> BECOME A CHAMPION
          </motion.span>

          <motion.h2 className="trial-cta__title" variants={item}>
            STEP ON THE MAT.
            <br />
            <span className="text-gradient">FEEL THE DIFFERENCE.</span>
          </motion.h2>

          <motion.p className="trial-cta__desc" variants={item}>
            One class is all it takes to ignite your potential. Join a
            complimentary 60-minute session—train with world-class Senseis,
            experience true discipline, and discover why we are the ultimate
            destination for martial arts excellence.
          </motion.p>

          <motion.div className="trial-cta__features" variants={item}>
            {homeBookTrialCTAFeatures.map((feature, idx) => (
              <div key={idx} className="trial-cta__feature">
                <span className="trial-cta__feature-dot" /> {feature}
              </div>
            ))}
          </motion.div>

          <motion.div className="trial-cta__actions" variants={item}>
            <Link
              href="/contact?subject=Trial%20Class"
              className="btn btn-primary trial-cta__btn-primary"
            >
              Book Free Trial <ArrowRight size={16} />
            </Link>
            <a
              href="tel:+919019971726"
              className="btn btn-secondary trial-cta__btn-secondary"
            >
              <Phone size={16} /> +91 90199 71726
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
