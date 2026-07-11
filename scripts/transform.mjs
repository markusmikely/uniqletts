/* ============================================================
   TRANSFORM — legacy uniqletts.com Sanity data → new schema
   Pure functions, no I/O. Used by scripts/import-content.mjs
   and covered by tests in scripts/__tests__/transform.test.mjs
   ============================================================ */

const OLD_PROJECT_ID = 'a9fkkb2u'
const OLD_DATASET = 'production'

/** Build the public CDN URL for a legacy image asset ref. */
export function legacyImageUrl(ref) {
  // "image-<hash>-<w>x<h>-<ext>" → "https://cdn.sanity.io/images/<proj>/<ds>/<hash>-<w>x<h>.<ext>"
  const withoutPrefix = ref.replace(/^image-/, '')
  const lastDash = withoutPrefix.lastIndexOf('-')
  const base = withoutPrefix.slice(0, lastDash)
  const ext = withoutPrefix.slice(lastDash + 1)
  return `https://cdn.sanity.io/images/${OLD_PROJECT_ID}/${OLD_DATASET}/${base}.${ext}`
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/, '')
}

/** Old lettings statuses: To Let / Available / Rented / null.
    Old sales statuses: For Sale / Under Offer / Just Sold / null. */
export function mapStatus(oldStatus, listingType) {
  const s = (oldStatus ?? '').toLowerCase()
  if (listingType === 'sales') {
    if (s === 'under offer') return 'under-offer'
    if (s === 'just sold' || s === 'sold') return 'sold'
    return 'available'
  }
  if (s === 'rented') return 'let-agreed'
  return 'available'
}

/** PW → pw, PCM → pcm; sales are always 'sale'.
    Legacy rows with no price_type: weekly rents on the old site
    were consistently ≤ £750, monthly ones ≥ £850. */
export function mapPricePeriod(priceType, listingType, price) {
  if (listingType === 'sales') return 'sale'
  const t = (priceType ?? '').toUpperCase()
  if (t === 'PW') return 'pw'
  if (t === 'PCM') return 'pcm'
  return price <= 800 ? 'pw' : 'pcm'
}

const TOWN_FIXES = {
  angle: 'Angel',
  edgeware: 'Edgware',
  'nottinghill gate': 'Notting Hill Gate',
}

const LOWERCASE_WORDS = new Set(['upon', 'on', 'the', 'and'])

export function cleanArea(town) {
  const trimmed = String(town ?? '').replace(/\s+/g, ' ').trim()
  if (!trimmed) return 'London'
  // Drop a trailing ", London" — the area field is displayed next to the postcode
  const withoutCity = trimmed.replace(/,\s*london$/i, '')
  const fixed = TOWN_FIXES[withoutCity.toLowerCase()] ?? withoutCity
  return fixed
    .split(' ')
    .map((word, i) =>
      i > 0 && LOWERCASE_WORDS.has(word.toLowerCase())
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

export function mapPropertyType(oldType, title = '') {
  const t = (oldType ?? '').toLowerCase()
  if (t === 'studio' || t === 'bedsit') return 'studio'
  if (t === 'terrace' || t === 'semidetached') return 'house'
  if (t === 'flat') return 'flat'
  const text = title.toLowerCase()
  if (text.includes('studio') || text.includes('bedsit')) return 'studio'
  if (text.includes('maisonette')) return 'maisonette'
  if (text.includes('house')) return 'house'
  return 'flat'
}

/** Normalise a UK postcode for lookups: uppercase, single space. */
export function normalisePostcode(postcode) {
  return String(postcode ?? '').toUpperCase().replace(/\s+/g, ' ').trim()
}

/** Map one legacy propertyListings doc to the new `property` schema.
    Image asset uploads happen in the import script; `imageRefMap` maps
    legacy asset refs to newly-uploaded asset ids, `geoMap` maps
    normalised postcodes to { lat, lng }. */
export function mapProperty(old, { slug, imageRefMap = {}, geoMap = {} } = {}) {
  const listingType = old.type === 'sales' ? 'sales' : 'lettings'
  const title = String(old.title ?? '').replace(/\s+/g, ' ').trim()
  const address = old.address ?? {}
  const line1 = [address.address1, address.address2].filter(Boolean).join(', ') || 'London'
  const area = cleanArea(address.town)

  const images = (old.images ?? [])
    .filter(img => img?.asset?._ref && imageRefMap[img.asset._ref])
    .map((img, i) => ({
      _type: 'propertyImage',
      _key: img._key ?? `img-${i}`,
      asset: {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageRefMap[img.asset._ref] },
      },
      alt: `${area} — ${title.slice(0, 60)}${title.length > 60 ? '…' : ''} (photo ${i + 1})`,
    }))

  return {
    _id: `property-${old._id}`,
    _type: 'property',
    title,
    slug: { _type: 'slug', current: slug ?? slugify(title) },
    listingType,
    status: mapStatus(old.status, listingType),
    propertyType: mapPropertyType(old.property_type, title),
    price: Number(old.price) || 0,
    pricePeriod: mapPricePeriod(old.price_type, listingType, Number(old.price) || 0),
    bedrooms: Number(old.bedrooms ?? 0) || 0,
    bathrooms: Number(old.bathrooms ?? 1) || 1,
    address: {
      _type: 'address',
      line1,
      area,
      postcode: normalisePostcode(address.postcode),
      ...(geoMap[normalisePostcode(address.postcode)]
        ? {
            geopoint: {
              _type: 'geopoint',
              lat: geoMap[normalisePostcode(address.postcode)].lat,
              lng: geoMap[normalisePostcode(address.postcode)].lng,
            },
          }
        : {}),
    },
    description: old.full_description ?? [],
    features: (old.features ?? []).map(f => String(f).trim()).filter(Boolean),
    images,
    isFeatured: old.featured === true,
    viewCount: 0,
    publishedAt: old._createdAt,
  }
}

/** Assign unique slugs across the whole property set. */
export function assignSlugs(oldProperties) {
  const seen = new Map()
  return oldProperties.map(old => {
    const base = slugify(old.title) || `property-${old._id.slice(0, 8)}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count + 1}`
  })
}

/** Old review location strings are inconsistent ("London, Notting Hill",
    "West Ealing", "London"). Normalise to the most specific area. */
export function cleanReviewLocation(location) {
  const trimmed = String(location ?? '').replace(/\s+/g, ' ').trim()
  if (!trimmed) return ''
  const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean)
  const specific = parts.filter(p => p.toLowerCase() !== 'london')
  return specific.length > 0 ? specific[specific.length - 1] : 'London'
}

