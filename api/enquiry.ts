import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  getWriteClient,
  sendEmail,
  corsHeaders,
  isSpam,
  validateEmail,
} from './_server.js'

interface EnquiryPayload {
  type: 'valuation' | 'viewing' | 'contact' | 'maintenance' | 'general'
  name: string
  email: string
  phone?: string
  message?: string
  propertySlug?: string
  propertyId?: string
  subject?: string
  // Valuation
  valuationAddress?: string
  valuationPropertyType?: string
  valuationBedrooms?: string
  preferredCallTime?: string
  // Viewing
  preferredDate?: string
  // Maintenance
  maintenanceAddress?: string
  maintenanceIssue?: string
  // Honeypot
  website?: string
}

/** Escape user-supplied values so enquiry content can't inject HTML into the notification email. */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildEmailHtml(payload: EnquiryPayload): string {
  const rows = Object.entries(payload)
    .filter(([k, v]) => v && k !== 'website')
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
    .join('')
  return `<h2>New ${escapeHtml(payload.type)} enquiry</h2><table>${rows}</table>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body as EnquiryPayload

  if (isSpam(body as unknown as Record<string, unknown>)) {
    // Silently accept to not tip off bots
    return res.status(200).json({ ok: true })
  }

  if (!body.type || !body.name || !body.email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!validateEmail(body.email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const now = new Date().toISOString()

  const doc = {
    _type: 'enquiry' as const,
    type: body.type,
    name: body.name,
    email: body.email,
    phone: body.phone ?? '',
    message: body.message ?? body.maintenanceIssue ?? '',
    propertySlug: body.propertySlug,
    ...(body.propertyId ? { property: { _type: 'reference', _ref: body.propertyId } } : {}),
    subject: body.subject,
    valuationAddress: body.valuationAddress,
    valuationPropertyType: body.valuationPropertyType,
    valuationBedrooms: body.valuationBedrooms,
    preferredCallTime: body.preferredCallTime,
    preferredDate: body.preferredDate,
    maintenanceAddress: body.maintenanceAddress,
    maintenanceIssue: body.maintenanceIssue,
    status: 'new',
    createdAt: now,
  }

  try {
    const client = getWriteClient()
    const created = await client.create(doc)

    // Email is best-effort — a delivery failure must not fail the enquiry,
    // which is already safely stored in Sanity.
    try {
      const sent = await sendEmail({
        subject: `New ${body.type} enquiry from ${body.name}`,
        html: buildEmailHtml(body),
      })
      if (sent) await client.patch(created._id).set({ forwardedAt: now }).commit()
    } catch (mailErr) {
      console.error('Enquiry email failed (enquiry still saved):', mailErr)
    }

    return res.status(200).json({ ok: true, id: created._id })
  } catch (err) {
    console.error('Enquiry error:', err)
    return res.status(500).json({ error: 'Failed to submit enquiry' })
  }
}
