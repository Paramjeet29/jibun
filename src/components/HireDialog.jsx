import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Button from './ui/Button.jsx'
import { easeOut } from './ui/Reveal.jsx'
import { profile } from '../data.js'
import { LIMITS, TOPICS, fieldError } from '../contactRules.js'

/* ---------- Small line icons (24px grid, current colour) ---------- */
const svg = 'shrink-0 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]'
const Ico = ({ d, className = 'size-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`${svg} ${className}`}>
    {d}
  </svg>
)
const icon = {
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.2v.1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v5M8 8v.01M12 16v-5m0 2a2.5 2.5 0 0 1 5 0v3" />
    </>
  ),
}

const placeholders = {
  'Full-time role': 'The role, the team and what you’re building…',
  'Freelance project': 'What you need, rough timeline and budget…',
  'Just saying hi': 'Say hello…',
}

const empty = { name: '', email: '', message: '', topic: TOPICS[0] }

/** Turns a failed send into words people can act on. */
function describeFailure(kind, retryAfter) {
  if (kind === 'offline')
    return { title: 'You seem to be offline', body: 'Check your connection and try again. Your message is still here.' }
  if (kind === 'rate_limited') {
    const mins = Math.max(1, Math.ceil((retryAfter ?? 600) / 60))
    const wait = mins >= 90 ? `about ${Math.round(mins / 60)} hours` : `about ${mins} minute${mins === 1 ? '' : 's'}`
    return {
      title: 'That’s a few messages in a row',
      body: `To keep spam out, the form takes a short break after several messages. Try again in ${wait}, or email me directly.`,
      noRetry: true,
    }
  }
  return {
    title: 'Your message didn’t go through',
    body: 'Something went wrong on my side, not yours. Try again in a moment, or email me directly. Your message is still here.',
  }
}

/* ---------- One labelled field with its error underneath ---------- */
function Field({ id, label, error, hint, children }) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error || hint ? (
        <div className="flex min-h-5 items-start justify-between gap-3 text-sm">
          {error ? (
            <p id={`${id}-error`} className="flex items-center gap-1.5 text-danger">
              <Ico d={icon.alert} className="size-3.5" />
              {error}
            </p>
          ) : (
            <span />
          )}
          {hint}
        </div>
      ) : null}
    </div>
  )
}

const inputCls = (bad) =>
  `w-full rounded-xl border bg-bg px-3.5 py-2.5 text-md text-ink transition-colors placeholder:text-muted ${
    bad ? 'border-danger' : 'border-rule hover:border-muted focus:border-accent'
  }`

/** Copy-to-clipboard for the email row: the icon becomes a check for a moment. */
function CopyEmail() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 1400)
    return () => clearTimeout(t)
  }, [done])
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(profile.email)
          setDone(true)
        } catch {
          /* clipboard blocked */
        }
      }}
      aria-label={done ? 'Email copied' : 'Copy email address'}
      title="Copy email address"
      className={`grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border transition-colors ${
        done ? 'border-ok text-ok' : 'border-rule text-muted hover:border-accent hover:text-ink'
      }`}
    >
      <Ico d={done ? icon.check : icon.copy} className="size-3.5" />
    </button>
  )
}

/**
 * "Hire me": a modal form that posts to /api/contact (a Vercel function that emails it to you).
 * A native <dialog> with showModal(), so focus stays inside, Esc closes and the page behind is inert.
 * Errors show next to their field when you leave it, clear as soon as they're fixed, and are
 * checked again on send. A failed send keeps what you typed and offers Try again or email.
 */
