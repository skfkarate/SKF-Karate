import type { ReactNode } from 'react'

import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'
import { getShopProductPrimaryImage } from '@/lib/shop/productImages'
import { getProducts } from '@/lib/server/repositories/products'

type ProductLayoutProps = {
  children: ReactNode
  params: Promise<{ productId: string }>
}

export async function generateMetadata({ params }: ProductLayoutProps) {
  const { productId } = await params
  const products = await getProducts()
  const product = products.find((entry) => entry.id === productId)

  if (!product) {
    return buildSeoMetadata(
      `/shop/${productId}`,
      'Shop SKF Karate uniforms, belts, protective gear, training equipment, and martial arts essentials for kata, kumite, grading, and dojo practice in India.'
    )
  }

  return buildSeoMetadata(
    `/shop/${product.id}`,
    `${product.name} from SKF Karate. ${product.description}`,
    { image: getShopProductPrimaryImage(product), imageAlt: product.name }
  )
}

export default async function ProductLayout({ children, params }: ProductLayoutProps) {
  const { productId } = await params
  const products = await getProducts()
  const product = products.find((entry) => entry.id === productId)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(product?.name || 'Shop Product', `/shop/${productId}`)

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      {children}
    </>
  )
}
