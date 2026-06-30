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
    body: 'This privacy policy explains how Uniqletts Ltd collects, uses, and protects your personal information when you use our website or services. For the full policy, please contact us at hello@uniqletts.com.',
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
      <PageHero eyebrow="Legal" title={title} subtitle="" image="/images/heroes/about.jpg" imagePosition="center 30%" />
      <section className={`section ${styles.section}`}>
        <div className="container" style={{ maxWidth: 720 }}>
          {page?.body ? (
            <PortableText value={page.body} className={styles.bodyText} />
          ) : (
            <p className={styles.bodyText}>{fallback.body}</p>
          )}
          <p style={{ marginTop: '2rem' }}>
            <Link to="/contact" className="btn btn-ghost">Contact us →</Link>
          </p>
        </div>
      </section>
    </>
  )
}
