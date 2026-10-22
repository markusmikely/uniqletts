export function formatPrice(price: number, period: 'pcm' | 'pw' | 'sale'): string {
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price)

  if (period === 'pcm') return `${formatted} pcm`
  if (period === 'pw') return `${formatted} pw`
  return formatted
}

/** First (outward) part of a UK postcode, e.g. "W2 4SA" → "W2". */
export function outwardPostcode(postcode: string): string {
  return String(postcode ?? '').trim().split(/\s+/)[0] ?? ''
}

/** Street name only — drops a leading building/flat number and any
    unit prefix so the exact door isn't published.
    "23 Redan Place" → "Redan Place"; "Flat 4, 12 Porchester Road" → "Porchester Road". */
export function streetName(line1: string): string {
  const afterUnit = String(line1 ?? '').split(',').pop() ?? ''
  return afterUnit.replace(/^\s*\d+[a-zA-Z]?\s+/, '').trim() || afterUnit.trim()
}

/**
 * Public-facing address for listings — street + neighbourhood + outward
 * postcode only. Deliberately omits the house number and inward postcode
 * so a listing can't be pinned to an exact property.
 * e.g. { line1: "23 Redan Place", area: "Bayswater", postcode: "W2 4SA" }
 *      → "Redan Place, Bayswater, W2"
 */
export function formatAddress(address: { line1: string; area: string; postcode: string }): string {
  const street = streetName(address.line1)
  const outward = outwardPostcode(address.postcode)
  const parts: string[] = []
  if (street) parts.push(street)
  if (address.area && address.area !== outward && address.area !== street) parts.push(address.area)
  if (outward) parts.push(outward)
  return parts.join(', ')
}

export function formatReviewDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } catch {
    return date
  }
}

export function sourceLabel(source: string): string {
  const labels: Record<string, string> = {
    google: 'Google',
    trustpilot: 'Trustpilot',
    custom: 'Uniqletts',
  }
  return labels[source] ?? source
}

/**
 * wa.me only accepts the full international number, digits only, with no
 * leading 00/+ and no UK trunk "0" — "4402072214000" or "020 7221 4000"
 * both fail. Normalise whatever was typed into the CMS to "442072214000".
 */
export function normaliseWhatsappNumber(number: string): string {
  let digits = String(number ?? '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('440')) digits = '44' + digits.slice(3)
  else if (digits.startsWith('0')) digits = '44' + digits.slice(1)
  return digits
}

export function whatsappPropertyUrl(number: string, title: string, slug: string): string {
  const text = encodeURIComponent(`Hi, I'm interested in: ${title} (https://www.uniqletts.com/properties/${slug})`)
  return `https://wa.me/${normaliseWhatsappNumber(number)}?text=${text}`
}
