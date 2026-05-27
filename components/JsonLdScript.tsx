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
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
