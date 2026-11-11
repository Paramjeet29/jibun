import { useState } from 'react'
import { motion } from 'motion/react'
import Button from './ui/Button.jsx'
import { toggleTheme, useActiveSection } from '../hooks/index.js'

const links = [
  ['work', 'Experience'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
]
const ids = links.map(([id]) => id)

export default function Nav() {
  const active = useActiveSection(ids)
  const [spins, setSpins] = useState(0)

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-bg/82 backdrop-blur-md">
      <div className="wrap flex h-14.5 items-center justify-between gap-4">
        <a
          href="#top"
          aria-label="Paramjeet Singh, top of page"
          className="font-display text-lg font-extrabold tracking-[-.02em] no-underline"
        >
          paramjeet<span className="text-accent">.</span>dev
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex gap-1.5">
            {links.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'true' : undefined}
                  className={`relative block rounded-full px-3 py-1.75 text-sm font-medium no-underline transition-colors ${
                    active === id ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {/* One shared pill that glides to the active link */}
                  {active === id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-ink/8"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <motion.button
            type="button"
            aria-label="Switch colour theme"
            title="Switch colour theme"
            onClick={() => {
              toggleTheme()
              setSpins((s) => s + 1)
            }}
            animate={{ rotate: spins * 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="grid size-9.5 cursor-pointer place-items-center rounded-full border border-rule text-ink"
          >
            ◐
          </motion.button>
          <Button href="#contact" size="sm" arrow>
            Hire me
          </Button>
        </div>
      </div>
    </header>
  )
}
