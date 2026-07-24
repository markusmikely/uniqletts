import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import { getLegalPage, sanityReady } from '@/lib/sanity'
import PortableText from '@/components/ui/PortableText'
import type { PortableTextBlock } from '@portabletext/types'
import styles from './InnerPage.module.css'

interface LegalPageProps {
  slug: 'privacy' | 'terms' | 'cookies'
  fallbackTitle: string
}

const FALLBACK: Record<string, { title: string; body: string }> = {
  privacy: {
    title: 'Privacy Policy',
    body: 'This privacy notice explains how Uniqletts Limited collects, uses, shares and protects your personal data when you use our website or services, and sets out your rights under the UK GDPR and Data Protection Act 2018. For the full policy or any data request, please contact us at info@uniqletts.com.',
  },
  terms: {
    title: 'Terms of Use',
    body: 'By using the Uniqletts website you agree to these terms of use. Content on this site is provided for general information only and does not constitute professional advice.',
  },
  cookies: {
    title: 'Cookie Policy',
    body: 'We use cookies to improve your experience on our website, including analytics cookies via Google Analytics. You can manage cookie preferences through your browser settings.',
  },
}

export default function LegalPage({ slug, fallbackTitle }: LegalPageProps) {
  const [page, setPage] = useState<{ title: string; body?: PortableTextBlock[] } | null>(null)

  useEffect(() => {
    document.title = `${fallbackTitle} | Uniqletts`
    if (!sanityReady) {
      setPage({ title: FALLBACK[slug].title, body: undefined })
      return
    }
    getLegalPage(slug).then(data => {
      if (data) setPage({ title: data.title, body: data.body })
      else setPage({ title: FALLBACK[slug].title })
    })
  }, [slug, fallbackTitle])

  const title = page?.title ?? fallbackTitle
  const fallback = FALLBACK[slug]

  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle="" image="https://images.unsplash.com/photo-1681407979872-0a4cbde28391?w=2400&q=85&auto=format&fit=crop" imagePosition="center 62%" />
      <section className={`section ${styles.sectionTint}`}>
        <div className="container">
          <div className={styles.prose}>
            <div className={styles.proseCard}>
              <span className={styles.proseMeta}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                Last updated July 2026
              </span>
              {page?.body ? (
                <PortableText value={page.body} className={styles.bodyText} />
              ) : (
                <p className={styles.bodyText}>{fallback.body}</p>
              )}
              <div className={styles.proseFooter}>
                <span className={styles.bodyText} style={{ marginBottom: 0 }}>Questions about this policy?</span>
                <Link to="/contact" className="btn btn-primary">Contact us →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
