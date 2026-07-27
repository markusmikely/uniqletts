import { useState } from 'react'
import styles from './CardGallery.module.css'

export interface CardImage {
  url: string
  alt?: string
}

interface CardGalleryProps {
  images: CardImage[]
  /** Fallback alt when an image has none. */
  altBase: string
  /** Rendered width hint for the <img> (height derives from CSS aspect-ratio). */
  width?: number
  height?: number
  /** Overlays rendered on top of the image (tags, status badges). */
  children?: React.ReactNode
}

/**
 * Image carousel for property cards. Prev/next arrows cycle through all
 * photos in place so users can preview the whole set without opening the
 * listing. Lives inside a <Link>, so the controls stop click/navigation.
 */
export default function CardGallery({ images, altBase, width = 600, height = 400, children }: CardGalleryProps) {
  const [index, setIndex] = useState(0)
  const count = images.length
  const safeIndex = Math.min(index, Math.max(count - 1, 0))
  const current = images[safeIndex]

  function go(delta: number, e: React.MouseEvent) {
    // The gallery sits inside a <Link> — don't navigate or select.
    e.preventDefault()
    e.stopPropagation()
    setIndex(prev => (prev + delta + count) % count)
  }

  function jump(to: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIndex(to)
  }

  return (
    <div className={styles.wrap}>
      {current?.url && (
        <img
          src={current.url}
          alt={current.alt || altBase}
          className={styles.image}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
        />
      )}

      {children}

      {count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            aria-label="Previous photo"
            onClick={e => go(-1, e)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            aria-label="Next photo"
            onClick={e => go(1, e)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className={styles.counter}>{safeIndex + 1}/{count}</div>

          <div className={styles.dots} role="tablist" aria-label="Choose photo">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === safeIndex ? styles.dotActive : ''}`}
                aria-label={`Photo ${i + 1}`}
                aria-selected={i === safeIndex}
                onClick={e => jump(i, e)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
