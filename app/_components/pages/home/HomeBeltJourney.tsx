'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Layers, ArrowRight } from 'lucide-react'
import SectionReveal from './SectionReveal'
import { BELT_JOURNEY_SECTION } from '@/data/constants/homeContent'

export default function HomeBeltJourney() {
  const trackRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  })

  // Progress line that fills as you scroll through the section
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%'])

  return (
    <section className="home-belt-journey section section--tint-cool" id="belt-journey">
      <div className="container">
        <SectionReveal className="home-belt-journey__header">
          <SectionReveal.Item>
            <span className="section-label">
              <Layers size={14} /> {BELT_JOURNEY_SECTION.LABEL}
            </span>
          </SectionReveal.Item>
          <SectionReveal.Item>
            <h2 className="section-title">
              {BELT_JOURNEY_SECTION.TITLE_1}{' '}
              <span className="text-gradient">{BELT_JOURNEY_SECTION.TITLE_ACCENT}</span>
            </h2>
          </SectionReveal.Item>
          <SectionReveal.Item>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              {BELT_JOURNEY_SECTION.SUBTITLE}
            </p>
          </SectionReveal.Item>
        </SectionReveal>

        <div className="home-belt-journey__track" ref={trackRef}>
          {/* Animated progress line */}
          <div className="home-belt-journey__line-container" aria-hidden="true">
            <div className="home-belt-journey__line-bg" />
            <motion.div
              className="home-belt-journey__line-fill"
              style={{ height: lineHeight }}
            />
          </div>

          {BELT_JOURNEY_SECTION.BELTS.map((belt, index) => (
            <motion.div
              key={belt.name}
              className={`home-belt-journey__step ${index % 2 === 0 ? 'home-belt-journey__step--left' : 'home-belt-journey__step--right'}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            >
              {/* Belt dot on the line */}
              <motion.div
                className="home-belt-journey__dot"
                style={{
                  background: belt.name === 'Black' 
                    ? 'linear-gradient(135deg, #333, #111)' 
                    : belt.name === 'White'
                    ? 'linear-gradient(135deg, #fff, #ddd)'
                    : `linear-gradient(135deg, ${belt.color}, ${belt.color}dd)`,
                  boxShadow: `0 0 20px ${belt.color}40`,
                  border: belt.name === 'Black' ? '2px solid rgba(255,255,255,0.2)' : 'none',
                }}
                whileInView={{ scale: [0, 1.2, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />

              {/* Card */}
              <div className="home-belt-journey__card">
                <div
                  className="home-belt-journey__belt-stripe"
                  style={{ background: belt.color === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : belt.color }}
                />
                <div className="home-belt-journey__card-content">
                  <span className="home-belt-journey__stage">{belt.stage}</span>
                  <h3 className="home-belt-journey__belt-name">
                    {belt.name} Belt
                  </h3>
                  <p className="home-belt-journey__meaning">{belt.meaning}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <SectionReveal className="home-belt-journey__cta">
          <SectionReveal.Item>
            <Link href="/grading" className="btn btn-secondary">
              Explore the Full Grading System <ArrowRight size={16} />
            </Link>
          </SectionReveal.Item>
        </SectionReveal>
      </div>
    </section>
  )
}
