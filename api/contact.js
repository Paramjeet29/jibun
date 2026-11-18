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
import { TOPICS, validate } from '../src/contactRules.js'

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
  const topic = TOPICS.includes(body.topic) ? body.topic : null
  const problem = validate(fields)
  if (problem) return res.status(400).json(problem)

  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO
  // Error codes (not sentences): the dialog turns each one into a message with a way forward.
  if (!key || !to) return res.status(500).json({ error: 'not_configured' })

  // Counted only for valid messages that would really be sent (see api/_ratelimit.js).
  const limited = await rateLimit(clientIp(req))
  if (!limited.ok) {
    res.setHeader('Retry-After', String(limited.retryAfter))
    return res.status(429).json({ error: 'rate_limited', retryAfter: limited.retryAfter })
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
      to: [to],
      reply_to: fields.email, // hitting Reply answers the person who wrote
      subject: `Hire me${topic ? ` · ${topic}` : ''}: message from ${fields.name}`,
      text: `${topic ? `Topic: ${topic}\n\n` : ''}${fields.message}\n\n— ${fields.name} <${fields.email}>\nSent from the Hire me form on your portfolio`,
    }),
  }).catch(() => null)

  if (!r || !r.ok) return res.status(502).json({ error: 'send_failed' })
  return res.status(200).json({ ok: true })
}

function safeJson(s) {
  try {
    return JSON.parse(s)
  } catch {
    return {}
  }
}
