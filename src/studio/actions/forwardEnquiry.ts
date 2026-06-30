import { useState, useCallback } from 'react'
import type { DocumentActionComponent } from 'sanity'

export const ForwardEnquiryAction: DocumentActionComponent = props => {
  const { id, type, draft, published, onComplete } = props
  const doc = draft || published
  const [isForwarding, setIsForwarding] = useState(false)

  const forward = useCallback(async () => {
    if (!doc) return
    setIsForwarding(true)
    try {
      const res = await fetch('/api/forward-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: id.replace('drafts.', '') }),
      })
      if (!res.ok) throw new Error('Forward failed')
      alert('Enquiry forwarded by email.')
      onComplete()
    } catch (err) {
      console.error(err)
      alert('Failed to forward enquiry. Check server configuration.')
    } finally {
      setIsForwarding(false)
    }
  }, [doc, id, onComplete])

  if (type !== 'enquiry') return null

  return {
    label: isForwarding ? 'Forwarding…' : 'Forward to email',
    onHandle: forward,
    disabled: isForwarding,
  }
}
