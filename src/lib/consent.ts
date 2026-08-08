/** Cookie/analytics consent — stored in localStorage, GDPR/PECR friendly.
    Analytics scripts only load once the user has explicitly accepted. */

export type Consent = 'accepted' | 'declined' | null

const KEY = 'uniqletts_cookie_consent'
export const CONSENT_EVENT = 'uniqletts:consent-changed'
export const OPEN_CONSENT_EVENT = 'uniqletts:open-consent'

/** Re-open the consent banner so a visitor can change their choice. */
export function openConsent(): void {
  window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT))
}

export function getConsent(): Consent {
  if (typeof localStorage === 'undefined') return null
  const v = localStorage.getItem(KEY)
  return v === 'accepted' || v === 'declined' ? v : null
}

export function setConsent(value: Exclude<Consent, null>): void {
  localStorage.setItem(KEY, value)
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}
