// Vercel serverless function: POST /api/contact
// Receives the "Hire me" form and emails it to you through Resend (https://resend.com).
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  your Resend API key (secret; never ships to the browser)
//   CONTACT_TO      the inbox that receives the messages
//   CONTACT_FROM    optional sender, e.g. "Portfolio <hello@your-domain.dev>" once you verify a
//                   domain in Resend. Until then the default onboarding@resend.dev sender works, but
//                   only for sending to the address you signed up to Resend with.
//
// Abuse protection: a honeypot field, length and format checks, and rate limits (3 per visitor per
// 10 minutes, 10 per visitor per day, 50 for the whole site per day) in api/_ratelimit.js. Add
// Upstash Redis env vars to make the limits hold across every instance of this function.

import { clientIp, rateLimit } from './_ratelimit.js'

const LIMITS = { name: 100, email: 200, message: 5000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Checks the form fields. Returns an error message, or null when they are fine. */
export function validate({ name, email, message }) {
  if (!name || !email || !message) return 'Please fill in your name, email and message'
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) return 'That is a bit too long'
  if (!EMAIL_RE.test(email)) return 'That email address doesn’t look right'
  if (message.length < 10) return 'Please write a little more'
  return null
}

const clean = (v) => (typeof v === 'string' ? v.trim() : '')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body ?? {})
  // Honeypot: a hidden field people never see. Bots fill it; pretend it worked and send nothing.
  if (clean(body.website)) return res.status(200).json({ ok: true })

  // One line for the name, so it can't add lines to the email subject.
  const fields = { name: clean(body.name).replace(/[\r\n]+/g, ' '), email: clean(body.email), message: clean(body.message) }
  const problem = validate(fields)
  if (problem) return res.status(400).json({ error: problem })

  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO
  if (!key || !to) return res.status(500).json({ error: 'The contact form isn’t set up yet' })

  // Counted only for valid messages that would really be sent (see api/_ratelimit.js).
  const limited = await rateLimit(clientIp(req))
  if (!limited.ok) {
    res.setHeader('Retry-After', String(limited.retryAfter))
    return res.status(429).json({ error: 'You’ve sent a few messages already. Please try again later' })
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
      to: [to],
      reply_to: fields.email, // hitting Reply answers the person who wrote
      subject: `Hire me: message from ${fields.name}`,
      text: `${fields.message}\n\n— ${fields.name} <${fields.email}>\nSent from the Hire me form on your portfolio`,
    }),
  }).catch(() => null)

  if (!r || !r.ok) return res.status(502).json({ error: 'Your message couldn’t be sent' })
  return res.status(200).json({ ok: true })
}

function safeJson(s) {
  try {
    return JSON.parse(s)
  } catch {
    return {}
  }
}
