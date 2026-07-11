import { describe, it, expect } from 'vitest'
import { formatPrice, formatAddress, formatReviewDate, sourceLabel, whatsappPropertyUrl } from './format'

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
  it('joins line1, area and postcode', () => {
    expect(
      formatAddress({ line1: '24 Gelding Court, Jamaica Road', area: 'Bermondsey', postcode: 'SE1 2RN' })
    ).toBe('24 Gelding Court, Jamaica Road, Bermondsey SE1 2RN')
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
})
