// Rate limiting for the contact form (files starting with "_" in /api are not routes on Vercel).
//
// Fixed windows counted in Upstash Redis when it is configured, which is shared by every instance
// of the function, so the limits hold for real. Without Upstash it falls back to counting in this
// instance's memory: zero setup and still stops a single script hammering one warm instance, but
// Vercel can run several instances and restarts them, so treat that mode as best-effort.
//
// Upstash env vars (either naming works; the Vercel Marketplace integration sets the KV_ ones):
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   or   KV_REST_API_URL + KV_REST_API_TOKEN

/** Upstash settings, read on each call (so a redeploy or a test can change them). */
const upstash = () => ({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
})

/** In-memory fallback: key -> { count, resetAt }. */
const memory = new Map()

function memoryHit(key, windowSec, now) {
  const e = memory.get(key)
  if (!e || e.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    if (memory.size > 5000) for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
    return 1
  }
  e.count += 1
  return e.count
}

async function redisHit({ url, token }, key, windowSec) {
  // INCR, then set the expiry only when the key is new, in one round trip.
  const r = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(windowSec), 'NX'],
    ]),
  })
  if (!r.ok) throw new Error(`upstash ${r.status}`)
  const [incr] = await r.json()
  return Number(incr.result)
}

/** Counts one hit on `key` in a window of `windowSec` seconds; returns the count so far. */
async function hit(key, windowSec, now) {
  const bucket = Math.floor(now / (windowSec * 1000))
  const k = `rl:${key}:${bucket}`
  const cfg = upstash()
  if (cfg.url && cfg.token) {
    try {
      return await redisHit(cfg, k, windowSec)
    } catch {
      // Upstash unreachable: keep limiting in memory rather than not at all.
    }
  }
  return memoryHit(k, windowSec, now)
}

/** Seconds until the window containing `now` ends. */
const secondsLeft = (windowSec, now) => Math.ceil(windowSec - (now / 1000) % windowSec)

export const RULES = [
  { name: 'ip-10m', scope: 'ip', limit: 3, windowSec: 10 * 60 },
  { name: 'ip-day', scope: 'ip', limit: 10, windowSec: 24 * 60 * 60 },
  // A cap for the whole site, kept under Resend's free 100 emails a day, so a flood from many
  // addresses can't use up the quota and silence real messages for the rest of the day.
  { name: 'all-day', scope: 'all', limit: 50, windowSec: 24 * 60 * 60 },
]

/**
 * Records one message from `ip`. Returns `{ ok: true }`, or `{ ok: false, retryAfter }` (seconds)
 * when a limit is reached. Per-visitor limits are checked first, so a visitor who is already
 * blocked doesn't use up the site-wide allowance.
 */
export async function rateLimit(ip, now = Date.now()) {
  for (const rule of RULES) {
    const id = rule.scope === 'ip' ? `${rule.name}:${ip}` : rule.name
    const count = await hit(id, rule.windowSec, now)
    if (count > rule.limit) return { ok: false, retryAfter: secondsLeft(rule.windowSec, now), rule: rule.name }
  }
  return { ok: true }
}

/** The visitor's IP. Vercel sets these headers itself, so the client can't spoof them. */
export function clientIp(req) {
  const h = req.headers ?? {}
  const real = h['x-real-ip']
  const fwd = h['x-forwarded-for']
  return (typeof real === 'string' && real) || (typeof fwd === 'string' && fwd.split(',')[0].trim()) || 'unknown'
}

/** Test helper: forget in-memory counts. */
export const _resetMemory = () => memory.clear()
