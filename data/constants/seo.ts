import type { Metadata } from 'next'

import { CONTACT, SOCIAL_LINKS } from './contact'
import { absoluteMediaUrl, absoluteSiteUrl, DEFAULT_OG_IMAGE, generateCanonicalUrl, SITE_CONFIG } from './siteConfig'

export const SEO_TITLE = 'SKF Karate'
export const SEO_KEYWORDS =
  'SKF Karate, karate, martial arts, self-defense, weapon training, karate classes, karate near me, karate association, karate federation, shotokan karate, kumite, kata, kihon, black belt, dojo, karate for kids, karate for adults, self-defense classes, kobudo, SKF, KFF karate'
export const SEO_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
export const SEO_IMAGE_ALT = 'SKF Karate — Official Karate Association'

type SeoMetadataOptions = {
  image?: string
  imageAlt?: string
}

function cleanDescription(description: string) {
  return description.replace(/\s+/g, ' ').trim()
}

export function normalizeMetaDescription(description: string, fallback = '') {
  const clean = cleanDescription(description || fallback)

  if (clean.length <= 160) return clean

  const shortened = clean.slice(0, 157).replace(/\s+\S*$/, '')
  return `${shortened}...`
}

export function buildSeoMetadata(
  path: string,
  description: string,
  options: SeoMetadataOptions = {}
): Metadata {
  const canonicalUrl = generateCanonicalUrl(path)
  const imageUrl = options.image ? absoluteMediaUrl(options.image) : absoluteMediaUrl(DEFAULT_OG_IMAGE)
  const imageAlt = options.imageAlt || SEO_IMAGE_ALT
  const metaDescription = normalizeMetaDescription(description)

  return {
    title: SEO_TITLE,
    description: metaDescription,
    keywords: SEO_KEYWORDS,
    authors: [{ name: SEO_TITLE }],
    robots: SEO_ROBOTS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      siteName: SEO_TITLE,
      title: SEO_TITLE,
      description: metaDescription,
      url: canonicalUrl,
      locale: 'en_IN',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SEO_TITLE,
      description: metaDescription,
      images: [
        {
          url: imageUrl,
          alt: imageAlt,
        },
      ],
    },
  }
}

export function buildNoIndexMetadata(path: string, description: string): Metadata {
  return {
    ...buildSeoMetadata(path, description),
    robots: 'noindex, nofollow',
  }
}

export function buildHomeJsonLd() {
  const homepageUrl = absoluteSiteUrl('/')
  const logoUrl = absoluteMediaUrl(SITE_CONFIG.LOGO_PATH)
  const imageUrl = absoluteMediaUrl(DEFAULT_OG_IMAGE)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsOrganization',
        name: SEO_TITLE,
        alternateName: ['SKF', 'SKF Karate Association', 'SKF Karate Federation', 'KFF Karate'],
        url: homepageUrl,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
          width: 512,
          height: 512,
        },
        description:
          'SKF Karate is an official karate association offering professional karate training, self-defense classes, weapon training, and competition preparation for all ages and skill levels.',
        sport: 'Karate',
        address: {
          '@type': 'PostalAddress',
          streetAddress: CONTACT.ADDRESS.full,
          addressLocality: 'Bengaluru',
          addressRegion: SITE_CONFIG.STATE,
          postalCode: '560091',
          addressCountry: 'IN',
        },
        telephone: CONTACT.PHONE,
        email: CONTACT.EMAIL,
        sameAs: [SOCIAL_LINKS.FACEBOOK, SOCIAL_LINKS.INSTAGRAM, SOCIAL_LINKS.YOUTUBE],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Karate Programs',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Karate Classes' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Self-Defense Training' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Weapon Training' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kids Karate' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Competition Preparation' } },
          ],
        },
      },
      {
        '@type': 'LocalBusiness',
        name: SEO_TITLE,
        url: homepageUrl,
        telephone: CONTACT.PHONE,
        image: imageUrl,
        address: {
          '@type': 'PostalAddress',
          streetAddress: CONTACT.ADDRESS.full,
          addressLocality: 'Bengaluru',
          addressRegion: SITE_CONFIG.STATE,
          postalCode: '560091',
          addressCountry: 'IN',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '06:00',
            closes: '21:00',
          },
        ],
        priceRange: '$$',
      },
      {
        '@type': 'WebSite',
        name: SEO_TITLE,
        url: homepageUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${homepageUrl.replace(/\/$/, '')}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

export function buildBreadcrumbJsonLd(name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteSiteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: absoluteSiteUrl(path),
      },
    ],
  }
}

export function buildFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
