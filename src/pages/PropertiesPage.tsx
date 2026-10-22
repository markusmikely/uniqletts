import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import CardGallery, { type CardImage } from '@/components/properties/CardGallery'
import { getAllProperties, sanityReady, imageUrl } from '@/lib/sanity'
import { MOCK_PROPERTIES } from '@/lib/mock'
import { formatPrice, formatAddress } from '@/lib/format'
import type { Property } from '@/types'
import styles from './PropertiesPage.module.css'
import propertiesHero from '@/assets/heroes/properties-mansion-block.jpg'

const PropertiesMap = lazy(() => import('@/components/properties/PropertiesMap'))

type ListingType = 'all' | 'lettings' | 'sales'
type ViewMode = 'grid' | 'list' | 'map'

const STATUS_LABEL: Record<string, string> = {
  available: '',
  'let-agreed': 'Let agreed',
  'under-offer': 'Under offer',
  sold: 'Sold',
}

/** Canonical "extras" matched by keyword against features, title and description. */
export const EXTRAS: { id: string; label: string; pattern: RegExp }[] = [
  { id: 'balcony', label: 'Balcony / terrace', pattern: /balcon|terrace/i },
  { id: 'garden', label: 'Garden', pattern: /garden/i },
  { id: 'parking', label: 'Parking', pattern: /parking/i },
  { id: 'furnished', label: 'Furnished', pattern: /(?<!un)furnished/i },
  { id: 'lift', label: 'Lift', pattern: /\blift\b|elevator/i },
  { id: 'gym', label: 'Gym', pattern: /\bgym\b/i },
  { id: 'concierge', label: 'Concierge / porter', pattern: /concierge|porter/i },
  { id: 'bills', label: 'Bills included', pattern: /bills? (are )?(included|inclusive)|few bills/i },
]

/** All searchable text for a property, used for extras matching. */
export function propertySearchText(p: Property): string {
  const description = typeof p.description === 'string' ? p.description : ''
  return [p.title, p.excerpt, description, ...(p.features ?? [])].filter(Boolean).join(' ')
}

export interface PropertyFilters {
  listingType: ListingType
  minBeds: number
  minBaths: number
  minPrice: number
  maxPrice: number
  propertyType: string
  availableOnly: boolean
  extras: string[]
  featuredOnly: boolean
}

export const DEFAULT_FILTERS: PropertyFilters = {
  listingType: 'all',
  minBeds: 0,
  minBaths: 0,
  minPrice: 0,
  maxPrice: 0,
  propertyType: 'any',
  availableOnly: false,
  extras: [],
  featuredOnly: false,
}

/** Monthly-equivalent rent (pw → pcm) so price filters compare like for like. */
export function normalisedPrice(p: Property): number {
  if (p.pricePeriod === 'pw') return Math.round((p.price * 52) / 12)
  return p.price
}

export function applyFilters(list: Property[], f: PropertyFilters): Property[] {
  return list.filter(p => {
    if (f.listingType !== 'all' && p.listingType !== f.listingType) return false
    if (f.featuredOnly && !p.isFeatured) return false
    if (f.minBeds > 0 && p.bedrooms < f.minBeds) return false
    if (f.minBaths > 0 && p.bathrooms < f.minBaths) return false
    if (f.propertyType !== 'any' && p.propertyType !== f.propertyType) return false
    if (f.availableOnly && p.status !== 'available') return false
    const price = normalisedPrice(p)
    if (f.minPrice > 0 && price < f.minPrice) return false
    if (f.maxPrice > 0 && price > f.maxPrice) return false
    if (f.extras.length > 0) {
      const text = propertySearchText(p)
      if (!f.extras.every(id => EXTRAS.find(e => e.id === id)?.pattern.test(text))) return false
    }
    return true
  })
}

const LETTINGS_PRICES = [1000, 1500, 2000, 2500, 3000, 4000, 5000]
const SALES_PRICES = [300000, 400000, 500000, 750000, 1000000, 1500000]

function priceLabel(v: number, type: ListingType): string {
  if (type === 'sales') return v >= 1000000 ? `£${v / 1000000}m` : `£${v / 1000}k`
  return `£${v.toLocaleString('en-GB')} pcm`
}

