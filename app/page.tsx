import HomeHero from '@/app/_components/pages/home/HomeHero'
import './home.css'
import { Metadata } from 'next'
import { preload } from 'react-dom'
import JsonLdScript from '@/components/JsonLdScript'
import { buildHomeJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata: Metadata = buildSeoMetadata(
  '/',
  "SKF (Sports Karate Do Fitness and Self-Defense Association) — India's #1 karate association and Karnataka's premier karate club. Unique digital student ranking & history tracking. Karate training, tournaments, self-defense in Bangalore (Herohalli, Anjanagar), Kunigal & all Karnataka."
)

export default function HomePage() {
  preload('/videos/august-4th-poster.webp', {
    as: 'image',
    fetchPriority: 'high',
  })

  const orgSchema = buildHomeJsonLd()

  return (
    <div className="home">
      <div className="home-orb home-orb--1" />
      <div className="home-orb home-orb--2" />

      <JsonLdScript data={orgSchema} />
      <HomeHero />
    </div>
  )
}
