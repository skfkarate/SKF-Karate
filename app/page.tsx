import HomeHero from '@/app/_components/pages/home/HomeHero'
import './home.css'
import { Metadata } from 'next'
import { preload } from 'react-dom'
import JsonLdScript from '@/components/JsonLdScript'
import { buildHomeJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata: Metadata = buildSeoMetadata(
  '/',
  'SKF Karate offers professional karate classes in Karnataka with self-defense, kata, kumite, weapon training, kids programs, and adult coaching for all levels.'
)

export default function HomePage() {
  preload('/videos/august-4th-poster.jpg', {
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