function getImage(p: Property, width = 600): string {
  if (typeof p.mainImage === 'string') return p.mainImage
  if (p.mainImage) return imageUrl(p.mainImage, width)
  return ''
}

/** All card photos as ready-to-render URLs, falling back to the single
    main image (or a mock string URL) when the full list isn't available. */
function getCardImages(p: Property, width = 600): CardImage[] {
  const list = (p.cardImages ?? [])
    .map(img => ({ url: img.asset ? imageUrl(img.asset, width) : '', alt: img.alt }))
    .filter(img => img.url)
  if (list.length) return list
  const single = getImage(p, width)
  return single ? [{ url: single, alt: p.mainImageAlt }] : []
}

/* ---- view icons -------------------------------------------- */
const VIEW_META: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    id: 'grid',
    label: 'Grid',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'list',
    label: 'List',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    id: 'map',
    label: 'Map',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6.75V18m-10.5-9.75L9 6.75l6 2.25 5.25-1.5a.6.6 0 01.75.58v9.17a.6.6 0 01-.45.58L15 19.5 9 17.25l-5.25 1.5a.6.6 0 01-.75-.58V8.83a.6.6 0 01.45-.58z" />
      </svg>
    ),
  },
]

/* ---- card fragments ----------------------------------------- */
function CardBadges({ p }: { p: Property }) {
  return (
    <div className={styles.meta}>
      <span className="badge badge-blue">{p.bedrooms} bed</span>
      <span className="badge badge-blue">{p.bathrooms} bath</span>
      {p.propertyType && <span className="badge badge-gray">{p.propertyType}</span>}
      <span className="badge badge-gray">{p.listingType === 'lettings' ? 'To let' : 'For sale'}</span>
    </div>
  )
}

function GridCard({ p, index }: { p: Property; index: number }) {
  const addr = formatAddress(p.address)
  const images = getCardImages(p)
  return (
    <Link to={`/properties/${p.slug}`} className={`card ${styles.propCard} animate-fade-up delay-${Math.min(index + 1, 5)}`}>
      <div className={styles.imageWrap}>
        <CardGallery images={images} altBase={`Property at ${addr}`} width={600} height={400}>
          {p.tag && <span className={`badge badge-accent ${styles.tagOverlay}`}>{p.tag}</span>}
          {STATUS_LABEL[p.status] && <span className={`badge badge-gray ${styles.statusOverlay}`}>{STATUS_LABEL[p.status]}</span>}
        </CardGallery>
      </div>
      <div className={styles.body}>
        <p className={styles.price}>{formatPrice(p.price, p.pricePeriod)}</p>
        <p className={styles.address}>{addr}</p>
        <CardBadges p={p} />
      </div>
    </Link>
  )
}

function ListCard({ p }: { p: Property }) {
  const addr = formatAddress(p.address)
  const images = getCardImages(p, 500)
  const excerpt = (p.excerpt ?? '').replace(/\s+/g, ' ').trim()
  return (
    <Link to={`/properties/${p.slug}`} className={`card ${styles.listCard}`}>
      <div className={styles.listImageWrap}>
        <CardGallery images={images} altBase={`Property at ${addr}`} width={500} height={340}>
          {STATUS_LABEL[p.status] && <span className={`badge badge-gray ${styles.statusOverlay}`}>{STATUS_LABEL[p.status]}</span>}
        </CardGallery>
      </div>
      <div className={styles.listBody}>
        <div className={styles.listHeader}>
          <p className={styles.price}>{formatPrice(p.price, p.pricePeriod)}</p>
          {p.tag && <span className="badge badge-accent">{p.tag}</span>}
        </div>
        <h3 className={styles.listTitle}>{p.title}</h3>
        <p className={styles.address}>{addr}</p>
        {excerpt && <p className={styles.listExcerpt}>{excerpt}</p>}
        <div className={styles.listFooter}>
          <CardBadges p={p} />
          <span className={`btn btn-primary ${styles.listCta}`}>View property →</span>
        </div>
      </div>
    </Link>
  )
}

