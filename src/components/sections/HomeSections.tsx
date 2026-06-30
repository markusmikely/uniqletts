import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProperties, getSiteReviews, getHomepageSettings, imageUrl, sanityReady } from '@/lib/sanity'
import { MOCK_PROPERTIES, MOCK_REVIEWS } from '@/lib/mock'
import { formatPrice, formatAddress, formatReviewDate, sourceLabel } from '@/lib/format'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import type { Property, Review } from '@/types'
import styles from './HomeSections.module.css'

/* ============================================================
   SERVICES SECTION
   ============================================================ */

const SERVICES = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    title: 'Residential lettings',
    body: 'From studio flats to family homes across Bayswater, Queensway and W2. We match the right tenant to the right property — quickly, professionally, and with your best interests at heart.',
    href: '/properties?type=lettings',
    cta: 'Browse lettings',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    title: 'Property management',
    body: 'Fully managed, let-only or rent collection — choose the level of support that suits you. We handle everything from maintenance to compliance so you can enjoy the returns without the hassle.',
    href: '/landlords',
    cta: 'Landlord services',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Sales & valuations',
    body: 'Thinking of selling? Our knowledge of the W2 market means we price and market your property to attract the right buyers. Free, no-obligation valuations with honest, expert advice.',
    href: '/valuations',
    cta: 'Get a valuation',
  },
]

