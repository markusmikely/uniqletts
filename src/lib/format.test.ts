import { describe, it, expect } from 'vitest'
import { formatPrice, formatAddress, outwardPostcode, streetName, formatReviewDate, sourceLabel, whatsappPropertyUrl, normaliseWhatsappNumber } from './format'

describe('formatPrice', () => {
  it('formats monthly rents with pcm suffix', () => {
    expect(formatPrice(2600, 'pcm')).toBe('£2,600 pcm')
  })

  it('formats weekly rents with pw suffix', () => {
    expect(formatPrice(450, 'pw')).toBe('£450 pw')
  })

  it('formats sale prices without a suffix', () => {
    expect(formatPrice(470000, 'sale')).toBe('£470,000')
  })

  it('rounds to whole pounds', () => {
    expect(formatPrice(1999.99, 'sale')).toBe('£2,000')
  })
})

describe('formatAddress', () => {
  it('shows street, area and outward postcode only (no house number or inward code)', () => {
    expect(
      formatAddress({ line1: '23 Redan Place', area: 'Bayswater', postcode: 'W2 4SA' })
    ).toBe('Redan Place, Bayswater, W2')
  })

  it('drops a unit/flat prefix and keeps only the street', () => {
    expect(
      formatAddress({ line1: 'Flat 4, 12 Porchester Road', area: 'Bayswater', postcode: 'W2 5DP' })
    ).toBe('Porchester Road, Bayswater, W2')
  })

  it('does not duplicate area when it equals the outward code', () => {
    expect(
      formatAddress({ line1: 'Westbourne Grove', area: 'W2', postcode: 'W2 4UA' })
    ).toBe('Westbourne Grove, W2')
  })

  it('handles a street with no leading number', () => {
    expect(
      formatAddress({ line1: 'Leinster Gardens', area: 'Bayswater', postcode: 'W2 6DR' })
    ).toBe('Leinster Gardens, Bayswater, W2')
  })
})

describe('outwardPostcode', () => {
  it('returns the first part of the postcode', () => {
    expect(outwardPostcode('W2 4SA')).toBe('W2')
    expect(outwardPostcode('SE1 2RN')).toBe('SE1')
    expect(outwardPostcode('W2')).toBe('W2')
  })
})

describe('streetName', () => {
  it('strips leading building numbers and unit prefixes', () => {
    expect(streetName('23 Redan Place')).toBe('Redan Place')
    expect(streetName('Flat 4, 12 Porchester Road')).toBe('Porchester Road')
    expect(streetName('Leinster Gardens')).toBe('Leinster Gardens')
  })
})

describe('formatReviewDate', () => {
  it('formats ISO dates as month + year', () => {
    expect(formatReviewDate('2016-11-14')).toBe('November 2016')
  })
})

describe('sourceLabel', () => {
  it('maps known sources', () => {
    expect(sourceLabel('google')).toBe('Google')
    expect(sourceLabel('trustpilot')).toBe('Trustpilot')
    expect(sourceLabel('custom')).toBe('Uniqletts')
  })

  it('passes unknown sources through', () => {
    expect(sourceLabel('yelp')).toBe('yelp')
  })
})

describe('whatsappPropertyUrl', () => {
  it('builds a wa.me link with encoded property details', () => {
    const url = whatsappPropertyUrl('442071234000', 'Lovely flat', 'lovely-flat')
    expect(url).toMatch(/^https:\/\/wa\.me\/442071234000\?text=/)
    expect(decodeURIComponent(url)).toContain('Lovely flat')
    expect(decodeURIComponent(url)).toContain('/properties/lovely-flat')
  })

  it('normalises numbers wa.me would reject', () => {
    expect(whatsappPropertyUrl('4402072214000', 'x', 'x')).toMatch(/^https:\/\/wa\.me\/442072214000\?/)
  })
})

describe('normaliseWhatsappNumber', () => {
  it.each([
    ['442072214000', '442072214000'],
    ['4402072214000', '442072214000'],
    ['+44 (0)20 7221 4000', '442072214000'],
    ['0044 20 7221 4000', '442072214000'],
    ['020 7221 4000', '442072214000'],
    ['07700 900123', '447700900123'],
  ])('%s → %s', (input, expected) => {
    expect(normaliseWhatsappNumber(input)).toBe(expected)
  })
})
