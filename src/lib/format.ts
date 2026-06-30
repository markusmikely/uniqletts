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

export function formatAddress(address: { line1: string; area: string; postcode: string }): string {
  return `${address.line1}, ${address.area} ${address.postcode}`
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

export function whatsappPropertyUrl(number: string, title: string, slug: string): string {
  const text = encodeURIComponent(`Hi, I'm interested in: ${title} (https://www.uniqletts.com/properties/${slug})`)
  return `https://wa.me/${number}?text=${text}`
}
