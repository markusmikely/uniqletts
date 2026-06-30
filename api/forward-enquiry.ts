import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sanityWriteClient, resend, NOTIFY_EMAIL, corsHeaders } from './_server'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { enquiryId } = req.body as { enquiryId?: string }
  if (!enquiryId) return res.status(400).json({ error: 'Missing enquiryId' })

  try {
    const enquiry = await sanityWriteClient.getDocument(enquiryId)
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' })

    if (resend) {
      const rows = Object.entries(enquiry)
        .filter(([k, v]) => v && !k.startsWith('_'))
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${k}</td><td>${v}</td></tr>`)
        .join('')

      await resend.emails.send({
        from: 'Uniqletts <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        subject: `Forwarded: ${enquiry.type} enquiry from ${enquiry.name}`,
        html: `<h2>Enquiry forwarded from admin</h2><table>${rows}</table>`,
      })
    }

    const now = new Date().toISOString()
    await sanityWriteClient.patch(enquiryId).set({ forwardedAt: now }).commit()

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Forward error:', err)
    return res.status(500).json({ error: 'Failed to forward enquiry' })
  }
}
