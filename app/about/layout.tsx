import { buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/about',
  "Learn about SKF – Sports Karate Do Fitness and Self-Defense Association, India's #1 digital karate association. Karnataka's top karate federation serving thousands of students with digital profiles, live rankings, and achievement tracking.",
  { title: "About SKF | India's Best Karate Association | Karnataka's #1 Martial Arts Organization" }
)

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