export default function HireDialog({ open, onClose }) {
  const ref = useRef(null)
  const formRef = useRef(null)
  const id = useId()
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [failure, setFailure] = useState(null)
  const [sentTo, setSentTo] = useState(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  // After a sent message, opening it again starts a fresh form. A draft is kept otherwise.
  useEffect(() => {
    if (open && status === 'sent') {
      setValues(empty)
      setStatus('idle')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => {
    const v = e.target.value
    setValues((s) => ({ ...s, [field]: v }))
    // Fixing a field clears its error straight away (and shows the next problem, if any).
    if (errors[field]) setErrors((s) => ({ ...s, [field]: fieldError(field, v) }))
  }
  const check = (field) => () => {
    // On leaving a field: only complain once something has been typed, never about an untouched field.
    if (values[field].trim() || errors[field]) setErrors((s) => ({ ...s, [field]: fieldError(field, values[field]) }))
  }

  const send = async () => {
    const found = Object.fromEntries(['name', 'email', 'message'].map((f) => [f, fieldError(f, values[f])]))
    setErrors(found)
    const first = ['name', 'email', 'message'].find((f) => found[f])
    if (first) {
      formRef.current?.elements.namedItem(first)?.focus()
      return
    }
    setStatus('sending')
    setFailure(null)
    try {
      const website = formRef.current?.elements.namedItem('website')?.value ?? ''
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website }),
      })
      const json = await r.json().catch(() => ({}))
      if (r.status === 400 && json.field) {
        setErrors((s) => ({ ...s, [json.field]: json.error }))
        setStatus('idle')
        formRef.current?.elements.namedItem(json.field)?.focus()
        return
      }
      if (!r.ok) {
        setFailure(describeFailure(json.error, json.retryAfter))
        setStatus('failed')
        return
      }
      setSentTo({ name: values.name.trim().split(/\s+/)[0], email: values.email.trim(), topic: values.topic })
      setStatus('sent')
    } catch {
      setFailure(describeFailure(navigator.onLine === false ? 'offline' : 'network'))
      setStatus('failed')
    }
  }

  const count = values.message.trim().length
  const busy = status === 'sending'

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      // A click on the dimmed backdrop (the dialog element itself, outside the panel) closes it.
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(560px,calc(100vw-32px))] max-w-none overflow-y-auto rounded-[20px] border border-rule bg-surface p-0 text-ink shadow-[0_30px_80px_-20px_var(--stage-shadow)] backdrop:bg-[rgb(8_11_16/0.55)] backdrop:backdrop-blur-sm"
    >
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
        >
          {/* Who you're writing to */}
          <div className="flex items-center gap-3 border-b border-rule px-6 py-4 sm:px-8">
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-grad font-display text-sm font-extrabold text-accent-ink">
              {profile.firstName[0]}
              {profile.lastName[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="truncate text-sm text-muted">{profile.status}</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-rule text-muted transition-colors hover:border-accent hover:text-ink"
            >
              <Ico d={icon.close} />
            </button>
          </div>

          {status === 'sent' ? (
            /* ---------- Sent ---------- */
            <div className="px-6 py-8 text-center sm:px-8">
              <span aria-hidden="true" className="mx-auto grid size-12 place-items-center rounded-full bg-ok/12 text-ok">
                <Ico d={icon.check} className="size-6" />
              </span>
              <h2 id={`${id}-title`} className="mt-4 font-display text-title-sm leading-[1.1] font-extrabold tracking-[-.03em]">
                Message sent
              </h2>
              <p role="status" className="mx-auto mt-2 max-w-[40ch] text-muted">
                Thanks{sentTo?.name ? `, ${sentTo.name}` : ''}. Your message is in my inbox, and I’ll reply to{' '}
                <span className="font-semibold text-ink">{sentTo?.email}</span>.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button still onClick={onClose}>
                  Done
                </Button>
                <Button
                  still
                  variant="quiet"
                  onClick={() => {
                    setValues(empty)
                    setErrors({})
                    setStatus('idle')
                  }}
                >
                  Send another
                </Button>
              </div>
            </div>
          ) : (
            /* ---------- The form ---------- */
            <form
              ref={formRef}
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (!busy) send()
              }}
              className="grid gap-5 px-6 pt-6 pb-6 sm:px-8"
            >
              <div>
                <h2 id={`${id}-title`} className="font-display text-title-sm leading-[1.1] font-extrabold tracking-[-.03em]">
                  Let’s work together
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  Tell me about the role or the project. It goes straight to my inbox, and I’ll reply by email.
                </p>
              </div>

              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-semibold">What’s this about?</legend>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => {
                    const on = values.topic === t
                    return (
                      <label
                        key={t}
                        className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                          on ? 'border-accent bg-accent/10 text-accent' : 'border-rule text-muted hover:border-muted hover:text-ink'
                        }`}
                      >
                        <input
                          type="radio"
                          name="topic"
                          value={t}
                          checked={on}
                          onChange={() => setValues((s) => ({ ...s, topic: t }))}
                          className="sr-only"
                        />
                        {t}
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <div className="grid items-start gap-5 sm:grid-cols-2 sm:gap-4">
                <Field id={`${id}-name`} label="Name" error={errors.name}>
                  <input
                    id={`${id}-name`}
                    name="name"
                    autoComplete="name"
                    maxLength={LIMITS.name}
                    value={values.name}
                    onChange={set('name')}
                    onBlur={check('name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? `${id}-name-error` : undefined}
                    className={inputCls(errors.name)}
                  />
                </Field>
                <Field id={`${id}-email`} label="Email" error={errors.email}>
                  <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={LIMITS.email}
                    value={values.email}
                    onChange={set('email')}
                    onBlur={check('email')}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? `${id}-email-error` : undefined}
                    className={inputCls(errors.email)}
                  />
                </Field>
              </div>

              <Field
                id={`${id}-message`}
                label="Message"
                error={errors.message}
                hint={
                  <span className={`ml-auto shrink-0 font-mono text-xs tabular-nums ${count > LIMITS.message ? 'text-danger' : 'text-muted'}`}>
                    {count.toLocaleString('en-IN')} / {LIMITS.message.toLocaleString('en-IN')}
                  </span>
                }
              >
                <textarea
                  id={`${id}-message`}
                  name="message"
                  rows={5}
                  value={values.message}
                  onChange={set('message')}
                  onBlur={check('message')}
                  placeholder={placeholders[values.topic]}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? `${id}-message-error` : undefined}
                  className={`${inputCls(errors.message)} min-h-32 resize-y`}
                />
              </Field>

              {/* Honeypot: hidden from people and screen readers, filled in by bots */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {status === 'failed' && failure ? (
                <div role="alert" className="flex gap-3 rounded-xl border border-danger/30 bg-danger-bg p-4">
                  <span className="mt-0.5 text-danger">
                    <Ico d={icon.alert} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-danger">{failure.title}</p>
                    <p className="mt-1 text-sm text-ink/80">{failure.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
                      {!failure.noRetry ? (
                        <button type="submit" className="cursor-pointer text-danger underline underline-offset-4 hover:no-underline">
                          Try again
                        </button>
                      ) : null}
                      <a href={`mailto:${profile.email}`} className="text-ink underline underline-offset-4 hover:no-underline">
                        Email me instead
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}

              <Button
                type="submit"
                still
                arrow={!busy}
                disabled={busy}
                aria-busy={busy}
                className="w-full disabled:opacity-80 sm:w-auto sm:justify-self-start"
              >
                {busy ? (
                  <>
                    <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Sending…
                  </>
                ) : (
                  'Send message'
                )}
              </Button>
            </form>
          )}

          {/* Other ways to reach you */}
          {status !== 'sent' ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-rule bg-bg/60 px-6 py-4 text-sm sm:px-8">
              <span className="text-muted">Prefer email?</span>
              <span className="flex min-w-0 items-center gap-2">
                <Ico d={icon.mail} className="size-4 text-muted" />
                <a href={`mailto:${profile.email}`} className="truncate font-semibold hover:text-accent">
                  {profile.email}
                </a>
                <CopyEmail />
              </span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold hover:text-accent sm:ml-auto"
              >
                <Ico d={icon.linkedin} className="size-4 text-muted" />
                LinkedIn
              </a>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </dialog>
  )
}
