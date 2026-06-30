import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sanityWriteClient, corsHeaders } from './_server'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { propertyId } = req.body as { propertyId?: string }
  if (!propertyId) return res.status(400).json({ error: 'Missing propertyId' })

  try {
    await sanityWriteClient
      .patch(propertyId)
      .setIfMissing({ viewCount: 0 })
      .inc({ viewCount: 1 })
      .commit()

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Track view error:', err)
    return res.status(500).json({ error: 'Failed to track view' })
  }
}
