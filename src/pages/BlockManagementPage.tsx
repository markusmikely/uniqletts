import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import { ReviewsStrip } from '@/components/sections/HomeSections'
import styles from './InnerPage.module.css'

const SERVICES = [
  {
    title: 'Day-to-day building management',
    body: 'From lifts and lighting to gardens and gyms, we look after every communal element of your block. Maintenance contracts are competitively tendered and actively managed, and onsite staff are appointed, trained and supervised so the building simply runs.',
  },
  {
    title: 'Service charge & budgeting',
    body: 'We set realistic, transparent service charge budgets, collect and account for funds, and plan sensibly for reserves — so leaseholders know exactly where their money goes and major works never arrive as a surprise.',
  },
  {
    title: 'Developer consultancy',
    body: 'We work with developers from the drawing board, advising on the design of communal areas so that everything — from lift specification to landscaping — can be managed practically and cost-effectively once residents move in.',
  },
  {
    title: 'Major works & compliance',
    body: 'Section 20 consultations, long-term agreements, fire and building safety compliance, insurance and pre-completion consultancy for house builders — handled thoroughly, documented properly, and communicated clearly.',
  },
]

const CLIENTS = [
  'Resident management companies (RMCs)',
  'Right-to-manage companies',
  'Freeholders & investor funds',
  'Private landlords with portfolio blocks',
  'Developers & house builders',
]

const INCLUDED = [
  'Tendering & management of maintenance contracts',
  'Appointment & supervision of onsite staff',
  'Service charge budgeting, collection & accounts',
  'Planned & reactive maintenance coordination',
  'Section 20 major works consultations',
  'Buildings insurance arrangement & claims handling',
  'Health & safety and fire risk compliance',
  'Expert witness & mediation services',
]

export default function BlockManagementPage() {
  useEffect(() => {
    document.title = 'Block Management London | Residential Building Management | Uniqletts'
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Block management"
        title="Block management, handled properly"
        subtitle="From day-to-day management to advising developers on the design of communal areas, we take care of everything relating to apartment blocks across central and Greater London — from 500-unit new-builds to converted period blocks on prime estates."
        image="https://images.unsplash.com/photo-1676680071181-0a0b45968d23?w=1800&q=80&auto=format&fit=crop"
        imagePosition="center 45%"
      >
        <Link to="/contact" className="btn btn-accent">Talk to our block team</Link>
        <Link to="/landlords" className="btn btn-primary">Landlord services</Link>
      </PageHero>

      {/* What we do */}
      <section className={`section ${styles.section}`}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>What we do</p>
          <h2 className={styles.sectionTitle}>Practical, cost-effective management</h2>
          <div className={styles.serviceGrid}>
            {SERVICES.map(s => (
              <div key={s.title} className={`card ${styles.serviceCard}`}>
                <h3 className={styles.serviceCardTitle}>{s.title}</h3>
                <p className={styles.bodyText} style={{ marginBottom: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className={`section ${styles.sectionTint}`}>
        <div className="container">
          <div className={styles.whyGrid}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Who we work with</p>
              <h2 className={styles.sectionTitle}>From single blocks<br />to major developments</h2>
              <p className={styles.bodyText}>
                Our clients range from investor funds to private landlords and resident management
                companies, with properties across the spectrum — from 500-unit new-build developments
                to converted blocks on London&rsquo;s prime estates.
              </p>
              <p className={styles.bodyText}>
                The team&rsquo;s depth of experience managing residential assets of every shape and size
                means we are regularly called upon for expert witness and mediation work — and it means
                your building is in hands that have seen it all before.
              </p>
            </div>
            <div className={styles.complianceBox}>
              <h3 className={styles.complianceTitle}>Our clients include</h3>
              <div className={styles.complianceList}>
                {CLIENTS.map(item => (
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

      {/* What's included */}
      <section className={`section ${styles.section}`}>
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>The service</p>
          <h2 className={styles.sectionTitle}>Everything your building needs</h2>
          <div className={styles.serviceGrid}>
            {INCLUDED.map(item => (
              <div key={item} className={styles.complianceItem}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--color-mid)', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsStrip />

      {/* CTA */}
      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaBandInner}`}>
          <div>
            <h2>Looking for a better managing agent?</h2>
            <p className={styles.bodyText} style={{ marginTop: '0.5rem' }}>
              Whether you&rsquo;re a resident management company unhappy with your current agent or a
              developer planning a new scheme, we&rsquo;d love to talk about your building.
            </p>
          </div>
          <Link to="/contact" className="btn btn-accent">Get in touch</Link>
        </div>
      </section>
    </>
  )
}
