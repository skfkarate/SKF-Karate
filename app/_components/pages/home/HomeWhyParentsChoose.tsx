'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, GraduationCap, Award, ArrowRight, CheckCircle } from 'lucide-react'
import SectionReveal from './SectionReveal'

const reasons = [
  {
    icon: <Shield size={28} />,
    number: '01',
    title: 'WKF Certified Academy',
    desc: 'World Karate Federation-affiliated. Every belt, every grade is internationally recognized and validated.',
    highlight: 'International Recognition',
  },
  {
    icon: <GraduationCap size={28} />,
    number: '02',
    title: 'Black Belt Instructors',
    desc: 'All classes led by certified Dan-graded black belt instructors with national and international competition experience.',
    highlight: 'Expert-Led Training',
  },
  {
    icon: <Award size={28} />,
    number: '03',
    title: 'Character Before Combat',
    desc: 'Discipline, respect, confidence, resilience — values forged on the mat that follow your child through life.',
    highlight: 'Values-Driven',
  },
]

export default function HomeWhyParentsChoose() {
  return (
    <section className="home-why-parents section section--tint-warm" id="why-skf">
      <div className="container">
        <div className="home-why-parents__layout">
          {/* Left: Section Header */}
          <SectionReveal className="home-why-parents__header-col">
            <SectionReveal.Item>
              <span className="section-label">
                <Shield size={14} /> Why SKF
              </span>
            </SectionReveal.Item>
            <SectionReveal.Item>
              <h2 className="section-title">
                Why Parents<br />Choose{' '}
                <span className="text-gradient">SKF</span>
              </h2>
            </SectionReveal.Item>
            <SectionReveal.Item>
              <p className="home-why-parents__intro">
                We don&apos;t just teach karate. We build champions with character, discipline, and an unbreakable spirit.
              </p>
            </SectionReveal.Item>
            <SectionReveal.Item>
              <Link href="/classes" className="btn btn-secondary">
                Find a Class <ArrowRight size={16} />
              </Link>
            </SectionReveal.Item>
          </SectionReveal>

          {/* Right: Reason Cards */}
          <div className="home-why-parents__cards">
            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                className="why-card-v2"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ x: -6, transition: { duration: 0.25 } }}
              >
                <div className="why-card-v2__number">{reason.number}</div>
                <div className="why-card-v2__icon">{reason.icon}</div>
                <div className="why-card-v2__body">
                  <div className="why-card-v2__badge">
                    <CheckCircle size={10} /> {reason.highlight}
                  </div>
                  <h3 className="why-card-v2__title">{reason.title}</h3>
                  <p className="why-card-v2__desc">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
