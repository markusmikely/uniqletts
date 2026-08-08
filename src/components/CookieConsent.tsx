import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, setConsent } from '@/lib/consent'
import styles from './CookieConsent.module.css'

/**
 * Cookie-consent banner. Shows until the visitor accepts or declines.
 * Analytics (GA/Clarity) only load after "Accept" — see Analytics.tsx.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only prompt if no decision has been stored yet.
    setVisible(getConsent() === null)
  }, [])

  if (!visible) return null

  function choose(value: 'accepted' | 'declined') {
    setConsent(value)
    setVisible(false)
  }

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className={styles.inner}>
        <p className={styles.text}>
          We use cookies to analyse traffic and improve your experience. You can accept or
          decline analytics cookies. See our{' '}
          <Link to="/cookies" className={styles.link}>Cookie Policy</Link>.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.decline} onClick={() => choose('declined')}>
            Decline
          </button>
          <button type="button" className={styles.accept} onClick={() => choose('accepted')}>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
