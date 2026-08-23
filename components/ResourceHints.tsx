import { preconnect, prefetchDNS } from 'react-dom'

export default function ResourceHints() {
  prefetchDNS('https://www.googletagmanager.com')
  prefetchDNS('https://www.google-analytics.com')
  prefetchDNS('https://www.youtube.com')
  prefetchDNS('https://www.youtube-nocookie.com')
  prefetchDNS('https://img.youtube.com')

  // Preconnect critical origins for Athlete Portal home practice videos
  preconnect('https://www.youtube-nocookie.com', { crossOrigin: 'anonymous' })
  preconnect('https://www.youtube.com', { crossOrigin: 'anonymous' })
  preconnect('https://img.youtube.com', { crossOrigin: 'anonymous' })

  if (process.env.NEXT_PUBLIC_GA_ID) {
    preconnect('https://www.googletagmanager.com')
    preconnect('https://www.google-analytics.com')
  }

  return null
}
