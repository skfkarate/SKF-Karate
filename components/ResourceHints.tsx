import { preconnect, prefetchDNS } from 'react-dom'

export default function ResourceHints() {
  prefetchDNS('https://www.googletagmanager.com')
  prefetchDNS('https://www.google-analytics.com')
  prefetchDNS('https://www.youtube.com')
  prefetchDNS('https://img.youtube.com')

  if (process.env.NEXT_PUBLIC_GA_ID) {
    preconnect('https://www.googletagmanager.com')
    preconnect('https://www.google-analytics.com')
  }

  return null
}
