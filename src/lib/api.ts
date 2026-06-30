export async function submitEnquiry(data: Record<string, unknown>) {
  const res = await fetch('/api/enquiry', {
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
  const res = await fetch('/api/review', {
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
    await fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })
  } catch {
    // Non-critical — fail silently
  }
}
