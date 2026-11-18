// The Hire me form's rules, shared by the dialog (src/components/HireDialog.jsx) and the server
// (api/contact.js), so a message is checked the same way in the browser and before it is sent.

export const LIMITS = { name: 100, email: 200, message: 2000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** What the message is about: the form's chips. The server ignores anything else. */
export const TOPICS = ['Full-time role', 'Freelance project', 'Just saying hi']

/** Checks one field. Returns a sentence saying what to fix, or null when it is fine. */
export function fieldError(field, raw) {
  const v = (raw ?? '').trim()
  if (field === 'name') {
    if (!v) return 'Please tell me your name'
    if (v.length > LIMITS.name) return 'Please keep your name under 100 characters'
  }
  if (field === 'email') {
    if (!v) return 'Please add your email so I can reply'
    if (v.length > LIMITS.email || !EMAIL_RE.test(v)) return 'That email doesn’t look right. Check for a typo'
  }
  if (field === 'message') {
    if (!v) return 'Please write a short message'
    if (v.length < 10) return 'A little more detail, please (10 characters or more)'
    if (v.length > LIMITS.message) return 'Please keep it under 2,000 characters'
  }
  return null
}

/** Checks all fields. Returns { field, error } for the first problem, or null when all are fine. */
export function validate(fields) {
  for (const field of ['name', 'email', 'message']) {
    const error = fieldError(field, fields[field])
    if (error) return { field, error }
  }
  return null
}
