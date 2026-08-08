/**
 * Base URL for the serverless API.
 * - Empty (default) → relative calls, i.e. same origin (Vercel).
 * - Set VITE_API_BASE to the Vercel deployment URL (e.g.
 *   https://uniqletts.vercel.app) when the frontend is hosted elsewhere
 *   (e.g. a static build on cPanel) so forms still reach the functions.
 */
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

export async function submitEnquiry(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Submission failed')
  }
  return res.json()
}

export async function submitReview(data: {
  author: string
  rating: number
  text: string
  website?: string
}) {
  const res = await fetch(`${API_BASE}/api/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Submission failed')
  }
  return res.json()
}

export async function trackPropertyView(propertyId: string) {
  try {
    await fetch(`${API_BASE}/api/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
  } catch {
    // Non-critical — fail silently
  }
}
