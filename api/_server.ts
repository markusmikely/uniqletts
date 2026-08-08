import { createClient, type SanityClient } from '@sanity/client'

/**
 * IMPORTANT: nothing in this module runs at import time. The Sanity client
 * is created lazily and Resend is imported dynamically — so a missing env
 * var or a dependency load issue can never crash the whole serverless
 * function on startup (which returns an opaque 500 with no CORS header).
 * Instead, failures happen inside each handler's try/catch and come back as
 * a normal JSON error *with* CORS headers already set.
 */

let _client: SanityClient | undefined

export function getWriteClient(): SanityClient {
  if (!_client) {
    const projectId = process.env.VITE_SANITY_PROJECT_ID
    if (!projectId) {
      throw new Error('Server misconfigured: VITE_SANITY_PROJECT_ID is not set')
    }
    _client = createClient({
      projectId,
      dataset: process.env.VITE_SANITY_DATASET ?? 'production',
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    })
  }
  return _client
}

export const NOTIFY_EMAIL = process.env.ENQUIRY_NOTIFY_EMAIL ?? 'hello@uniqletts.com'

/**
 * Send an email via Resend when configured. Returns true if sent.
 * Resend is imported dynamically so its module load can never take the
 * whole function down at startup.
 */
export async function sendEmail(opts: { subject: string; html: string; to?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const { Resend } = await import('resend')
  const resend = new Resend(key)
  await resend.emails.send({
    from: 'Uniqletts <onboarding@resend.dev>',
    to: opts.to ?? NOTIFY_EMAIL,
    subject: opts.subject,
    html: opts.html,
  })
  return true
}

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export function isSpam(body: Record<string, unknown>): boolean {
  // Honeypot field — bots fill this, humans don't see it
  if (body.website && String(body.website).length > 0) return true
  return false
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
