'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Target } from 'lucide-react'
import SectionReveal from './SectionReveal'
import { PHILOSOPHY_SECTION } from '@/data/constants/homeContent'

export default function HomePhilosophy() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40])
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98])

  return (
    <section
      ref={sectionRef}
      className="home-philosophy section section--tint-warm"
      id="philosophy"
    >
      <div className="container">
        <div className="home-philosophy__layout">
          {/* Image column with parallax */}
          <motion.div
            className="home-philosophy__image-col"
            style={{ y: imageY, scale: imageScale }}
          >
            <div className="home-philosophy__image-wrapper">
              <Image
                src="/gallery/In Dojo.jpeg"
                alt="SKF Karate training in the dojo"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
                className="home-philosophy__image"
              />
              <div className="home-philosophy__image-overlay" />

              {/* Floating stats cards on image */}
              <motion.div
                className="home-philosophy__floating-stat home-philosophy__floating-stat--1"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <span className="home-philosophy__floating-number">{PHILOSOPHY_SECTION.STAT_YEARS}</span>
                <span className="home-philosophy__floating-label">{PHILOSOPHY_SECTION.STAT_YEARS_LABEL}</span>
              </motion.div>

              <motion.div
                className="home-philosophy__floating-stat home-philosophy__floating-stat--2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.7 }}
              >
                <span className="home-philosophy__floating-number">{PHILOSOPHY_SECTION.STAT_BELTS}</span>
                <span className="home-philosophy__floating-label">{PHILOSOPHY_SECTION.STAT_BELTS_LABEL}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Text column */}
          <SectionReveal className="home-philosophy__text-col">
            <SectionReveal.Item>
              <span className="section-label">
                <Target size={14} /> {PHILOSOPHY_SECTION.LABEL}
              </span>
            </SectionReveal.Item>

            <SectionReveal.Item>
              <h2 className="section-title">
                {PHILOSOPHY_SECTION.TITLE_1}{' '}
                <span className="text-gradient">{PHILOSOPHY_SECTION.TITLE_ACCENT}</span>
              </h2>
            </SectionReveal.Item>

            <SectionReveal.Item>
              <p className="home-philosophy__body">
                {PHILOSOPHY_SECTION.BODY}
              </p>
            </SectionReveal.Item>

            <SectionReveal.Item>
              <div className="home-philosophy__divider" />
            </SectionReveal.Item>

            <SectionReveal.Item>
              <div className="home-philosophy__values-row">
                {['Discipline', 'Respect', 'Excellence'].map((value) => (
                  <div key={value} className="home-philosophy__value">
                    <div className="home-philosophy__value-dot" />
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </SectionReveal.Item>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
