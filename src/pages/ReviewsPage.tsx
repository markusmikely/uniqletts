import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import { getSiteReviews, sanityReady } from '@/lib/sanity'
import { submitReview } from '@/lib/api'
import { MOCK_REVIEWS } from '@/lib/mock'
import { formatReviewDate, sourceLabel } from '@/lib/format'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import type { Review } from '@/types'
import styles from './InnerPage.module.css'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ author: '', rating: 5, text: '', website: '' })
  const settings = useSiteSettings()

  useEffect(() => {
    document.title = 'Reviews | Uniqletts'
    if (!sanityReady) {
      setReviews(MOCK_REVIEWS)
      return
    }
    getSiteReviews().then(setReviews)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitReview(form)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Client stories"
        title="What our clients say"
        subtitle="Read reviews from landlords, tenants and buyers who have worked with Uniqletts."
        image="/images/heroes/about.jpg"
        imagePosition="center 30%"
      />

      <div style={{ borderBottom: '1px solid var(--color-gray-200)', padding: '1.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="stars" style={{ fontSize: '1.5rem' }}>★★★★★</span>
          <p style={{ marginTop: '0.5rem', color: 'var(--color-gray-600)' }}>
            {settings.aggregateRating ?? 4.9} average from {settings.reviewCount ?? 34} reviews
          </p>
        </div>
      </div>

      <section className={`section ${styles.section}`}>
        <div className="container">
          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {reviews.map(r => (
              <article key={r.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="stars">{'★'.repeat(r.rating)}</span>
                  <span className="badge badge-blue">{sourceLabel(r.source)}</span>
                </div>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1rem' }}>"{r.text}"</p>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)' }}>
                  <strong>{r.author}</strong> · {formatReviewDate(r.date)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.sectionTint}`} id="add-review">
        <div className="container">
          <div style={{ maxWidth: 560 }}>
            <h2 className={styles.sectionTitle}>Leave a review</h2>
            <p className={styles.bodyText}>Share your experience with Uniqletts. Reviews are moderated before appearing on the site.</p>
            {submitted ? (
              <div className={styles.successBox}>
                <h3>Thank you!</h3>
                <p>Your review has been submitted and will appear once approved.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <input type="text" name="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className={styles.field}>
                  <label htmlFor="r-author" className={styles.label}>Your name</label>
                  <input id="r-author" type="text" required className={styles.input} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="r-rating" className={styles.label}>Rating</label>
                  <select id="r-rating" className={styles.input} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseInt(e.target.value) }))}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="r-text" className={styles.label}>Your review</label>
                  <textarea id="r-text" rows={4} required className={`${styles.input} ${styles.textarea}`} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
                </div>
                {error && <p style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>{error}</p>}
                <button type="submit" className="btn btn-accent" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaBandInner}`}>
          <div>
            <h2>Ready to work with us?</h2>
            <p className={styles.bodyText} style={{ marginTop: '0.5rem' }}>Get in touch or browse our current properties.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">Contact us</Link>
            <Link to="/properties" className="btn btn-accent">View properties</Link>
          </div>
        </div>
      </section>
    </>
  )
}
