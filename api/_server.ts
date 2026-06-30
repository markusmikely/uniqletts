import { createClient } from '@sanity/client'
import { Resend } from 'resend'

export const sanityWriteClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: process.env.VITE_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const NOTIFY_EMAIL = process.env.ENQUIRY_NOTIFY_EMAIL ?? 'hello@uniqletts.com'

export function corsHeaders() {
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
