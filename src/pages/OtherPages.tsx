/* ============================================================
   TenantsPage
   ============================================================ */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import { submitEnquiry } from '@/lib/api'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import styles from './InnerPage.module.css'

export function TenantsPage() {
  useEffect(() => {
    document.title = 'Tenant Services | Flats to Rent Bayswater W2 | Uniqletts'
  }, [])

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', property: '', issue: '', website: '' })

  async function handleMaintenance(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitEnquiry({
        type: 'maintenance',
        name: form.name,
        email: form.email,
        maintenanceAddress: form.property,
        maintenanceIssue: form.issue,
        website: form.website,
      })
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
        eyebrow="For tenants"
        title="Find your perfect home in W2"
        subtitle="We work hard to match you with the right property — and we're here to support you throughout your tenancy, not just on move-in day."
        image="/images/heroes/tenants.jpg"
        imagePosition="center 25%"
      >
        <Link to="/properties?type=lettings" className="btn btn-accent">Browse lettings</Link>
      </PageHero>

      <section className={`section ${styles.section}`}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>How it works</p>
          <h2 className={styles.sectionTitle}>Finding and renting your home</h2>
          <div className={styles.steps}>
            {[
              { num: '01', title: 'Register your interest', body: 'Tell us what you\'re looking for — area, size, budget, move date. We\'ll match you to properties before they\'re even advertised.' },
              { num: '02', title: 'View properties', body: 'We arrange viewings at times that suit you, including evenings and weekends. We\'ll be honest about every property — no hard sell.' },
              { num: '03', title: 'Make an application', body: 'Found the one? We\'ll guide you through the referencing process: credit check, employment verification and previous landlord reference.' },
              { num: '04', title: 'Move in', body: 'Sign your tenancy, pay your deposit (protected with TDS), complete the inventory check-in — and the keys are yours.' },
            ].map((step, i, arr) => (
              <div key={step.num} className={styles.step}>
                <div className={styles.stepNum}>{step.num}</div>
                {i < arr.length - 1 && <div className={styles.stepLine} aria-hidden="true" />}
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.sectionTint}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What we'll need from you</h2>
          <div className={styles.complianceBox} style={{ maxWidth: '560px' }}>
            <div className={styles.complianceList}>
              {[
                'Proof of identity (passport or driving licence)',
                'Proof of address (utility bill or bank statement)',
                'Last 3 months\' bank statements',
                'Employer reference or accountant letter (self-employed)',
                'Previous landlord reference',
                'Income typically 2.5× annual rent',
              ].map(item => (
                <div key={item} className={styles.complianceItem}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance form */}
      <section className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.formGrid}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Existing tenants</p>
              <h2 className={styles.sectionTitle}>Report a maintenance issue</h2>
              <p className={styles.bodyText}>If you're an existing Uniqletts tenant and have a maintenance request, use this form and we'll respond within one working day.</p>
              {submitted ? (
                <div className={styles.successBox}>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3>Request received</h3>
                  <p>We'll be in touch within one working day.</p>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleMaintenance} noValidate>
                  <input type="text" name="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div className={styles.field}>
                    <label htmlFor="t-name" className={styles.label}>Your name</label>
                    <input id="t-name" type="text" required className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="t-email" className={styles.label}>Email address</label>
                    <input id="t-email" type="email" required className={styles.input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="t-property" className={styles.label}>Property address</label>
                    <input id="t-property" type="text" required className={styles.input} value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="t-issue" className={styles.label}>Describe the issue</label>
                    <textarea id="t-issue" rows={4} required className={`${styles.input} ${styles.textarea}`} value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} />
                  </div>
                  <button type="submit" className={`btn btn-accent ${styles.submitBtn}`} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit request'}
                  </button>
                  {error && <p style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>{error}</p>}
                </form>
              )}
            </div>
            <div className={styles.infoPanel}>
              <div className={styles.infoPanelCard}>
                <h3 className={styles.infoPanelTitle}>Emergency contacts</h3>
                <div className={styles.infoPanelList}>
                  <div className={styles.infoPanelItem}><strong>Gas emergency:</strong> National Gas 0800 111 999</div>
                  <div className={styles.infoPanelItem}><strong>Electricity:</strong> UK Power Networks 105</div>
                  <div className={styles.infoPanelItem}><strong>Uniqletts:</strong> 020 3544 2456</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ============================================================
   ValuationsPage
   ============================================================ */
export function ValuationsPage() {
  useEffect(() => {
    document.title = 'Free Property Valuation Bayswater W2 | Uniqletts'
  }, [])

  const settings = useSiteSettings()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: '', beds: '', callTime: '', message: '', website: '' })

  const marketStats = settings.marketSnapshot ?? [
    { label: 'Avg 1-bed rent', value: '£1,850–£2,200 pcm' },
    { label: 'Avg 2-bed rent', value: '£2,400–£3,200 pcm' },
    { label: 'Avg yield', value: '3.5–4.5%' },
    { label: 'Days to let', value: 'avg 14–21 days' },
  ]

  async function handleValuation(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitEnquiry({
        type: 'valuation',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        valuationAddress: form.address,
        valuationPropertyType: form.type,
        valuationBedrooms: form.beds,
        preferredCallTime: form.callTime,
        website: form.website,
      })
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
        eyebrow="Free valuation"
        title="What is your property worth?"
        subtitle="Get an accurate, honest valuation from agents who know the Bayswater and W2 market better than anyone. No obligation, no pressure."
        image="/images/heroes/valuations.jpg"
        imagePosition="center 45%"
      />

      <section className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.formGrid}>
            {submitted ? (
              <div className={styles.successBox}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3>Valuation request received</h3>
                <p>We'll call you within one working day to arrange a convenient time to visit.</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleValuation} noValidate>
                <input type="text" name="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className={styles.field}>
                  <label htmlFor="v-address" className={styles.label}>Property address</label>
                  <input id="v-address" type="text" required placeholder="23 Queensway, London W2" className={styles.input} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.field}>
                    <label htmlFor="v-type" className={styles.label}>Property type</label>
                    <select id="v-type" className={styles.input} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="">Select…</option>
                      <option>Studio</option><option>Flat</option><option>House</option><option>Maisonette</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="v-beds" className={styles.label}>Bedrooms</label>
                    <select id="v-beds" className={styles.input} value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))}>
                      <option value="">Select…</option>
                      <option>Studio</option><option>1</option><option>2</option><option>3</option><option>4+</option>
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor="v-name" className={styles.label}>Your name</label>
                  <input id="v-name" type="text" required autoComplete="name" className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="v-email" className={styles.label}>Email address</label>
                  <input id="v-email" type="email" required autoComplete="email" className={styles.input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="v-phone" className={styles.label}>Phone number</label>
                  <input id="v-phone" type="tel" required autoComplete="tel" className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="v-time" className={styles.label}>Best time to call</label>
                  <select id="v-time" className={styles.input} value={form.callTime} onChange={e => setForm(f => ({ ...f, callTime: e.target.value }))}>
                    <option value="">Any time</option>
                    <option>Morning (9am–12pm)</option><option>Afternoon (12pm–5pm)</option><option>Evening (5pm–7pm)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="v-message" className={styles.label}>Anything else we should know?</label>
                  <textarea id="v-message" rows={3} className={`${styles.input} ${styles.textarea}`} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-accent" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Request my free valuation'}
                </button>
                {error && <p style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>{error}</p>}
              </form>
            )}

            <div className={styles.infoPanel}>
              <div className={styles.infoPanelCard}>
                <h3 className={styles.infoPanelTitle}>Why get a valuation?</h3>
                <div className={styles.infoPanelList}>
                  {['Accurate pricing from local experts', 'No obligation — just honest advice', 'Market comparison with recent W2 sales & lets', 'Advice on presenting your property', 'Guidance on fees and what to expect'].map(item => (
                    <div key={item} className={styles.infoPanelItem}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--color-mid)', flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.infoPanelCard}>
                <h3 className={styles.infoPanelTitle}>W2 market snapshot</h3>
                <div className={styles.infoPanelList}>
                  {marketStats.map(stat => (
                    <div key={stat.label} className={styles.infoPanelItem}><strong>{stat.label}:</strong> {stat.value}</div>
                  ))}
                </div>
              </div>
              <div className={styles.infoPanelCard} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p className={styles.infoPanelTitle} style={{ marginBottom: 0 }}>Speak to Rupa directly</p>
                <a href={`tel:+${settings.phone?.replace(/\s/g, '')}`} style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-primary)', textDecoration: 'none' }}>{settings.phone}</a>
                <a href={`mailto:${settings.email}`} style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)' }}>{settings.email}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ============================================================
   AreaGuidePage
   ============================================================ */
export function AreaGuidePage() {
  useEffect(() => {
    document.title = 'Bayswater & W2 Area Guide | Living in West London | Uniqletts'
  }, [])

  const SECTIONS = [
    { title: 'Hyde Park & green spaces', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=75&auto=format&fit=crop', body: 'Hyde Park sits immediately south of Bayswater — one of London\'s largest Royal Parks and arguably its most loved. Kensington Gardens, the Serpentine Gallery and the Italian Gardens are all within a 10-minute walk. For residents, this means morning runs, weekend picnics and world-class outdoor events year-round.' },
    { title: 'Queensway & Whiteleys', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=75&auto=format&fit=crop', body: 'Queensway is one of London\'s most vibrant and cosmopolitan high streets, currently mid a £1 billion regeneration anchored by the return of Whiteleys — a luxury mixed-use development with boutique cinema, restaurants and residential units. The area already has an outstanding range of restaurants, cafés and independent shops.' },
    { title: 'Transport links', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=75&auto=format&fit=crop', body: 'Transport connectivity is exceptional. Bayswater and Queensway stations provide Central, Circle and District line access. Paddington — just 10 minutes on foot — offers the Elizabeth line (Crossrail) to Heathrow in 26 minutes and Heathrow Express in 15. Multiple bus routes connect to the West End and wider London.' },
    { title: 'Schools & education', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=75&auto=format&fit=crop', body: 'Families are well served by a range of good and outstanding schools. Southbank International School and the Maria Montessori School are nearby, alongside numerous primary schools rated Good or Outstanding by Ofsted. Westminster Academy and several independent schools are within easy reach.' },
  ]

  return (
    <>
      <PageHero
        eyebrow="Area guide"
        title="Bayswater & W2 — living in West London"
        subtitle="Zone 1, next to Hyde Park, with world-class transport links and a genuinely diverse, cosmopolitan community. This is why people choose W2."
        image="/images/heroes/area-guide.jpg"
        imagePosition="center 50%"
      />

      {/* Stats */}
      <div style={{ borderBottom: '1px solid var(--color-gray-200)', borderTop: '1px solid var(--color-gray-200)', padding: '1.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Avg 1-bed rent', val: '£1,900–2,200 pcm' },
              { label: 'Avg 2-bed rent', val: '£2,400–3,200 pcm' },
              { label: 'Zone', val: 'Zone 1' },
              { label: 'To Heathrow', val: '26 min (Elizabeth line)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-gray-600)', fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: 'var(--color-primary)' }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternating sections */}
      {SECTIONS.map((s, i) => (
        <section key={s.title} className={`section ${i % 2 === 1 ? styles.sectionTint : styles.section}`}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'center' }}>
              {i % 2 === 0 ? (
                <>
                  <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '16/9' }}>
                    <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} width={800} height={450} loading="lazy" />
                  </div>
                  <div><h2 style={{ marginBottom: '1rem' }}>{s.title}</h2><p className={styles.bodyText}>{s.body}</p></div>
                </>
              ) : (
                <>
                  <div><h2 style={{ marginBottom: '1rem' }}>{s.title}</h2><p className={styles.bodyText}>{s.body}</p></div>
                  <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '16/9' }}>
                    <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} width={800} height={450} loading="lazy" />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ))}

      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaBandInner}`}>
          <div>
            <h2>View properties in W2</h2>
            <p className={styles.bodyText} style={{ marginTop: '0.5rem' }}>Browse our current lettings and sales listings across Bayswater and Queensway.</p>
          </div>
          <Link to="/properties" className="btn btn-accent">Search properties</Link>
        </div>
      </section>
    </>
  )
}

/* ============================================================
   AboutPage
   ============================================================ */
export function AboutPage() {
  useEffect(() => {
    document.title = 'About Uniqletts | Independent Estate Agents Bayswater W2'
  }, [])

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Independent, family-run, and genuinely local"
        subtitle="Uniqletts was founded on a simple belief: that buying, selling and renting property should be a personal experience — not a transaction processed by a call centre."
        image="/images/heroes/about.jpg"
        imagePosition="center 30%"
      />

      <section className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.whyGrid}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Our story</p>
              <h2 className={styles.sectionTitle}>15 years in Bayswater</h2>
              <p className={styles.bodyText}>Uniqletts was established over 15 years ago in the heart of Bayswater. From our offices at Redan Place, W2, we've helped hundreds of landlords, tenants, buyers and sellers navigate one of London's most sought-after property markets.</p>
              <p className={styles.bodyText}>Our team is small by design. We believe the best service comes from people who know their clients — not from a revolving door of junior negotiators. Every client has a direct relationship with us, and we take real pride in the long-term connections we build.</p>
              <p className={styles.bodyText}>The W2 area is genuinely our home, and our knowledge of it runs deep — from which buildings have the best natural light, to which streets are being regenerated, to what a realistic rental yield looks like in today's market.</p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=75&auto=format&fit=crop"
                alt="The Uniqletts team at their Bayswater office"
                style={{ width: '100%', borderRadius: 'var(--radius-xl)', aspectRatio: '4/3', objectFit: 'cover' }}
                width={700} height={525} loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.sectionTint}`}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Our values</p>
          <h2 className={styles.sectionTitle}>What we stand for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { title: 'Honesty', body: 'We give you the valuation your property deserves — not the one designed to win your instruction.' },
              { title: 'Responsiveness', body: 'We answer calls, reply to messages and deal with issues promptly. It\'s a basic expectation, and we always meet it.' },
              { title: 'Local knowledge', body: 'Over 15 years in W2 means we know every street, every building type and every nuance of the local market.' },
              { title: 'Long-term relationships', body: 'Many of our clients have been with us for years. That loyalty is something we\'ve earned, and continue to earn.' },
            ].map(v => (
              <div key={v.title} className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-gray-600)', lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ============================================================
   ContactPage
   ============================================================ */
export function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Uniqletts | Estate Agents Bayswater W2'
  }, [])

  const settings = useSiteSettings()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' })

  async function handleContact(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await submitEnquiry({
        type: 'contact',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        subject: form.subject,
        website: form.website,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const addressLines = settings.officeAddress?.split('\n') ?? ['Suite 14, 23 Redan Place, Bayswater, London W2 4SA']
  const hours = settings.openingHours

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="We'd love to hear from you"
        subtitle="Whether you're looking to rent, let, buy or sell — we're here to help. Call us, email, or fill in the form below."
        image="/images/heroes/contact.jpg"
        imagePosition="center 35%"
      />

      <section className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.formGrid}>
            <div>
              {submitted ? (
                <div className={styles.successBox}>
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3>Message sent</h3>
                  <p>We'll get back to you within one working day.</p>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleContact} noValidate>
                  <input type="text" name="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div className={styles.field}>
                    <label htmlFor="c-name" className={styles.label}>Full name</label>
                    <input id="c-name" type="text" required autoComplete="name" className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="c-email" className={styles.label}>Email address</label>
                    <input id="c-email" type="email" required autoComplete="email" className={styles.input} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="c-phone" className={styles.label}>Phone number</label>
                    <input id="c-phone" type="tel" autoComplete="tel" className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="c-subject" className={styles.label}>What can we help with?</label>
                    <select id="c-subject" className={styles.input} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                      <option value="">Select…</option>
                      <option>I want to rent a property</option>
                      <option>I want to let my property</option>
                      <option>I want a free valuation</option>
                      <option>I want to buy a property</option>
                      <option>General enquiry</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="c-message" className={styles.label}>Message</label>
                    <textarea id="c-message" rows={5} required className={`${styles.input} ${styles.textarea}`} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-accent" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send message'}
                  </button>
                  {error && <p style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>{error}</p>}
                </form>
              )}
            </div>

            <div className={styles.infoPanel}>
              <div className={styles.infoPanelCard}>
                <h3 className={styles.infoPanelTitle}>Our office</h3>
                <div className={styles.infoPanelList}>
                  {addressLines.map((line, i) => (
                    <div key={i} className={styles.infoPanelItem}>{line}</div>
                  ))}
                  <div className={styles.infoPanelItem}><a href={`tel:+${settings.phone?.replace(/\s/g, '')}`} style={{ color: 'var(--color-primary)' }}>{settings.phone}</a></div>
                  <div className={styles.infoPanelItem}><a href={`mailto:${settings.email}`} style={{ color: 'var(--color-primary)' }}>{settings.email}</a></div>
                </div>
              </div>
              <div className={styles.infoPanelCard}>
                <h3 className={styles.infoPanelTitle}>Opening hours</h3>
                <div className={styles.infoPanelList}>
                  <div className={styles.infoPanelItem}><strong>Mon–Fri:</strong> {hours?.weekdays ?? '9:00am – 6:00pm'}</div>
                  <div className={styles.infoPanelItem}><strong>Saturday:</strong> {hours?.saturday ?? '10:00am – 4:00pm'}</div>
                  <div className={styles.infoPanelItem}><strong>Sunday:</strong> {hours?.sunday ?? 'Closed'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ============================================================
   NotFoundPage
   ============================================================ */
export function NotFoundPage() {
  useEffect(() => { document.title = 'Page not found | Uniqletts' }, [])
  return (
    <div style={{ padding: 'clamp(4rem, 10vw, 8rem) 0', textAlign: 'center' }}>
      <div className="container">
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>404</p>
        <h1 style={{ marginBottom: '1rem' }}>Page not found</h1>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </div>
  )
}
