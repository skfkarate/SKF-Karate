'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import SectionReveal from './SectionReveal'

export default function HomeTestimonials() {
  return (
    <section className="home-testimonials section section--tint-dark" id="testimonials">
      <div className="container">
        <SectionReveal className="home-testimonials__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionReveal.Item>
            <span className="section-label">
              <Quote size={14} /> Word of Mouth
            </span>
          </SectionReveal.Item>
          <SectionReveal.Item>
            <h2 className="section-title">
              What <span className="text-gradient">Parents Say</span>
            </h2>
          </SectionReveal.Item>
          <SectionReveal.Item>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Hear from the families who trust SKF Karate with their children&apos;s development.
            </p>
          </SectionReveal.Item>
        </SectionReveal>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }}
      >
        <TestimonialCarousel />
      </motion.div>
    </section>
  )
}
