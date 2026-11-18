import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Button from './ui/Button.jsx'
import { easeOut } from './ui/Reveal.jsx'
import { profile } from '../data.js'

const field =
  'w-full rounded-lg border border-rule bg-bg px-3 py-2.5 text-md text-ink transition-colors placeholder:text-muted hover:border-accent'
const labelCls = 'mb-1.5 block text-sm font-semibold'

/**
 * "Hire me": a modal form that posts to /api/contact (a Vercel function that emails it to you).
 * A native <dialog> with showModal(), so focus stays inside, Esc closes and the page behind is inert.
 */
export default function HireDialog({ open, onClose }) {
  const ref = useRef(null)
  const id = useId()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  // A fresh form each time it opens, unless a send is still in flight.
  useEffect(() => {
    if (open && status !== 'sending') {
      setStatus('idle')
      setError('')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setStatus('sending')
    setError('')
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(json.error || 'Your message couldn’t be sent')
      setSentTo({ name: String(data.name).trim().split(' ')[0], email: String(data.email).trim() })
      setStatus('sent')
      form.reset()
    } catch (err) {
      setError(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Your message couldn’t be sent')
      setStatus('error')
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      // A click on the dimmed backdrop (the dialog element itself, outside the panel) closes it.
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(520px,calc(100vw-32px))] max-w-none rounded-[20px] border border-rule bg-surface p-0 text-ink shadow-[0_30px_80px_-20px_var(--stage-shadow)] backdrop:bg-[rgb(8_11_16/0.55)] backdrop:backdrop-blur-sm"
    >
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="p-6 sm:p-8"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={`${id}-title`} className="font-display text-title-sm leading-[1.1] font-extrabold tracking-[-.03em]">
                {status === 'sent' ? 'Message sent' : 'Let’s work together'}
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                {status === 'sent'
                  ? `Thanks${sentTo?.name ? `, ${sentTo.name}` : ''}. I’ll reply to ${sentTo?.email ?? 'you'} soon.`
                  : 'Tell me about the role or the project. It lands straight in my inbox.'}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-rule text-muted transition-colors hover:border-accent hover:text-ink"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {status === 'sent' ? (
            <Button onClick={onClose}>Done</Button>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4">
              <div>
                <label htmlFor={`${id}-name`} className={labelCls}>
                  Name
                </label>
                <input id={`${id}-name`} name="name" required maxLength={100} autoComplete="name" className={field} />
              </div>
              <div>
                <label htmlFor={`${id}-email`} className={labelCls}>
                  Email
                </label>
                <input id={`${id}-email`} name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
              </div>
              <div>
                <label htmlFor={`${id}-message`} className={labelCls}>
                  Message
                </label>
                <textarea
                  id={`${id}-message`}
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  className={`${field} resize-y`}
                  placeholder="Role, team, timeline…"
                />
              </div>

              {/* Honeypot: hidden from people and screen readers, filled in by bots */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {status === 'error' ? (
                <p role="alert" className="rounded-lg border border-rule bg-bg px-3 py-2.5 text-sm">
                  {error.replace(/[.\s]+$/, '')}. You can also email{' '}
                  <a href={`mailto:${profile.email}`} className="font-semibold text-accent underline underline-offset-2">
                    {profile.email}
                  </a>
                  .
                </p>
              ) : null}

              <div className="pt-1">
                <Button type="submit" arrow disabled={status === 'sending'} className="disabled:cursor-wait disabled:opacity-70">
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      ) : null}
    </dialog>
  )
}
