'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, ArrowUpRight } from 'lucide-react'
import SectionReveal from './SectionReveal'
import type { City } from '@/lib/classesData'

function CityCard({ city, index }: { city: City; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/classes/${city.slug}`} className="home-city-card">
        <div className="home-city-card__image">
          <Image
            src={city.photo}
            alt={`SKF Karate ${city.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
          <div className="home-city-card__overlay" />
        </div>
        <div className="home-city-card__content">
          <div className="home-city-card__pin">
            <MapPin size={12} />
          </div>
          <h3 className="home-city-card__name">{city.name}</h3>
          <span className="home-city-card__count">
            {city.branches.length} {city.branches.length === 1 ? 'Branch' : 'Branches'}
          </span>
        </div>
        <div className="home-city-card__arrow">
          <ArrowUpRight size={18} />
        </div>
      </Link>
    </motion.div>
  )
}

export default function HomeClassesGrid({ cities }: { cities: City[] }) {
  return (
    <>
      <SectionReveal className="home-classes-preview__header">
        <SectionReveal.Item>
          <span className="section-label">
            <MapPin size={14} /> Training Locations
          </span>
        </SectionReveal.Item>
        <SectionReveal.Item>
          <h2 className="section-title">
            Find Classes <span className="text-gradient">Near You</span>
          </h2>
        </SectionReveal.Item>
        <SectionReveal.Item>
          <p className="section-subtitle">
            Group classes and personal training across 4 cities in Karnataka.
          </p>
        </SectionReveal.Item>
      </SectionReveal>

      <div className="home-classes-preview__grid">
        {cities.map((city, i) => (
          <CityCard key={city.slug} city={city} index={i} />
        ))}
      </div>

      <SectionReveal className="home-classes-preview__cta" delay={0.4}>
        <SectionReveal.Item>
          <Link href="/classes" className="btn btn-secondary">
            View All Classes <ArrowRight size={16} />
          </Link>
        </SectionReveal.Item>
      </SectionReveal>
    </>
  )
}
