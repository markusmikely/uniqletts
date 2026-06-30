import type { ReactNode } from 'react'
import styles from './PageHero.module.css'

interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
  /**
   * Optional background image URL.
   * When provided the hero switches to a dark-overlay image layout —
   * eyebrow, title, subtitle and actions all render in white.
   * When omitted the default clean white layout is used.
   *
   * Swap in your chosen image per page:
   *   <PageHero image="/images/heroes/landlords.jpg" ... />
   *
   * Recommended spec: 1800px wide, landscape, well-lit, face-safe
   * in the upper-left third (content sits left-aligned over the image).
   */
  image?: string
  /** Alt text for the background image (default: empty — decorative) */
  imageAlt?: string
  /**
   * Controls how dark the overlay sits over the image.
   * 0 = no overlay, 1 = fully opaque. Default: 0.52
   * Increase if your image is bright and text contrast drops.
   */
  overlayOpacity?: number
  /**
   * CSS object-position value for the background image.
   * Default: 'center 30%' — keeps faces/subjects in frame on mobile.
   */
  imagePosition?: string
}

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  image,
  imageAlt = '',
  overlayOpacity = 0.52,
  imagePosition = 'center 30%',
}: PageHeroProps) {
  const hasImage = Boolean(image)

  return (
    <section className={`${styles.hero} ${hasImage ? styles.heroImage : ''}`}>

      {/* Background image — only rendered when prop is provided */}
      {hasImage && (
        <>
          <img
            src={'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2400&q=85&auto=format&fit=crop&crop=center'}//image}
            alt={imageAlt}
            className={styles.bgImage}
            style={{ objectPosition: imagePosition }}
            width={1800}
            height={600}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          {/* Dark overlay for text legibility */}
          <div
            className={styles.overlay}
            style={{ opacity: overlayOpacity }}
            aria-hidden="true"
          />
        </>
      )}

      <div className={`container ${styles.inner}`}>
        {eyebrow && (
          <p className={`${styles.eyebrow} ${hasImage ? styles.eyebrowLight : 'eyebrow'}`}>
            {eyebrow}
          </p>
        )}
        <h1 className={`${styles.title} ${hasImage ? styles.titleLight : ''}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`${styles.subtitle} ${hasImage ? styles.subtitleLight : ''}`}>
            {subtitle}
          </p>
        )}
        {children && (
          <div className={styles.actions}>{children}</div>
        )}
      </div>

    </section>
  )
}