export function mapReview(old, index = 0) {
  const location = cleanReviewLocation(old.location)
  const name = String(old.name ?? '').replace(/\s+/g, ' ').trim()
  const author = location ? `${name}, ${location}` : name
  return {
    _id: `review-${old._id}`,
    _type: 'review',
    source: 'custom',
    rating: Math.min(5, Math.max(1, Number(old.rating) || 5)),
    text: String(old.review ?? '').replace(/\\+'/g, "'").trim(),
    author,
    date: old.date ?? (old._createdAt ?? '').slice(0, 10),
    status: 'approved',
    showOnSite: old.publish !== false,
    isPinned: false,
    sortOrder: index,
  }
}

export function buildLegalPage(old, slug, fallbackTitle) {
  return {
    _id: `legalPage-${slug}`,
    _type: 'legalPage',
    title: old?.title?.trim() || fallbackTitle,
    slug: { _type: 'slug', current: slug },
    body: old?.content ?? [],
  }
}

/** Homepage singleton — modernised block-management + area copy. */
export function buildHomepageSettings() {
  return {
    _id: 'homepageSettings',
    _type: 'homepageSettings',
    blockManagement: {
      eyebrow: 'Block management',
      title: 'Complete care for apartment blocks',
      body: 'From day-to-day management to advising developers on the design of communal areas, we look after everything relating to apartment blocks and their communal spaces — for buildings across central and Greater London, from 500-unit new-builds to converted period blocks on prime estates.',
      ctaLabel: 'Explore block management',
      ctaHref: '/block-management',
    },
    areaHighlight: {
      eyebrow: 'Where we work',
      title: 'Rooted in Bayswater, at home across London',
      paragraphs: [
        "Our office sits in Bayswater at one of London's most enviable intersections — Hyde Park to the south, Notting Hill to the west, Paddington's connectivity to the east.",
        'But our portfolio reaches much further: from Kensington, Notting Hill and London Bridge to Hackney, Colindale, Kingston and beyond, we let and manage homes throughout central and Greater London.',
        "Whether you're a first-time renter, relocating professionally, or an investor looking for strong yields — two decades of London letting means we know exactly where value lives.",
      ],
      imageCaption: 'Hyde Park — on your doorstep',
    },
    featuredMode: 'auto',
  }
}

/** Site settings singleton, seeded from the legacy contact page +
    review stats computed from the imported reviews. */
export function buildSiteSettings(oldContact, reviews = []) {
  const ratings = reviews.map(r => Number(r.rating)).filter(n => n >= 1 && n <= 5)
  const aggregate = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : undefined

  const addressParts = [oldContact?.address1, oldContact?.address2].filter(Boolean).join(', ')
  const cityLine = [oldContact?.town, 'London', oldContact?.postcode].filter(Boolean).join(', ')
    .replace('London, W2', 'London W2')

  return {
    _id: 'siteSettings',
    _type: 'siteSettings',
    phone: oldContact?.telephone ?? '020 7221 4000',
    email: oldContact?.email ?? 'info@uniqletts.com',
    officeAddress: `${addressParts}\n${cityLine}`,
    openingHours: {
      weekdays: oldContact?.mondayToFriday ?? '9am to 6pm',
      saturday: oldContact?.saturdayViewings ?? '10am to 4pm',
      sunday: 'Closed',
    },
    aggregateRating: aggregate,
    reviewCount: ratings.length || undefined,
  }
}
