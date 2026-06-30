import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import { ReviewsStrip } from '@/components/sections/HomeSections'
import styles from './InnerPage.module.css'

const SERVICES = [
  {
    title: 'Let only',
    fee: 'From 8% of monthly rent',
    items: ['Professional photography & listing', 'Rightmove & Zoopla marketing', 'Tenant find & referencing', 'Tenancy agreement preparation', 'Deposit registration (TDS)'],
  },
  {
    title: 'Rent collection',
    fee: 'From 10% of monthly rent',
    items: ['Everything in Let Only', 'Monthly rent collection', 'Arrears management', 'Rent statements', 'Annual rent reviews'],
  },
  {
    title: 'Full management',
    fee: 'From 12% of monthly rent',
    items: ['Everything in Rent Collection', 'Maintenance coordination', '24/7 emergency response', 'Property inspections', 'Compliance management', 'End of tenancy & deposit return'],
  },
]

const STEPS = [
  { num: '01', title: 'Free valuation', body: 'We visit your property and provide an honest market appraisal — no obligation, no pressure.' },
  { num: '02', title: 'Preparation advice', body: 'We advise on presentation, any works needed, and EPC or safety certificate requirements.' },
  { num: '03', title: 'Marketing launch', body: 'Professional photography, Rightmove listing, and our active tenant database all activated.' },
  { num: '04', title: 'Tenant referencing', body: 'Full credit, employment and previous landlord checks on every applicant before you approve.' },
  { num: '05', title: 'Move in', body: 'Tenancy agreement signed, deposit protected, inventory completed. Your income starts immediately.' },
]

export default function LandlordsPage() {
  useEffect(() => {
    document.title = 'Landlord Services Bayswater W2 | Lettings & Management | Uniqletts'
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Landlord services"
        title="Let your property with confidence"
        subtitle="Straightforward fees, expert local knowledge, and a genuinely personal service — from the first valuation to the day your tenants move out."
        image="/images/heroes/landlords.jpg"
        imagePosition="center 40%"
      >
        <Link to="/valuations" className="btn btn-accent">Get a free valuation</Link>
        <Link to="/contact" className="btn btn-primary">Talk to us</Link>
      </PageHero>

      {/* Services */}
      <section className={`section ${styles.section}`}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Our packages</p>
          <h2 className={styles.sectionTitle}>Choose the right level of support</h2>
          <div className={styles.serviceGrid}>
            {SERVICES.map((s, i) => (
              <div key={s.title} className={`card ${styles.serviceCard} ${i === 2 ? styles.serviceCardFeatured : ''}`}>
                {i === 2 && <span className="badge badge-accent" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>Most popular</span>}
                <h3 className={styles.serviceCardTitle}>{s.title}</h3>
                <p className={styles.serviceCardFee}>{s.fee}</p>
                <ul className={styles.serviceList}>
                  {s.items.map(item => (
                    <li key={item} className={styles.serviceListItem}>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--color-mid)', flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/valuations" className={`btn ${i === 2 ? 'btn-accent' : 'btn-primary'}`} style={{ marginTop: 'auto' }}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className={`section ${styles.sectionTint}`} id="process">
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>How it works</p>
          <h2 className={styles.sectionTitle}>From valuation to tenants in</h2>
          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={step.num} className={styles.step}>
                <div className={styles.stepNum}>{step.num}</div>
                {i < STEPS.length - 1 && <div className={styles.stepLine} aria-hidden="true" />}
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.whyGrid}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Why Uniqletts</p>
              <h2 className={styles.sectionTitle}>Local expertise,<br />personal service</h2>
              <p className={styles.bodyText}>
                We're not a corporate franchise. We're an independent, family-run agency that has been managing properties in Bayswater and W2 for over 15 years. Our landlords come back to us again and again because we treat their properties as if they were our own.
              </p>
              <p className={styles.bodyText}>
                Every landlord has a named contact. Every maintenance issue is handled promptly. Every tenancy is managed with care. No call centres, no junior staff handing you off — just direct, expert service from people who know W2 inside out.
              </p>
            </div>
            <div className={styles.complianceBox}>
              <h3 className={styles.complianceTitle}>Compliance & accreditations</h3>
              <div className={styles.complianceList}>
                {['Property Ombudsman member', 'Client Money Protection', 'Right to Rent checks', 'Gas Safety Certificate coordination', 'EPC compliance', 'Deposit Protection (TDS)', 'ARLA Propertymark'].map(item => (
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
        </div>
      </section>

      <ReviewsStrip />

      {/* CTA */}
      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaBandInner}`}>
          <div>
            <h2>Ready to let your property?</h2>
            <p className={styles.bodyText} style={{ marginTop: '0.5rem' }}>Get a free, no-obligation valuation and find out exactly what your property is worth in today's W2 market.</p>
          </div>
          <Link to="/valuations" className="btn btn-accent">Book a free valuation</Link>
        </div>
      </section>
    </>
  )
}
