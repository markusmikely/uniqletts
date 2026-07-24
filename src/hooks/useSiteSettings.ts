import { useEffect, useState } from 'react'
import { getSiteSettings } from '@/lib/sanity'

export interface SiteSettingsData {
  phone?: string
  email?: string
  whatsappNumber?: string
  officeAddress?: string
  openingHours?: {
    weekdays?: string
    saturday?: string
    sunday?: string
  }
  socialLinks?: {
    platform: string
    url: string
    enabled?: boolean
  }[]
  marketSnapshot?: { label: string; value: string }[]
  aggregateRating?: number
  reviewCount?: number
}

const DEFAULTS: SiteSettingsData = {
  phone: '0207 221 4000',
  email: 'info@uniqletts.com',
  whatsappNumber: '4402072214000',
  officeAddress: 'Suite 14, 23 Redan Place\nBayswater, London W2 4SA',
  openingHours: {
    weekdays: '9:00am – 6:00pm',
    saturday: '10:00am – 4:00pm',
    sunday: 'Closed',
  },
  aggregateRating: 4.9,
  reviewCount: 34,
}

let cache: SiteSettingsData | null = null

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsData>(cache ?? DEFAULTS)

  useEffect(() => {
    if (cache) return
    getSiteSettings().then(data => {
      if (data) {
        const merged = { ...DEFAULTS, ...data }
        cache = merged
        setSettings(merged)
      }
    })
  }, [])

  return settings
}

export function getSocialLinks(settings: SiteSettingsData) {
  const defaults = [
    { platform: 'whatsapp', url: `https://wa.me/${settings.whatsappNumber}`, enabled: true },
    { platform: 'instagram', url: 'https://instagram.com/uniqletts', enabled: true },
    { platform: 'x', url: 'https://twitter.com/uniqletts', enabled: true },
    { platform: 'linkedin', url: 'https://linkedin.com/company/uniqletts', enabled: true },
    { platform: 'facebook', url: 'https://facebook.com/uniqletts', enabled: true },
  ]

  if (!settings.socialLinks?.length) return defaults
  return settings.socialLinks.filter(s => s.enabled !== false)
}
