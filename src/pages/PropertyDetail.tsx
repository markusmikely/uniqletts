import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import PortableText from '@/components/ui/PortableText'
import { getPropertyBySlug, getVideoEmbedUrl } from '@/lib/sanity'
import { trackPropertyView, submitEnquiry } from '@/lib/api'
import { formatPrice, formatAddress, whatsappPropertyUrl } from '@/lib/format'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import type { Property } from '@/types'
import type { PortableTextBlock } from '@portabletext/types'
import styles from './PropertyDetail.module.css'

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [property, setProperty] = useState<Property | null | undefined>(undefined)
  const [activeImg, setActiveImg] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', message: '', website: '' })
  const tracked = useRef(false)
  const settings = useSiteSettings()

  useEffect(() => {
    if (!slug) return
    setProperty(undefined)
    tracked.current = false
    getPropertyBySlug(slug).then(data => {
      setProperty(data)
      if (data) document.title = `${data.title} | Uniqletts`
    })
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (property?._id && !tracked.current) {
      tracked.current = true
      trackPropertyView(property._id)
    }
  }, [property?._id])

  if (property === undefined) {
    return (
      <div className={styles.notFound}>
        <div className="container"><p>Loading property…</p></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className={styles.notFound}>
        <div className="container">
          <h1>Property not found</h1>
          <p>This listing may have been removed or the URL is incorrect.</p>
          <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to properties
          </Link>
        </div>
      </div>
    )
  }

  const address = formatAddress(property.address)
  const priceStr = formatPrice(property.price, property.pricePeriod)
  const images = property.images?.filter(img => img.url) ?? []
  const videoUrl = getVideoEmbedUrl(property.video)
  const availableLabel = property.availableFrom
    ? new Date(property.availableFrom).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Now'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitEnquiry({
        type: 'viewing',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        preferredDate: form.date,
        propertySlug: slug,
        propertyId: property?._id,
        website: form.website,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const waUrl = settings.whatsappNumber
    ? whatsappPropertyUrl(settings.whatsappNumber, property.title, property.slug)
    : null

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/properties">Properties</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{address}</span>
        </div>
      </nav>

      <div className={`container ${styles.layout}`}>
        <div className={styles.main}>
          {images.length > 0 && (
            <div className={styles.gallery}>
              <div className={styles.galleryMain}>
                <img
                  src={images[activeImg].url}
                  alt={images[activeImg].alt}
                  className={styles.galleryMainImg}
                  width={1200}
                  height={800}
                  loading="eager"
                  decoding="async"
                />
              </div>
              {images.length > 1 && (
                <div className={styles.galleryThumbs}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`View image ${i + 1}: ${img.alt}`}
                    >
                      <img src={img.url} alt={img.alt} width={200} height={133} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <div>
                <h1 className={styles.title}>{property.title}</h1>
                <p className={styles.address}>{address}</p>
              </div>
              <div className={styles.priceBlock}>
                <span className={styles.price}>{priceStr.split(' ')[0]}</span>
                {property.pricePeriod !== 'sale' && (
                  <span className={styles.pricePeriod}> {property.pricePeriod}</span>
                )}
              </div>
            </div>
            <div className={styles.keyFacts}>
              <span className="badge badge-blue">{property.bedrooms} bed</span>
              <span className="badge badge-blue">{property.bathrooms} bath</span>
              {property.epcRating && <span className="badge badge-gray">EPC {property.epcRating}</span>}
              <span className="badge badge-gray">Available {availableLabel}</span>
              {property.status === 'available'
                ? <span className="badge badge-blue">{property.listingType === 'lettings' ? 'To let' : 'For sale'}</span>
                : <span className="badge badge-accent">Let agreed</span>
              }
            </div>
          </div>

          <hr className="divider" />

          <div className={styles.description}>
            <h2 className={styles.sectionTitle}>About this property</h2>
            {Array.isArray(property.description) ? (
              <PortableText value={property.description as PortableTextBlock[]} />
            ) : (
              property.description && <p>{property.description}</p>
            )}
          </div>

          {property.features && property.features.length > 0 && (
            <>
              <hr className="divider" />
              <div className={styles.features}>
                <h2 className={styles.sectionTitle}>Property features</h2>
                <ul className={styles.featureList}>
                  {property.features.map(f => (
                    <li key={f} className={styles.featureItem}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" className={styles.featureIcon}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {property.floorplanUrl && (
            <>
              <hr className="divider" />
              <div className={styles.features}>
                <h2 className={styles.sectionTitle}>Floor plan</h2>
                <img
                  src={property.floorplanUrl}
                  alt={`Floor plan for ${property.title}`}
                  style={{ width: '100%', maxWidth: 600, borderRadius: 'var(--radius-lg)' }}
                  loading="lazy"
                />
              </div>
            </>
          )}

          {videoUrl && (
            <>
              <hr className="divider" />
              <div className={styles.videoSection}>
                <h2 className={styles.sectionTitle}>Video tour</h2>
                <div className={styles.videoWrap}>
                  <iframe
                    src={videoUrl}
                    title="Property video tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.enquiryCard}>
            {submitted ? (
              <div className={styles.successMsg}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--color-primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>Request sent</h3>
                <p>We'll be in touch to arrange your viewing. Thank you.</p>
              </div>
            ) : (
              <>
                <div className={styles.enquiryHeader}>
                  <p className={styles.enquiryPrice}>{priceStr}</p>
                  <p className={styles.enquiryAddr}>{address}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  <input type="text" name="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div className={styles.field}>
                    <label htmlFor="name" className={styles.label}>Full name</label>
                    <input id="name" type="text" required autoComplete="name" placeholder="Jane Smith" className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>Email address</label>
                    <input id="email" type="email" required autoComplete="email" placeholder="jane@example.com" className={styles.input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone" className={styles.label}>Phone number</label>
                    <input id="phone" type="tel" autoComplete="tel" placeholder="+44 7700 000000" className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="date" className={styles.label}>Preferred viewing date</label>
                    <input id="date" type="date" className={styles.input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="message" className={styles.label}>Message <span className={styles.optional}>(optional)</span></label>
                    <textarea id="message" rows={3} placeholder="Any questions about the property…" className={`${styles.input} ${styles.textarea}`} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {error && <p style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>{error}</p>}
                  <button type="submit" className={`btn btn-accent ${styles.submitBtn}`} disabled={submitting}>
                    {submitting ? 'Sending…' : 'Request a viewing'}
                  </button>
                </form>

                {waUrl && (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', textAlign: 'center' }}>
                    WhatsApp about this property
                  </a>
                )}

                <div className={styles.agentContact}>
                  <p className={styles.agentName}>Speak to Rupa</p>
                  <a href={`tel:+${settings.phone?.replace(/\s/g, '') ?? '442035442456'}`} className={styles.agentPhone}>{settings.phone}</a>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
