import { describe, it, expect } from 'vitest'
import { applyFilters, normalisedPrice, propertySearchText, EXTRAS, DEFAULT_FILTERS } from './PropertiesPage'
import type { Property } from '@/types'

const base: Property = {
  slug: 'p',
  title: 'Two bedroom flat',
  address: { line1: '1 Test St', area: 'Bayswater', postcode: 'W2 4SA' },
  listingType: 'lettings',
  status: 'available',
  propertyType: 'flat',
  price: 2000,
  pricePeriod: 'pcm',
  bedrooms: 2,
  bathrooms: 1,
  isFeatured: false,
}

function make(overrides: Partial<Property>): Property {
  return { ...base, ...overrides }
}

describe('normalisedPrice', () => {
  it('converts weekly rents to a monthly equivalent', () => {
    expect(normalisedPrice(make({ price: 450, pricePeriod: 'pw' }))).toBe(1950)
  })

  it('passes pcm and sale prices through', () => {
    expect(normalisedPrice(make({ price: 2600, pricePeriod: 'pcm' }))).toBe(2600)
    expect(normalisedPrice(make({ price: 470000, pricePeriod: 'sale' }))).toBe(470000)
  })
})

describe('applyFilters', () => {
  const lettingsCheap = make({ slug: 'a', price: 1500 })
  const lettingsWeekly = make({ slug: 'b', price: 450, pricePeriod: 'pw' }) // ≈ £1,950 pcm
  const lettingsExpensive = make({ slug: 'c', price: 4000, bedrooms: 3, bathrooms: 2 })
  const sale = make({ slug: 'd', listingType: 'sales', price: 470000, pricePeriod: 'sale', status: 'sold' })
  const all = [lettingsCheap, lettingsWeekly, lettingsExpensive, sale]

  it('returns everything on default filters', () => {
    expect(applyFilters(all, DEFAULT_FILTERS)).toHaveLength(4)
  })

  it('filters by listing type', () => {
    expect(applyFilters(all, { ...DEFAULT_FILTERS, listingType: 'sales' })).toEqual([sale])
  })

  it('filters by price budget using monthly-equivalent rents', () => {
    const result = applyFilters(all, { ...DEFAULT_FILTERS, listingType: 'lettings', minPrice: 1600, maxPrice: 2000 })
    expect(result.map(p => p.slug)).toEqual(['b'])
  })

  it('filters by minimum bedrooms and bathrooms', () => {
    expect(applyFilters(all, { ...DEFAULT_FILTERS, minBeds: 3 })).toEqual([lettingsExpensive])
    expect(applyFilters(all, { ...DEFAULT_FILTERS, minBaths: 2 })).toEqual([lettingsExpensive])
  })

  it('filters by availability', () => {
    const result = applyFilters(all, { ...DEFAULT_FILTERS, availableOnly: true })
    expect(result.map(p => p.slug)).toEqual(['a', 'b', 'c'])
  })

  it('filters by property type', () => {
    const studio = make({ slug: 'e', propertyType: 'studio' })
    expect(applyFilters([...all, studio], { ...DEFAULT_FILTERS, propertyType: 'studio' })).toEqual([studio])
  })

  it('filters by extras matched against features and description text', () => {
    const withBalcony = make({ slug: 'f', features: ['Private balcony'] })
    const withGardenInText = make({ slug: 'g', excerpt: 'A lovely flat with a shared garden.' })
    const plain = make({ slug: 'h' })

    const balcony = applyFilters([withBalcony, withGardenInText, plain], { ...DEFAULT_FILTERS, extras: ['balcony'] })
    expect(balcony.map(p => p.slug)).toEqual(['f'])

    const garden = applyFilters([withBalcony, withGardenInText, plain], { ...DEFAULT_FILTERS, extras: ['garden'] })
    expect(garden.map(p => p.slug)).toEqual(['g'])
  })

  it('requires every selected extra to match', () => {
    const both = make({ slug: 'i', features: ['Balcony', 'Underground parking'] })
    const one = make({ slug: 'j', features: ['Balcony'] })
    const result = applyFilters([both, one], { ...DEFAULT_FILTERS, extras: ['balcony', 'parking'] })
    expect(result.map(p => p.slug)).toEqual(['i'])
  })

  it('does not treat "unfurnished" as furnished', () => {
    const unfurnished = make({ slug: 'k', features: ['Unfurnished'] })
    const furnished = make({ slug: 'l', features: ['Fully furnished'] })
    const result = applyFilters([unfurnished, furnished], { ...DEFAULT_FILTERS, extras: ['furnished'] })
    expect(result.map(p => p.slug)).toEqual(['l'])
  })
})

describe('propertySearchText', () => {
  it('combines title, excerpt and features', () => {
    const text = propertySearchText(make({ excerpt: 'Near the park.', features: ['Lift'] }))
    expect(text).toContain('Two bedroom flat')
    expect(text).toContain('Near the park.')
    expect(text).toContain('Lift')
  })
})

describe('EXTRAS', () => {
  it('every extra has a unique id', () => {
    const ids = EXTRAS.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