function MapCard({ p, selected, onHover }: { p: Property; selected: boolean; onHover: () => void }) {
  const addr = formatAddress(p.address)
  const images = getCardImages(p, 400)
  return (
    <Link
      to={`/properties/${p.slug}`}
      data-slug={p.slug}
      className={`card ${styles.mapCard} ${selected ? styles.mapCardSelected : ''}`}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      <div className={styles.mapCardImageWrap}>
        <CardGallery images={images} altBase={`Property at ${addr}`} width={400} height={260} />
      </div>
      <div className={styles.mapCardBody}>
        <p className={styles.mapCardPrice}>{formatPrice(p.price, p.pricePeriod)}</p>
        <p className={styles.mapCardAddr}>{addr}</p>
        <div className={styles.meta}>
          <span className="badge badge-blue">{p.bedrooms} bed</span>
          <span className="badge badge-blue">{p.bathrooms} bath</span>
        </div>
      </div>
    </Link>
  )
}

/* ---- page ---------------------------------------------------- */
export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState<PropertyFilters>(() => ({
    ...DEFAULT_FILTERS,
    listingType: (['lettings', 'sales'].includes(searchParams.get('type') ?? '') ? searchParams.get('type') : 'all') as ListingType,
    minBeds: parseInt(searchParams.get('beds') ?? '0') || 0,
    maxPrice: parseInt(searchParams.get('maxPrice') ?? '0') || 0,
    featuredOnly: searchParams.get('featured') === 'true',
  }))
  const [view, setView] = useState<ViewMode>(
    (['grid', 'list', 'map'].includes(searchParams.get('view') ?? '') ? searchParams.get('view') : 'grid') as ViewMode
  )
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [all, setAll] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const mapListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Properties to Rent & Buy in London | Uniqletts'
  }, [])

  /* Fetch the full list once — filtering is instant and client-side. */
  useEffect(() => {
    if (!sanityReady) {
      setAll(MOCK_PROPERTIES)
      setLoading(false)
      return
    }
    getAllProperties().then(data => {
      setAll(data)
      setLoading(false)
    })
  }, [])

  const properties = useMemo(() => applyFilters(all, filters), [all, filters])

  /* Keep shareable state in the URL */
  function syncUrl(next: PropertyFilters, nextView: ViewMode) {
    const params: Record<string, string> = {}
    if (next.listingType !== 'all') params.type = next.listingType
    if (next.minBeds > 0) params.beds = String(next.minBeds)
    if (next.maxPrice > 0) params.maxPrice = String(next.maxPrice)
    if (next.featuredOnly) params.featured = 'true'
    if (nextView !== 'grid') params.view = nextView
    setSearchParams(params, { replace: true })
  }

  function update(patch: Partial<PropertyFilters>) {
    const next = { ...filters, ...patch }
    setFilters(next)
    syncUrl(next, view)
  }

  function changeView(v: ViewMode) {
    setView(v)
    syncUrl(filters, v)
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    syncUrl(DEFAULT_FILTERS, view)
  }

  function selectOnMap(slug: string) {
    setSelectedSlug(slug)
    const card = mapListRef.current?.querySelector(`[data-slug="${slug}"]`)
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }

  const priceOptions = filters.listingType === 'sales' ? SALES_PRICES : LETTINGS_PRICES
  const activeAdvancedCount =
    (filters.minBaths > 0 ? 1 : 0) +
    (filters.propertyType !== 'any' ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    filters.extras.length

  return (
    <>
      <PageHero
        eyebrow="Central & Greater London"
        title="Properties to rent & buy"
        subtitle="Browse our current lettings and sales listings across central and Greater London — from Bayswater and Kensington to London Bridge and beyond."
        image={propertiesHero}
        imageAlt="Red-brick mansion blocks on a London street"
        imagePosition="center 35%"
      />

      <div className={styles.filterBar}>
        <div className={`container ${styles.filterInner}`}>
          <div className={styles.tabs} role="tablist" aria-label="Listing type">
            {(['all', 'lettings', 'sales'] as ListingType[]).map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={filters.listingType === t}
                className={`${styles.tab} ${filters.listingType === t ? styles.tabActive : ''}`}
                onClick={() => update({ listingType: t, minPrice: 0, maxPrice: 0 })}
              >
                {t === 'all' ? 'All' : t === 'lettings' ? 'To let' : 'For sale'}
              </button>
            ))}
          </div>

          <div className={styles.filterSelect}>
            <label htmlFor="beds" className={styles.filterLabel}>Beds</label>
            <select id="beds" value={filters.minBeds} onChange={e => update({ minBeds: Number(e.target.value) })} className={styles.select}>
              <option value="0">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {filters.listingType !== 'all' && (
            <>
              <div className={styles.filterSelect}>
                <label htmlFor="min-price" className={styles.filterLabel}>Min price</label>
                <select id="min-price" value={filters.minPrice} onChange={e => update({ minPrice: Number(e.target.value) })} className={styles.select}>
                  <option value="0">No min</option>
                  {priceOptions.map(v => (
                    <option key={v} value={v}>{priceLabel(v, filters.listingType)}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterSelect}>
                <label htmlFor="max-price" className={styles.filterLabel}>Max price</label>
                <select id="max-price" value={filters.maxPrice} onChange={e => update({ maxPrice: Number(e.target.value) })} className={styles.select}>
                  <option value="0">No max</option>
                  {priceOptions.map(v => (
                    <option key={v} value={v}>{priceLabel(v, filters.listingType)}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            className={`${styles.advancedToggle} ${showAdvanced || activeAdvancedCount > 0 ? styles.advancedToggleActive : ''}`}
            onClick={() => setShowAdvanced(s => !s)}
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" d="M4 7h16M7 12h10m-7 5h4" />
            </svg>
            More filters{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ''}
          </button>

          <div className={styles.viewToggle} role="group" aria-label="View mode">
            {VIEW_META.map(v => (
              <button
                key={v.id}
                className={`${styles.viewBtn} ${view === v.id ? styles.viewBtnActive : ''}`}
                onClick={() => changeView(v.id)}
                aria-pressed={view === v.id}
                aria-label={`${v.label} view`}
              >
                {v.icon}
                <span className={styles.viewBtnLabel}>{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {showAdvanced && (
          <div id="advanced-filters" className={styles.advancedPanel}>
            <div className={`container ${styles.advancedInner}`}>
              <div className={styles.filterSelect}>
                <label htmlFor="baths" className={styles.filterLabel}>Bathrooms</label>
                <select id="baths" value={filters.minBaths} onChange={e => update({ minBaths: Number(e.target.value) })} className={styles.select}>
                  <option value="0">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div className={styles.filterSelect}>
                <label htmlFor="ptype" className={styles.filterLabel}>Property type</label>
                <select id="ptype" value={filters.propertyType} onChange={e => update({ propertyType: e.target.value })} className={styles.select}>
                  <option value="any">Any</option>
                  <option value="studio">Studio</option>
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                  <option value="maisonette">Maisonette</option>
                </select>
              </div>

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={e => update({ availableOnly: e.target.checked })}
                />
                Available only
              </label>

              <div className={styles.extras} role="group" aria-label="Extras">
                {EXTRAS.map(extra => {
                  const active = filters.extras.includes(extra.id)
                  return (
                    <button
                      key={extra.id}
                      className={`${styles.extraChip} ${active ? styles.extraChipActive : ''}`}
                      aria-pressed={active}
                      onClick={() =>
                        update({
                          extras: active
                            ? filters.extras.filter(id => id !== extra.id)
                            : [...filters.extras, extra.id],
                        })
                      }
                    >
                      {extra.label}
                    </button>
                  )
                })}
              </div>

              <button className={styles.clearBtn} onClick={clearFilters}>Clear all</button>
            </div>
          </div>
        )}
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
                  <button className="btn btn-primary" onClick={clearFilters}>Clear filters</button>
                </div>
              ) : view === 'grid' ? (
                <div className={styles.grid}>
                  {properties.map((p, i) => <GridCard key={p.slug} p={p} index={i} />)}
                </div>
              ) : view === 'list' ? (
                <div className={styles.listStack}>
                  {properties.map(p => <ListCard key={p.slug} p={p} />)}
                </div>
              ) : (
                <div className={styles.mapLayout}>
                  <div className={styles.mapListPane} ref={mapListRef}>
                    {properties.map(p => (
                      <MapCard
                        key={p.slug}
                        p={p}
                        selected={p.slug === selectedSlug}
                        onHover={() => setSelectedSlug(p.slug)}
                      />
                    ))}
                  </div>
                  <div className={styles.mapPane}>
                    <Suspense fallback={<div className={styles.mapLoading}>Loading map…</div>}>
                      <PropertiesMap
                        properties={properties}
                        selectedSlug={selectedSlug}
                        onSelect={selectOnMap}
                      />
                    </Suspense>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