export function Services() {
  return (
    <section className={`section ${styles.services}`}>
      <div className="container">
        <div className={styles.servicesHeader}>
          <p className="eyebrow">What we do</p>
          <h2 className={styles.servicesTitle}>A personal service,<br />built on local knowledge</h2>
        </div>
        <div className={styles.servicesGrid}>
          {SERVICES.map((s, i) => (
            <article key={s.title} className={`card ${styles.serviceCard} animate-fade-up delay-${i + 1}`}>
              <div className={styles.serviceIcon}>{s.icon}</div>
              <h3 className={styles.serviceTitle}>{s.title}</h3>
              <p className={styles.serviceBody}>{s.body}</p>
              <Link to={s.href} className={`btn btn-ghost ${styles.serviceCta}`}>{s.cta} →</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function getImage(p: Property, width = 700): string {
  if (typeof p.mainImage === 'string') return p.mainImage
  if (p.mainImage) return imageUrl(p.mainImage, width)
  return ''
}

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    if (!sanityReady) {
      setProperties(MOCK_PROPERTIES.filter(p => p.isFeatured).slice(0, 3))
      return
    }
    getFeaturedProperties(3).then(setProperties)
  }, [])

  return (
    <section className={`section ${styles.featured}`}>
      <div className="container">
        <div className={styles.featuredHeader}>
          <div>
            <p className="eyebrow">Current listings</p>
            <h2>Featured properties</h2>
          </div>
          <Link to="/properties" className="btn btn-primary">View all properties</Link>
        </div>
        <div className={styles.propGrid}>
          {properties.map((p, i) => {
            const addr = formatAddress(p.address)
            const img = getImage(p)
            return (
              <Link key={p.slug} to={`/properties/${p.slug}`} className={`card ${styles.propCard} animate-fade-up delay-${i + 1}`} aria-label={`${addr} — ${formatPrice(p.price, p.pricePeriod)}`}>
                <div className={styles.propImageWrap}>
                  {img && <img src={img} alt={p.mainImageAlt ?? `Property at ${addr}`} className={styles.propImage} width={700} height={467} loading="lazy" decoding="async" />}
                  {p.tag && <span className={`badge badge-accent ${styles.propTagOverlay}`}>{p.tag}</span>}
                </div>
                <div className={styles.propBody}>
                  <p className={styles.propPrice}>{formatPrice(p.price, p.pricePeriod)}</p>
                  <p className={styles.propAddr}>{addr}</p>
                  <div className={styles.propMeta}>
                    <span className="badge badge-blue">{p.bedrooms} bed</span>
                    <span className="badge badge-blue">{p.bathrooms} bath</span>
                    <span className="badge badge-gray">{p.listingType === 'lettings' ? 'To let' : 'For sale'}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function BlockManagement() {
  const [section, setSection] = useState<{
    eyebrow?: string
    title?: string
    body?: string
    ctaLabel?: string
    ctaHref?: string
  } | null>(null)

  useEffect(() => {
    if (!sanityReady) return
    getHomepageSettings().then(data => {
      if (data?.blockManagement) setSection(data.blockManagement)
    })
  }, [])

  if (!section?.title) return null

  return (
    <section className="section" style={{ background: 'var(--color-xlight)' }}>
      <div className="container">
        {section.eyebrow && <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>{section.eyebrow}</p>}
        <h2>{section.title}</h2>
        {section.body && <p style={{ marginTop: '1rem', maxWidth: 640, color: 'var(--color-gray-600)', lineHeight: 1.7 }}>{section.body}</p>}
        {section.ctaHref && section.ctaLabel && (
          <Link to={section.ctaHref} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>{section.ctaLabel}</Link>
        )}
      </div>
    </section>
  )
}

export function AreaHighlight() {
  const [copy, setCopy] = useState<{
    eyebrow?: string
    title?: string
    paragraphs?: string[]
    imageCaption?: string
  } | null>(null)

  useEffect(() => {
    if (!sanityReady) return
    getHomepageSettings().then(data => {
      if (data?.areaHighlight) setCopy(data.areaHighlight)
    })
  }, [])

  const eyebrow = copy?.eyebrow ?? 'The neighbourhood'
  const title = copy?.title ?? 'The heart of West London'
  const paragraphs = copy?.paragraphs ?? [
    "Bayswater sits at one of London's most enviable intersections — Hyde Park to the south, Notting Hill to the west, Paddington's connectivity to the east.",
    "Queensway is mid a £1 billion regeneration with the return of Whiteleys as a luxury mixed-use destination.",
    "Whether you're a first-time renter, relocating professionally, or an investor looking for strong yields in a prime postcode — W2 consistently delivers.",
  ]

  return (
    <section className={`section ${styles.area}`}>
      <div className={`container ${styles.areaInner}`}>
        <div className={styles.areaImageWrap}>
          <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=75&auto=format&fit=crop" alt="Hyde Park, Bayswater" className={styles.areaImage} width={900} height={700} loading="lazy" decoding="async" />
          <div className={styles.areaImageCaption}>{copy?.imageCaption ?? 'Hyde Park — on your doorstep'}</div>
        </div>
        <div className={styles.areaCopy}>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <Link to="/area-guide" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Explore the area guide</Link>
        </div>
      </div>
    </section>
  )
}

export function ReviewsStrip() {
  const [reviews, setReviews] = useState<Review[]>([])
  const settings = useSiteSettings()

  useEffect(() => {
    if (!sanityReady) {
      setReviews(MOCK_REVIEWS)
      return
    }
    getSiteReviews().then(setReviews)
  }, [])

  const display = reviews.slice(0, 3)
  const rating = settings.aggregateRating ?? 4.9
  const count = settings.reviewCount ?? 34

  return (
    <section className={`section ${styles.reviews}`}>
      <div className="container">
        <div className={styles.reviewsHeader}>
          <p className="eyebrow">Client stories</p>
          <h2>What our clients say</h2>
          <div className={styles.reviewsAggregate}>
            <span className="stars">★★★★★</span>
            <span className={styles.reviewsScore}>{rating} average</span>
            <span className={styles.reviewsCount}>from {count} reviews</span>
          </div>
        </div>
        <div className={styles.reviewsGrid}>
          {display.map((r, i) => (
            <article key={r.id} className={`card ${styles.reviewCard} animate-fade-up delay-${i + 1}`}>
              <div className={styles.reviewTop}>
                <div><div className="stars">{'★'.repeat(r.rating)}</div></div>
                <span className={`badge badge-blue ${styles.reviewSource}`}>{sourceLabel(r.source)}</span>
              </div>
              <p className={styles.reviewText}>"{r.text}"</p>
              <div className={styles.reviewMeta}>
                <span className={styles.reviewAuthor}>{r.author}</span>
                <span className={styles.reviewDate}>{formatReviewDate(r.date)}</span>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.reviewsMore}>
          <Link to="/reviews" className="btn btn-ghost">Read all reviews →</Link>
        </div>
      </div>
    </section>
  )
}

export function LandlordCta() {
  return (
    <section className={styles.landlordCta} aria-label="Landlord call to action">
      <div className={`container ${styles.landlordCtaInner}`}>
        <div className={styles.landlordCtaCopy}>
          <p className="eyebrow">For landlords</p>
          <h2 className={styles.landlordCtaTitle}>Thinking of letting<br />your property?</h2>
          <p className={styles.landlordCtaSub}>
            Get an honest, no-obligation valuation from local experts who know exactly what your property is worth in today's W2 market.
          </p>
        </div>
        <div className={styles.landlordCtaActions}>
          <Link to="/valuations" className="btn btn-accent">Get a free valuation</Link>
          <Link to="/landlords" className="btn btn-primary">Landlord services</Link>
        </div>
      </div>
    </section>
  )
}
