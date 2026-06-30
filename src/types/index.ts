/* ============================================================
   UNIQLETTS — SHARED TYPES
   ============================================================ */

export interface Property {
  _id?: string
  id?: string
  slug: string
  title: string
  address: {
    line1: string
    area: string
    postcode: string
  }
  listingType: 'lettings' | 'sales'
  status: 'available' | 'let-agreed' | 'under-offer' | 'sold'
  propertyType?: 'studio' | 'flat' | 'house' | 'maisonette'
  price: number
  pricePeriod: 'pcm' | 'pw' | 'sale'
  bedrooms: number
  bathrooms: number
  description?: string | import('@portabletext/types').PortableTextBlock[]
  images?: PropertyImage[]
  mainImage?: unknown
  mainImageAlt?: string
  video?: { type?: string; url?: string }
  videoTourUrl?: string
  floorplanUrl?: string
  features?: string[]
  availableFrom?: string
  epcRating?: string
  isFeatured: boolean
  tag?: string | null
  viewCount?: number
}

export interface PropertyImage {
  url?: string
  alt: string
  width?: number
  height?: number
  asset?: unknown
  caption?: string
}

export interface Review {
  id: string
  source: 'google' | 'trustpilot' | 'custom'
  rating: number
  text: string
  author: string
  date: string
  showOnSite: boolean
  isPinned: boolean
  sortOrder: number
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  type: 'valuation' | 'viewing' | 'contact' | 'maintenance' | 'general'
  message: string
  propertySlug?: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  createdAt: string
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export type EnquiryType = Lead['type']

export interface EnquiryFormData {
  type: EnquiryType
  name: string
  email: string
  phone?: string
  message?: string
  propertySlug?: string
  propertyId?: string
  subject?: string
  valuationAddress?: string
  valuationPropertyType?: string
  valuationBedrooms?: string
  preferredCallTime?: string
  preferredDate?: string
  maintenanceAddress?: string
  maintenanceIssue?: string
  website?: string
}
