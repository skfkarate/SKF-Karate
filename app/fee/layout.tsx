import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/fee',
  'SKF Karate operations console for monthly karate training fee tracking, updates, receipts, and internal administration.'
)

export default function FeeLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100dvh', background: '#000' }}>{children}</div>
}
