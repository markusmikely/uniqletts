import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sanityWriteClient, corsHeaders, isSpam, validateEmail } from './_server'

interface ReviewPayload {
  author: string
  email?: string
  rating: number
  text: string
  website?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body as ReviewPayload

  if (isSpam(body as unknown as Record<string, unknown>)) {
    return res.status(200).json({ ok: true })
  }

  if (!body.author || !body.text || !body.rating) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (body.rating < 1 || body.rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1–5' })
  }

  if (body.email && !validateEmail(body.email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  try {
    const created = await sanityWriteClient.create({
      _type: 'review',
      source: 'custom',
      author: body.author,
      rating: body.rating,
      text: body.text,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      showOnSite: false,
      isPinned: false,
      sortOrder: 999,
    })

    return res.status(200).json({ ok: true, id: created._id })
  } catch (err) {
    console.error('Review error:', err)
    return res.status(500).json({ error: 'Failed to submit review' })
  }
}
