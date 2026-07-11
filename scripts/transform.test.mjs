import { describe, it, expect } from 'vitest'
import {
  legacyImageUrl,
  slugify,
  mapStatus,
  mapPricePeriod,
  cleanArea,
  mapPropertyType,
  mapProperty,
  assignSlugs,
  cleanReviewLocation,
  mapReview,
  buildLegalPage,
  buildHomepageSettings,
  buildSiteSettings,
} from './transform.mjs'

describe('legacyImageUrl', () => {
  it('converts an asset ref to a CDN URL', () => {
    expect(legacyImageUrl('image-abc123-540x405-jpg')).toBe(
      'https://cdn.sanity.io/images/a9fkkb2u/production/abc123-540x405.jpg'
    )
  })
})

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Lovely One Bedroom flat to rent in Bethnal green.')).toBe(
      'lovely-one-bedroom-flat-to-rent-in-bethnal-green'
    )
  })

  it('strips punctuation runs to single hyphens', () => {
    expect(slugify('Modern!!!Manhattan style')).toBe('modern-manhattan-style')
  })

  it('caps length at 96 chars without trailing hyphen', () => {
    const slug = slugify('a'.repeat(50) + ' ' + 'b'.repeat(60))
    expect(slug.length).toBeLessThanOrEqual(96)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('mapStatus', () => {
  it('maps sales statuses', () => {
    expect(mapStatus('For Sale', 'sales')).toBe('available')
    expect(mapStatus('Under Offer', 'sales')).toBe('under-offer')
    expect(mapStatus('Just Sold', 'sales')).toBe('sold')
    expect(mapStatus(null, 'sales')).toBe('available')
  })

  it('maps lettings statuses', () => {
    expect(mapStatus('Rented', 'lettings')).toBe('let-agreed')
    expect(mapStatus('To Let', 'lettings')).toBe('available')
    expect(mapStatus('Available', 'lettings')).toBe('available')
    expect(mapStatus(undefined, 'lettings')).toBe('available')
  })
})

describe('mapPricePeriod', () => {
  it('sales are always sale-priced', () => {
    expect(mapPricePeriod(null, 'sales', 470000)).toBe('sale')
    expect(mapPricePeriod('PW', 'sales', 470000)).toBe('sale')
  })

  it('maps explicit PW / PCM', () => {
    expect(mapPricePeriod('PW', 'lettings', 450)).toBe('pw')
    expect(mapPricePeriod('PCM', 'lettings', 2600)).toBe('pcm')
  })

  it('infers period from amount when missing', () => {
    expect(mapPricePeriod(null, 'lettings', 380)).toBe('pw')
    expect(mapPricePeriod(null, 'lettings', 1590)).toBe('pcm')
  })
})

describe('cleanArea', () => {
  it('title-cases and trims', () => {
    expect(cleanArea('Bethnal green')).toBe('Bethnal Green')
    expect(cleanArea('White city  ')).toBe('White City')
  })

  it('fixes known legacy typos', () => {
    expect(cleanArea('Angle')).toBe('Angel')
    expect(cleanArea('Edgeware')).toBe('Edgware')
  })

  it('drops a trailing ", London" city suffix', () => {
    expect(cleanArea('Bayswater, London')).toBe('Bayswater')
  })

  it('keeps joining words lowercase', () => {
    expect(cleanArea('Kingston upon Thames')).toBe('Kingston upon Thames')
  })

  it('falls back to London when empty', () => {
    expect(cleanArea('')).toBe('London')
    expect(cleanArea(undefined)).toBe('London')
  })
})

describe('mapPropertyType', () => {
  it('maps legacy types', () => {
    expect(mapPropertyType('bedsit')).toBe('studio')
    expect(mapPropertyType('studio')).toBe('studio')
    expect(mapPropertyType('terrace')).toBe('house')
    expect(mapPropertyType('semidetached')).toBe('house')
    expect(mapPropertyType('flat')).toBe('flat')
  })

  it('infers from title when the type is missing', () => {
    expect(mapPropertyType(null, 'Double maisonette Studio(Bedsit) flat')).toBe('studio')
    expect(mapPropertyType(null, 'Three bedroom House to rent')).toBe('house')
    expect(mapPropertyType(null, 'Two bedroom flat')).toBe('flat')
  })
})

const LEGACY_PROPERTY = {
  _id: 'abc-123',
  _createdAt: '2022-07-06T16:23:15Z',
  type: 'lettings',
  status: 'Rented',
  title: '  Wonderful   One bedroom apartment  ',
  price: 450,
  price_type: 'PW',
  bedrooms: 1,
  bathrooms: 1,
  featured: true,
  features: [' Bicycle storage  ', ''],
  address: {
    address1: '24 Gelding Court',
    address2: 'Jamaica Road',
    town: 'Bermondsey',
    postcode: 'SE1 2RN',
  },
  full_description: [{ _type: 'block', _key: 'k1', children: [], markDefs: [], style: 'normal' }],
  images: [
    { _key: 'i1', _type: 'image', asset: { _type: 'reference', _ref: 'image-aaa-100x100-jpg' } },
    { _key: 'i2', _type: 'image', asset: { _type: 'reference', _ref: 'image-bbb-100x100-jpg' } },
  ],
}

describe('mapProperty', () => {
  const imageRefMap = { 'image-aaa-100x100-jpg': 'image-new-aaa' }
  const doc = mapProperty(LEGACY_PROPERTY, { slug: 'wonderful-one-bedroom-apartment', imageRefMap })

  it('produces a deterministic _id for idempotent re-imports', () => {
    expect(doc._id).toBe('property-abc-123')
    expect(doc._type).toBe('property')
  })

  it('normalises title whitespace', () => {
    expect(doc.title).toBe('Wonderful One bedroom apartment')
  })

  it('maps listing fields', () => {
    expect(doc.listingType).toBe('lettings')
    expect(doc.status).toBe('let-agreed')
    expect(doc.price).toBe(450)
    expect(doc.pricePeriod).toBe('pw')
    expect(doc.isFeatured).toBe(true)
  })

  it('builds the address object', () => {
    expect(doc.address).toEqual({
      _type: 'address',
      line1: '24 Gelding Court, Jamaica Road',
      area: 'Bermondsey',
      postcode: 'SE1 2RN',
    })
  })

  it('keeps only images that were successfully migrated', () => {
    expect(doc.images).toHaveLength(1)
    expect(doc.images[0].asset.asset._ref).toBe('image-new-aaa')
    expect(doc.images[0]._type).toBe('propertyImage')
    expect(doc.images[0].alt).toContain('Bermondsey')
  })

  it('trims and filters features', () => {
    expect(doc.features).toEqual(['Bicycle storage'])
  })
})

describe('assignSlugs', () => {
  it('dedupes identical titles with numeric suffixes', () => {
    const slugs = assignSlugs([
      { _id: 'a1', title: 'Studio flat to rent' },
      { _id: 'a2', title: 'Studio flat to rent' },
      { _id: 'a3', title: 'Different flat' },
    ])
    expect(slugs).toEqual(['studio-flat-to-rent', 'studio-flat-to-rent-2', 'different-flat'])
  })
})

describe('cleanReviewLocation', () => {
  it('prefers the most specific area', () => {
    expect(cleanReviewLocation('London, Notting Hill')).toBe('Notting Hill')
    expect(cleanReviewLocation('West Ealing')).toBe('West Ealing')
    expect(cleanReviewLocation('London')).toBe('London')
    expect(cleanReviewLocation('')).toBe('')
  })
})

describe('mapReview', () => {
  it('maps a legacy review to the new schema', () => {
    const doc = mapReview({
      _id: 'rev-1',
      _createdAt: '2022-07-07T13:20:52Z',
      name: 'Anna ',
      location: 'London, Notting Hill',
      rating: 5,
      review: "Thank you Rupa, Paola and Sam!",
      publish: true,
      date: '2016-11-14',
    }, 3)

    expect(doc).toMatchObject({
      _id: 'review-rev-1',
      _type: 'review',
      source: 'custom',
      rating: 5,
      author: 'Anna, Notting Hill',
      date: '2016-11-14',
      status: 'approved',
      showOnSite: true,
      isPinned: false,
      sortOrder: 3,
    })
  })

  it('falls back to the created date and clamps ratings', () => {
    const doc = mapReview({
      _id: 'rev-2',
      _createdAt: '2022-07-07T13:20:52Z',
      name: 'Sam',
      rating: 7,
      review: 'Great',
      publish: false,
    })
    expect(doc.date).toBe('2022-07-07')
    expect(doc.rating).toBe(5)
    expect(doc.showOnSite).toBe(false)
    expect(doc.author).toBe('Sam')
  })

  it('unescapes legacy backslash apostrophes', () => {
    const doc = mapReview({ _id: 'r', name: 'E', review: "we don\\'t have much issues", rating: 4 })
    expect(doc.text).toBe("we don't have much issues")
  })
})

describe('buildLegalPage', () => {
  it('builds a legalPage doc with deterministic id', () => {
    const doc = buildLegalPage({ title: 'Privacy Policy', content: [{ _type: 'block' }] }, 'privacy', 'Privacy')
    expect(doc._id).toBe('legalPage-privacy')
    expect(doc.slug.current).toBe('privacy')
    expect(doc.body).toHaveLength(1)
  })

  it('uses the fallback title when the source is empty', () => {
    const doc = buildLegalPage(null, 'terms', 'Terms of Use')
    expect(doc.title).toBe('Terms of Use')
    expect(doc.body).toEqual([])
  })
})

describe('buildHomepageSettings', () => {
  it('creates the homepage singleton with block management content', () => {
    const doc = buildHomepageSettings()
    expect(doc._id).toBe('homepageSettings')
    expect(doc.blockManagement.ctaHref).toBe('/block-management')
    expect(doc.blockManagement.body).toContain('central and Greater London')
    expect(doc.areaHighlight.paragraphs).toHaveLength(3)
  })
})

describe('buildSiteSettings', () => {
  it('computes the aggregate rating from reviews', () => {
    const doc = buildSiteSettings(
      { telephone: '0207 221 4000', email: 'info@uniqletts.com', address1: 'Suite 14', address2: '23 Redan Place', town: 'Bayswater', postcode: 'W2 4SA', mondayToFriday: '9am to 6pm', saturdayViewings: '10am to 4pm' },
      [{ rating: 5 }, { rating: 4 }, { rating: 5 }]
    )
    expect(doc._id).toBe('siteSettings')
    expect(doc.aggregateRating).toBe(4.7)
    expect(doc.reviewCount).toBe(3)
    expect(doc.phone).toBe('0207 221 4000')
    expect(doc.officeAddress).toContain('Suite 14, 23 Redan Place')
    expect(doc.openingHours.weekdays).toBe('9am to 6pm')
  })
})
