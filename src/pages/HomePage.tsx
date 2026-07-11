import { useEffect } from 'react'
import Hero from '@/components/sections/Hero'
import {
  Services,
  FeaturedProperties,
  BlockManagement,
  AreaHighlight,
  ReviewsStrip,
  LandlordCta,
} from '@/components/sections/HomeSections'

export default function HomePage() {
  useEffect(() => {
    document.title = 'Estate & Letting Agents London | Lettings, Sales & Management | Uniqletts'
  }, [])

  return (
    <>
      <Hero />
      <Services />
      <FeaturedProperties />
      <BlockManagement />
      <AreaHighlight />
      <ReviewsStrip />
      <LandlordCta />
    </>
  )
}
