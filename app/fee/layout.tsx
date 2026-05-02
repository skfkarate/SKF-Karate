export const metadata = {
  title: 'SKF Karate',
  description: 'Operations console for monthly training fee tracking, updates, and receipt controls.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function FeeLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100dvh', background: '#000' }}>{children}</div>
}
