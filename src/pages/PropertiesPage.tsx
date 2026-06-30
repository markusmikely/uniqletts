import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import { getAllProperties, sanityReady, imageUrl } from '@/lib/sanity'
import { MOCK_PROPERTIES } from '@/lib/mock'
import { formatPrice, formatAddress } from '@/lib/format'
import type { Property } from '@/types'
import styles from './PropertiesPage.module.css'

type ListingType = 'all' | 'lettings' | 'sales'

const STATUS_LABEL: Record<string, string> = {
  available: '',
  'let-agreed': 'Let agreed',
  'under-offer': 'Under offer',
  sold: 'Sold',
}

function getImage(p: Property, width = 600): string {
  if (typeof p.mainImage === 'string') return p.mainImage
  if (p.mainImage) return imageUrl(p.mainImage, width)
  return ''
}

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listingType, setListingType] = useState<ListingType>(
    (searchParams.get('type') as ListingType) ?? 'all'
  )
  const [minBeds, setMinBeds] = useState('any')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const featuredOnly = searchParams.get('featured') === 'true'

  useEffect(() => {
    document.title = 'Properties to Rent & Buy in Bayswater W2 | Uniqletts'
  }, [])

  useEffect(() => {
    setLoading(true)
    const minBedsNum = minBeds === 'any' ? 0 : parseInt(minBeds)

    if (!sanityReady) {
      let list = MOCK_PROPERTIES
      if (listingType !== 'all') list = list.filter(p => p.listingType === listingType)
      if (minBedsNum > 0) list = list.filter(p => p.bedrooms >= minBedsNum)
      if (featuredOnly) list = list.filter(p => p.isFeatured)
      setProperties(list)
      setLoading(false)
      return
    }

    getAllProperties({
      listingType: listingType !== 'all' ? listingType : undefined,
      minBeds: minBedsNum || undefined,
      featured: featuredOnly || undefined,
    }).then(data => {
      setProperties(data)
      setLoading(false)
    })
  }, [listingType, minBeds, featuredOnly])

  function handleTypeChange(t: ListingType) {
    setListingType(t)
    const params: Record<string, string> = {}
    if (t !== 'all') params.type = t
    if (featuredOnly) params.featured = 'true'
    setSearchParams(params)
  }

  return (
    <>
      <PageHero
        eyebrow="Bayswater · Queensway · W2"
        title="Properties to rent & buy"
        subtitle="Browse our current lettings and sales listings across Bayswater, Queensway and the wider W2 area."
        image="/images/heroes/properties.jpg"
        imagePosition="center 35%"
      />

      <div className={styles.filterBar}>
        <div className={`container ${styles.filterInner}`}>
          <div className={styles.tabs} role="tablist" aria-label="Listing type">
            {(['all', 'lettings', 'sales'] as ListingType[]).map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={listingType === t}
                className={`${styles.tab} ${listingType === t ? styles.tabActive : ''}`}
                onClick={() => handleTypeChange(t)}
              >
                {t === 'all' ? 'All' : t === 'lettings' ? 'To let' : 'For sale'}
              </button>
            ))}
          </div>

          <div className={styles.filterSelect}>
            <label htmlFor="beds" className={styles.filterLabel}>Bedrooms</label>
            <select
              id="beds"
              value={minBeds}
              onChange={e => setMinBeds(e.target.value)}
              className={styles.select}
            >
              <option value="any">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>
        </div>
      </div>

      <section className={`section ${styles.results}`}>
        <div className="container">
          {loading ? (
            <p className={styles.resultCount}>Loading properties…</p>
          ) : (
            <>
              <p className={styles.resultCount}>
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              </p>

              {properties.length === 0 ? (
                <div className={styles.empty}>
                  <p>No properties match your current filters.</p>
                  <button className="btn btn-primary" onClick={() => { setListingType('all'); setMinBeds('any') }}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className={styles.grid}>
                  {properties.map((p, i) => {
                    const addr = formatAddress(p.address)
                    const img = getImage(p)
                    return (
                      <Link
                        key={p.slug}
                        to={`/properties/${p.slug}`}
                        className={`card ${styles.propCard} animate-fade-up delay-${Math.min(i + 1, 5)}`}
                      >
                        <div className={styles.imageWrap}>
                          {img && (
                            <img
                              src={img}
                              alt={p.mainImageAlt ?? `Property at ${addr}`}
                              className={styles.image}
                              width={600}
                              height={400}
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          {p.tag && (
                            <span className={`badge badge-accent ${styles.tagOverlay}`}>{p.tag}</span>
                          )}
                          {STATUS_LABEL[p.status] && (
                            <span className={`badge badge-gray ${styles.statusOverlay}`}>
                              {STATUS_LABEL[p.status]}
                            </span>
                          )}
                        </div>
                        <div className={styles.body}>
                          <p className={styles.price}>{formatPrice(p.price, p.pricePeriod)}</p>
                          <p className={styles.address}>{addr}</p>
                          <div className={styles.meta}>
                            <span className="badge badge-blue">{p.bedrooms} bed</span>
                            <span className="badge badge-blue">{p.bathrooms} bath</span>
                            <span className="badge badge-gray">
                              {p.listingType === 'lettings' ? 'To let' : 'For sale'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
