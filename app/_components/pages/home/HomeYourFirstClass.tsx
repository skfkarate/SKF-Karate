'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarCheck, Shirt, Users, Smile, ArrowRight } from 'lucide-react'
import SectionReveal from './SectionReveal'

const steps = [
  { icon: <CalendarCheck size={24} />, number: '01', title: 'Book Your Trial', desc: "Fill out a quick form or WhatsApp us. We'll confirm your slot within 24 hours." },
  { icon: <Shirt size={24} />, number: '02', title: 'Show Up', desc: 'Wear comfortable clothes. No special gear needed for your first class.' },
  { icon: <Users size={24} />, number: '03', title: 'Train with Champions', desc: 'A 60-minute guided session with a certified black belt instructor.' },
  { icon: <Smile size={24} />, number: '04', title: 'Join the Family', desc: 'Loved it? Pick a plan that fits. No long-term contracts required.' },
]

export default function HomeYourFirstClass() {
  return (
    <section className="home-first-class section section--tint-cool" id="first-class">
      <div className="container">
        <SectionReveal className="home-first-class__header">
          <SectionReveal.Item>
            <span className="section-label">
              <CalendarCheck size={14} /> Getting Started
            </span>
          </SectionReveal.Item>
          <SectionReveal.Item>
            <h2 className="section-title">
              Your First <span className="text-gradient">Class</span>
            </h2>
          </SectionReveal.Item>
          <SectionReveal.Item>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Four simple steps from curiosity to the mat.
            </p>
          </SectionReveal.Item>
        </SectionReveal>

        {/* Horizontal timeline */}
        <div className="home-first-class__timeline">
          <div className="home-first-class__timeline-line" aria-hidden="true" />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="step-card-v2"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
            >
              {/* Connector dot */}
              <div className="step-card-v2__dot" aria-hidden="true">
                <div className="step-card-v2__dot-inner" />
              </div>

              <div className="step-card-v2__number">{step.number}</div>
              <div className="step-card-v2__icon">{step.icon}</div>
              <h3 className="step-card-v2__title">{step.title}</h3>
              <p className="step-card-v2__desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <SectionReveal className="home-first-class__cta-wrapper" delay={0.3}>
          <SectionReveal.Item>
            <div className="home-first-class__cta">
              <Link href="/book-trial" className="btn btn-primary">
                Book Free Trial <ArrowRight size={16} />
              </Link>
            </div>
          </SectionReveal.Item>
        </SectionReveal>
      </div>
    </section>
  )
}
