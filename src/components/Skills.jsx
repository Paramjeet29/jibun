import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Reveal, { easeOut } from './ui/Reveal.jsx'
import SectionHead from './ui/SectionHead.jsx'
import { skills } from '../data.js'

const chipList = { show: { transition: { staggerChildren: 0.045 } } }
const chip = {
  hidden: { opacity: 0, y: 14, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: easeOut } },
}

export default function Skills() {
  const [cat, setCat] = useState(0)
  const [picked, setPicked] = useState(null)
  const tabs = useRef([])
  const current = skills[cat]

  const selectCat = (i) => {
    setCat(i)
    setPicked(null)
  }

  // Arrow keys move between tabs (standard tablist behaviour)
  const onKeyDown = (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = (cat + step + skills.length) % skills.length
    selectCat(next)
    tabs.current[next]?.focus()
  }

  const detail =
    picked == null
      ? { tag: 'Category', title: current.name, text: `${current.desc} Tap a skill to see where I’ve used it.` }
      : {
          tag: current.name,
          title: current.items[picked].name,
          text: current.items[picked].note ?? `Part of my ${current.name.toLowerCase()} toolkit.`,
        }

  return (
    <section id="skills" className="pt-16 pb-8 md:pt-24 md:pb-10">
      <div className="wrap">
        <SectionHead index="03" label="SKILLS" title="My toolbox." />

        <Reveal className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <div
            role="tablist"
            aria-label="Skill categories"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="grid min-w-0 auto-cols-max grid-flow-col content-start gap-2 overflow-x-auto pb-1 lg:auto-cols-auto lg:grid-flow-row lg:overflow-visible"
          >
            {skills.map((c, i) => {
              const selected = i === cat
              return (
                <button
                  key={c.name}
                  ref={(el) => (tabs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`tab-${i}`}
                  aria-selected={selected}
                  aria-controls="skills-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectCat(i)}
                  className={`relative flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-[14px] border px-4.5 py-4 text-left font-semibold whitespace-nowrap transition-[translate,border-color,color] duration-250 ease-snap ${
                    selected
                      ? 'z-10 border-transparent text-[#1a0d05] lg:translate-x-2.5'
                      : 'border-rule bg-surface text-ink hover:border-accent lg:hover:translate-x-1.5'
                  }`}
                >
                  {/* The gradient slides from tab to tab */}
                  {selected && (
                    <motion.span
                      layoutId="skill-tab"
                      className="absolute inset-0 rounded-[14px] bg-grad"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{c.name}</span>
                  <span className={`relative font-mono text-xs font-medium ${selected ? 'text-[#1a0d05]' : 'text-muted'}`}>
                    {String(c.items.length).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            id="skills-panel"
            role="tabpanel"
            aria-labelledby={`tab-${cat}`}
            className="grid min-h-85 content-start gap-6 rounded-[20px] border border-rule bg-surface p-5 sm:p-7"
          >
            {/* Re-keyed by category so the chips stagger in again */}
            <motion.div
              key={cat}
              role="group"
              aria-label={`${current.name} skills`}
              className="flex flex-wrap gap-2.5"
              initial="hidden"
              animate="show"
              variants={chipList}
            >
              {current.items.map((it, i) => {
                const pressed = picked === i
                return (
                  <motion.button
                    key={it.name}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setPicked(i)}
                    variants={chip}
                    whileHover={{ y: -4, rotate: -1.5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`cursor-pointer rounded-full border px-4.5 py-2.5 font-semibold transition-colors ${
                      pressed
                        ? 'border-accent bg-accent text-accent-ink shadow-[0_10px_24px_-10px_var(--accent)]'
                        : 'border-rule bg-bg text-ink hover:border-accent'
                    }`}
                  >
                    {it.name}
                  </motion.button>
                )
              })}
            </motion.div>

            <div aria-live="polite" className="min-h-24 border-t border-dashed border-rule pt-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${detail.tag}-${detail.title}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  <span className="font-mono text-label text-accent">{detail.tag}</span>
                  <h3 className="mt-1.5 mb-2 font-display text-title-sm leading-[1.1] font-extrabold tracking-[-.03em]">
                    {detail.title}
                  </h3>
                  <p className="max-w-[60ch] text-muted">{detail.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
