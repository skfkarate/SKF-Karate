import HomeHero from '@/app/_components/pages/home/HomeHero'
import HomeStatsCounter from '@/app/_components/pages/home/HomeStatsCounter'
import HomeClassesPreview from '@/app/_components/pages/home/HomeClassesPreview'
import HomeTopAthletes from '@/app/_components/pages/home/HomeTopAthletes'
import HomeTestimonials from '@/app/_components/pages/home/HomeTestimonials'
import HomeBookTrialCTA from '@/app/_components/pages/home/HomeBookTrialCTA'
import './home.css'
import { absoluteMediaUrl, absoluteSiteUrl, buildOrgJsonLd } from '@/data/constants/siteConfig'
import { Metadata } from 'next'
import JsonLdScript from '@/components/JsonLdScript'

export const metadata: Metadata = {
  title: 'SKF Karate',
  description: 'Join SKF Karate across Karnataka. We offer professional martial arts, self-defense classes for kids and adults, and WKF black belt grading. Book a free trial today!',
  alternates: {
    canonical: absoluteSiteUrl('/'),
  },
  openGraph: {
    title: 'SKF Karate',
    description: 'Professional karate and self-defense classes for kids and adults across Karnataka.',
    url: absoluteSiteUrl('/'),
    siteName: 'SKF Karate',
    type: 'website',
    images: [{ url: absoluteMediaUrl(), width: 1200, height: 630, alt: 'SKF Karate students training' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SKF Karate',
    description: 'Book a free trial with SKF Karate across Karnataka.',
    images: [absoluteMediaUrl()],
  },
}

export default function HomePage() {
  const orgSchema = buildOrgJsonLd()

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
      <HomeBookTrialCTA />
    </div>
  )
}
