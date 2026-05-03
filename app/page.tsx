import HomeHero from '@/app/_components/pages/home/HomeHero'
import './home.css'
import { Metadata } from 'next'
import JsonLdScript from '@/components/JsonLdScript'
import { buildHomeJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata: Metadata = buildSeoMetadata(
  '/',
  'SKF Karate offers professional karate classes in Karnataka with self-defense, kata, kumite, weapon training, kids programs, and adult coaching for all levels.'
)

export default function HomePage() {
  const orgSchema = buildHomeJsonLd()

  return (
    <div className="home">
      {/* Ambient background orbs for Slate/Glass aesthetic */}
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />

      <JsonLdScript data={orgSchema} />

      {/* 1. HERO — Full viewport cinematic */}
      <HomeHero />

      {/* 2. TRUST STATS — Clean minimal blocks */}
      {/* <HomeStatsCounter /> */}

      {/* 3. CLASSES — City cards grid */}
      {/* <HomeClassesPreview /> */}

      {/* 4. TOP ATHLETES — Honours-style podium */}
      {/* <HomeTopAthletes /> */}

      {/* 5. TESTIMONIALS — Carousel (Hidden for now) */}
      {/* <HomeTestimonials /> */}

      {/* 6. FINAL CTA — Cinematic background */}
      {/* <HomeBookTrialCTA /> */}
    </div>
  )
}
