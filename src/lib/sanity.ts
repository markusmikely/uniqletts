import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { Property, Review } from '@/types'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET ?? 'production'

export const sanityReady = Boolean(projectId && projectId !== 'placeholder')

export const client = createClient({
  projectId: projectId ?? 'placeholder',
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: Parameters<ReturnType<typeof imageUrlBuilder>['image']>[0]) {
  return builder.image(source)
}

export function imageUrl(source: unknown, width = 800): string {
  if (!source) return ''
  return urlFor(source).width(width).auto('format').quality(80).url()
}

// ---- GROQ field fragments ----

export const PROPERTY_CARD_FIELDS = `
  _id,
  "slug": slug.current,
  title,
  address,
  listingType,
  status,
  price,
  pricePeriod,
  bedrooms,
  bathrooms,
  isFeatured,
  tag,
  "mainImage": images[0].asset,
  "mainImageAlt": images[0].alt,
`

export const PROPERTY_DETAIL_FIELDS = `
  _id,
  "slug": slug.current,
  title,
  address,
  listingType,
  status,
  propertyType,
  price,
  pricePeriod,
  bedrooms,
  bathrooms,
  epcRating,
  availableFrom,
  description,
  features,
  images[] {
    alt,
    caption,
    "asset": asset,
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  "floorplanUrl": floorplan.asset->url,
  video,
  isFeatured,
  tag,
  viewCount
`

// ---- Query helpers ----

export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
  if (!sanityReady) return []
  return client.fetch(`
    *[_type == "property" && isFeatured == true] | order(publishedAt desc) [0...${limit}] {
      ${PROPERTY_CARD_FIELDS}
    }
  `)
}

export async function getAllProperties(filters?: {
  listingType?: string
  minBeds?: number
  featured?: boolean
}): Promise<Property[]> {
  if (!sanityReady) return []

  const conditions = ['_type == "property"']
  const params: Record<string, string | number | boolean> = {}

  if (filters?.listingType && filters.listingType !== 'all') {
    conditions.push('listingType == $listingType')
    params.listingType = filters.listingType
  }
  if (filters?.minBeds && filters.minBeds > 0) {
    conditions.push('bedrooms >= $minBeds')
    params.minBeds = filters.minBeds
  }
  if (filters?.featured) {
    conditions.push('isFeatured == true')
  }

  return client.fetch(
    `*[${conditions.join(' && ')}] | order(publishedAt desc) {
      ${PROPERTY_CARD_FIELDS}
    }`,
    params
  )
}

export async function getPropertyBySlug(slug: string) {
  if (!sanityReady) return null
  return client.fetch(
    `*[_type == "property" && slug.current == $slug][0] {
      ${PROPERTY_DETAIL_FIELDS}
    }`,
    { slug }
  )
}

export async function getSiteReviews(): Promise<Review[]> {
  if (!sanityReady) return []
  return client.fetch(`
    *[_type == "review" && showOnSite == true && status == "approved"] | order(isPinned desc, sortOrder asc, date desc) {
      "id": _id,
      source,
      rating,
      text,
      author,
      date,
      showOnSite,
      isPinned,
      sortOrder
    }
  `)
}

export async function getSiteSettings() {
  if (!sanityReady) return null
  return client.fetch(`*[_type == "siteSettings"][0]`)
}

export async function getHomepageSettings() {
  if (!sanityReady) return null
  return client.fetch(`*[_type == "homepageSettings"][0]`)
}

export async function getLegalPage(slug: string) {
  if (!sanityReady) return null
  return client.fetch(
    `*[_type == "legalPage" && slug.current == $slug][0]`,
    { slug }
  )
}

export function getVideoEmbedUrl(video?: { type?: string; url?: string }): string | undefined {
  if (!video?.url) return undefined
  const url = video.url
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}
