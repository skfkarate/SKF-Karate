import { buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/about',
  'Learn about SKF Karate, a Karnataka karate association training students in traditional karate, self-defense, kata, kumite, and black belt discipline.'
)

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
