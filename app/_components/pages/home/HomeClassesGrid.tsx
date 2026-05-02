'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, ArrowUpRight } from 'lucide-react'
import SectionReveal from './SectionReveal'
import type { City } from '@/lib/classesData'
import './HomeClassesGrid.css'

function CityCard({ city, index }: { city: City; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/classes/${city.slug}`} className="obs-city-card">
        <div className="obs-city-card__left">
          <div className="obs-city-card__icon">
            <MapPin size={18} />
          </div>
          <h3 className="obs-city-card__name">{city.name}</h3>
        </div>
        <div className="obs-city-card__right">
          <span className="obs-city-card__count">
            {city.branches.length} {city.branches.length === 1 ? 'BRANCH' : 'BRANCHES'}
          </span>
          <ArrowUpRight size={16} className="obs-city-card__arrow" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function HomeClassesGrid({ cities }: { cities: City[] }) {
  return (
    <div className="obs-classes-section">
      <SectionReveal className="obs-classes-header">
        <SectionReveal.Item>
          <div className="obs-badge">
            <MapPin size={12} /> TRAINING LOCATIONS
          </div>
        </SectionReveal.Item>
        <SectionReveal.Item>
          <h2 className="obs-title">
            FIND CLASSES <span className="text-gradient">NEAR YOU</span>
          </h2>
        </SectionReveal.Item>
        <SectionReveal.Item>
          <p className="obs-subtitle">
            Group classes and personal training across {cities.length} cities in Karnataka.
          </p>
        </SectionReveal.Item>
      </SectionReveal>

      <div className="obs-classes-list">
        {cities.map((city, i) => (
          <CityCard key={city.slug} city={city} index={i} />
        ))}
      </div>

      <SectionReveal className="obs-classes-cta" delay={0.3}>
        <SectionReveal.Item>
          <Link href="/classes" className="obs-btn-outline">
            VIEW ALL CLASSES <ArrowRight size={14} />
          </Link>
        </SectionReveal.Item>
      </SectionReveal>
    </div>
  )
}
