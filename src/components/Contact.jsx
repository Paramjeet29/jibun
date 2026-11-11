import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal from './ui/Reveal.jsx'
import { profile } from '../data.js'

const svgClass = 'fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]'

const icons = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v5M8 8v.01M12 16v-5m0 2a2.5 2.5 0 0 1 5 0v3" />
    </>
  ),
  github: (
    <path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.3 1.3a11.5 11.5 0 0 0-6 0C6.7 3.2 5.7 3.5 5.7 3.5a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.3 9.9c0 4.6 2.8 5.7 5.5 6A3 3 0 0 0 9 18.2V21" />
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </>
  ),
  check: <path d="m5 12 5 5 9-10" />,
}

function CopyButton({ value, label }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 1400)
    return () => clearTimeout(t)
  }, [done])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
    } catch {
      /* clipboard blocked: do nothing */
    }
  }

  return (
    <motion.button
      type="button"
      onClick={copy}
      whileTap={{ scale: 0.88 }}
      aria-label={done ? 'Copied' : label}
      title={label}
      className={`grid size-10 cursor-pointer place-items-center rounded-full border transition-colors ${
        done ? 'border-live bg-live text-[#06210f]' : 'border-stage-border text-cream hover:border-amber hover:text-amber'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.svg
          key={done ? 'check' : 'copy'}
          viewBox="0 0 24 24"
          className={`size-4.5 ${svgClass}`}
          initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          {done ? icons.check : icons.copy}
        </motion.svg>
      </AnimatePresence>
    </motion.button>
  )
}

const rows = [
  { icon: 'mail', href: `mailto:${profile.email}`, text: profile.email, label: 'Email', copy: profile.email, copyLabel: 'Copy email' },
  { icon: 'phone', href: `tel:${profile.phone.replace(/\s/g, '')}`, text: profile.phoneDisplay, label: 'Phone', copy: profile.phone, copyLabel: 'Copy phone number' },
  { icon: 'linkedin', href: profile.linkedin, text: profile.linkedin.replace('https://www.', ''), label: 'LinkedIn', external: true },
  { icon: 'github', href: profile.github, text: profile.github.replace('https://', ''), label: 'GitHub', external: true },
]

export default function Contact() {
  return (
    <section id="contact" className="relative isolate mt-16 overflow-hidden bg-night pt-14 pb-8 md:mt-24 md:pt-20 text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-35 -z-10 size-120 animate-drift rounded-full bg-[#ff5a24] opacity-[calc(.35*var(--stage-glow))] blur-[90px] [animation-duration:18s]"
      />
      <div className="wrap">
        <span className="font-mono text-label text-amber">05 / CONTACT</span>

        <Reveal>
          <a
            href={`mailto:${profile.email}`}
            className="group mt-4.5 mb-9 block font-display text-contact leading-none font-extrabold tracking-[-.045em] break-words no-underline"
          >
            {/* Underline grows from left on hover */}
            <span className="bg-grad-hero bg-size-[0_4px] bg-left-bottom bg-no-repeat pb-1.5 transition-[background-size] duration-500 ease-snap group-hover:bg-size-[100%_4px]">
              Let&apos;s build something useful →
            </span>
          </a>
        </Reveal>

        {rows.map((r, i) => (
          <Reveal
            key={r.icon}
            delay={i * 0.07}
            y={16}
            className="group grid max-w-180 grid-cols-[44px_1fr_auto] items-center gap-3 border-t border-line py-3.5 sm:grid-cols-[48px_1fr_auto] sm:gap-4.5"
          >
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-full border border-stage-border text-amber transition-all duration-250 group-hover:-rotate-8 group-hover:scale-106 group-hover:border-transparent group-hover:bg-grad-hero group-hover:text-[#1a0d05]"
            >
              <svg viewBox="0 0 24 24" className={`size-5 ${svgClass}`}>
                {icons[r.icon]}
              </svg>
            </span>
            <a
              href={r.href}
              aria-label={r.label}
              {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="text-md font-medium break-all no-underline transition-colors hover:text-amber sm:text-lg"
            >
              {r.text}
            </a>
            {r.copy ? <CopyButton value={r.copy} label={r.copyLabel} /> : <span />}
          </Reveal>
        ))}

        <footer className="mt-14 flex flex-wrap justify-between gap-2 border-t border-line pt-5.5 font-mono text-label text-haze">
          <span>© {new Date().getFullYear()} {profile.firstName} {profile.lastName}</span>
          <span>Designed and built by hand</span>
        </footer>
      </div>
    </section>
  )
}
