'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarCheck, ArrowRight } from 'lucide-react'
import SectionReveal from './SectionReveal'
import './HomeBookTrialCTA.css'

export default function HomeBookTrialCTA() {
  return (
    <section className="obs-cta-section" id="book-trial-cta">
      <div className="obs-cta-section__bg" />
      <div className="container">
        <SectionReveal className="obs-cta-content">
          <SectionReveal.Item>
            <div className="obs-badge">
              <CalendarCheck size={12} /> BECOME A CHAMPION
            </div>
          </SectionReveal.Item>
          
          <SectionReveal.Item>
            <h2 className="obs-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', margin: '1rem 0' }}>
              STEP ON THE MAT.<br />
              <span className="text-gradient">FEEL THE DIFFERENCE.</span>
            </h2>
          </SectionReveal.Item>
          
          <SectionReveal.Item>
            <p className="obs-subtitle" style={{ maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Join the finest martial arts academy in Karnataka. Train under certified WKF masters, forge an unbreakable spirit, and discover your true potential.
            </p>
          </SectionReveal.Item>
          
          <SectionReveal.Item>
            <div className="obs-cta-actions">
              <Link href="/contact" className="obs-btn-primary">
                BOOK FREE TRIAL <ArrowRight size={16} />
              </Link>
              <a href="https://wa.me/919019971726" target="_blank" rel="noopener noreferrer" className="obs-btn-outline">
                WHATSAPP US
              </a>
            </div>
          </SectionReveal.Item>
        </SectionReveal>
      </div>
    </section>
  )
}
