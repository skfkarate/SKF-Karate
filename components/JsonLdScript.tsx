import { headers } from 'next/headers'

type JsonLdScriptProps = {
  data: unknown
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default async function JsonLdScript({ data }: JsonLdScriptProps) {
  const nonce = (await headers()).get('x-nonce') || undefined

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      // The CSP nonce is injected per-request by the proxy and only exists on
      // the server, so the client tree legitimately renders an empty value.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
