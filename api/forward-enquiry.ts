import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getWriteClient, sendEmail, corsHeaders } from './_server'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { enquiryId } = req.body as { enquiryId?: string }
  if (!enquiryId) return res.status(400).json({ error: 'Missing enquiryId' })

  try {
    const client = getWriteClient()
    const enquiry = await client.getDocument(enquiryId)
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' })

    const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const rows = Object.entries(enquiry)
      .filter(([k, v]) => v && !k.startsWith('_'))
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${esc(k)}</td><td>${esc(v)}</td></tr>`)
      .join('')

    await sendEmail({
      subject: `Forwarded: ${enquiry.type} enquiry from ${enquiry.name}`,
      html: `<h2>Enquiry forwarded from admin</h2><table>${rows}</table>`,
    })

    const now = new Date().toISOString()
    await client.patch(enquiryId).set({ forwardedAt: now }).commit()

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Forward error:', err)
    return res.status(500).json({ error: 'Failed to forward enquiry' })
  }
}
