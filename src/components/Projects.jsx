import { useId, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import Reveal, { easeOut } from './ui/Reveal.jsx'
import SectionHead from './ui/SectionHead.jsx'
import { useFinePointer } from '../hooks/index.js'
import { projects } from '../data.js'

/* ---------- Card that tilts in 3D and carries a cursor spotlight ---------- */
function TiltCard({ children }) {
  const fine = useFinePointer()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 200, damping: 20 })
  const rotateY = useSpring(ry, { stiffness: 200, damping: 20 })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const glow = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, color-mix(in srgb, var(--accent) 16%, transparent), transparent 65%)`

  const onPointerMove = (e) => {
    if (!fine) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    mx.set(x)
    my.set(y)
    // Hold still while the visitor is using the demo controls
    if (e.target.closest('[data-demo]')) {
      rx.set(0)
      ry.set(0)
      return
    }
    ry.set((x / r.width - 0.5) * 3)
    rx.set((0.5 - y / r.height) * 3)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <Reveal
      as="article"
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="group relative grid gap-9 overflow-hidden rounded-[20px] border border-rule bg-surface p-5 transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--accent)_60%,var(--rule))] sm:p-8 lg:grid-cols-2"
    >
      <motion.div
        aria-hidden="true"
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </Reveal>
  )
}

function DemoBox({ label, note, children }) {
  const id = useId()
  return (
    <div
      data-demo
      aria-labelledby={id}
      className="relative self-center rounded-[14px] border border-dashed border-rule bg-bg p-4.5"
    >
      <div id={id} className="mb-3.5 flex justify-between gap-2 font-mono text-label text-muted">
        <span>{label}</span>
        <span>{note}</span>
      </div>
      {children}
    </div>
  )
}

/* ---------- Demo 1: build a rule, watch the JSON update ---------- */
const ruleOptions = {
  when: ['a form is shared', 'a field changes', 'a form is submitted'],
  cond: ['status is Approved', 'amount is above 10,000', 'any value'],
  then: ['notify the owner', 'assign a reviewer', 'archive the record'],
}
const ruleRows = [
  ['when', 'When'],
  ['cond', 'If'],
  ['then', 'Then'],
]
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

function TriggerDemo() {
  const id = useId()
  const [rule, setRule] = useState({
    when: ruleOptions.when[0],
    cond: ruleOptions.cond[0],
    then: ruleOptions.then[0],
  })
  const [edits, setEdits] = useState(0)
  const json = JSON.stringify(
    { trigger: slug(rule.when), condition: slug(rule.cond), action: slug(rule.then) },
    null,
    2,
  )

  return (
    <DemoBox label="Try a trigger" note="illustrative">
      {ruleRows.map(([key, label]) => (
        <div key={key} className="mb-2 grid grid-cols-[56px_1fr] items-center gap-2">
          <label htmlFor={`${id}-${key}`} className="font-mono text-xs font-medium text-accent uppercase">
            {label}
          </label>
          <select
            id={`${id}-${key}`}
            value={rule[key]}
            onChange={(e) => {
              setRule((r) => ({ ...r, [key]: e.target.value }))
              setEdits((n) => n + 1)
            }}
          >
            {ruleOptions[key].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      ))}
      <p aria-live="polite" className="mt-3.5 text-md">
        When <b className="font-semibold text-accent">{rule.when}</b>, and{' '}
        <b className="font-semibold text-accent">{rule.cond}</b>,{' '}
        <b className="font-semibold text-accent">{rule.then}</b>.
      </p>
      {/* Re-keyed on each edit so the accent ring flashes */}
      <motion.pre
        key={edits}
        aria-label="Rule as JSON"
        initial={edits ? { boxShadow: '0 0 0 3px rgba(125,178,255,1)' } : false}
        animate={{ boxShadow: '0 0 0 0px rgba(125,178,255,0)' }}
        transition={{ duration: 0.5 }}
        className="mt-3.5 overflow-x-auto rounded-[10px] border border-line bg-night p-3.5 font-mono text-xs leading-[1.6] text-cream"
      >
        {json}
      </motion.pre>
    </DemoBox>
  )
}

/* ---------- Demo 2: before / after bars ---------- */
function BarsDemo() {
  const bars = [
    { label: 'Before', value: 100, before: true },
    { label: 'After', value: 65 },
  ]
  return (
    <DemoBox label="Workflow time per batch" note="before / after">
      <div className="grid gap-3.5">
        {bars.map((b, i) => (
          <div key={b.label} className="grid grid-cols-[56px_1fr_36px] items-center gap-2.5 text-sm">
            <span>{b.label}</span>
            <span className="relative block h-3.5 overflow-hidden rounded-full bg-rule">
              <motion.span
                className={`absolute inset-y-0 left-0 origin-left rounded-full ${
                  b.before ? 'bg-muted opacity-60' : 'bg-linear-to-r from-accent to-accent2'
                }`}
                style={{ width: `${b.value}%` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 1.4, ease: easeOut, delay: i * 0.25 }}
              />
            </span>
            <span className="text-right font-mono text-xs font-medium">{b.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3.5 text-sm text-muted">Indexed to 100. Shows the reported 35% reduction.</p>
    </DemoBox>
  )
}

/* ---------- Demo 3: case tracking steps ---------- */
const steps = [
  ['Grievance submitted', 'done'],
  ['Under review', 'done'],
  ['Action taken', 'current'],
  ['Resolved', 'pending'],
]
const pill = {
  done: 'border-ok text-ok',
  current: 'animate-glow border-accent text-accent',
  pending: 'border-rule text-muted',
}

function StepsDemo() {
  return (
    <DemoBox label="Case tracking states" note="illustrative">
      <motion.ol
        className="grid gap-2"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      >
        {steps.map(([label, state], i) => (
          <motion.li
            key={label}
            variants={{
              hidden: { opacity: 0, x: -12 },
              show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: easeOut } },
            }}
            className="grid grid-cols-[28px_1fr_auto] items-center gap-2.5 rounded-[10px] border border-rule bg-surface px-3 py-2.5 text-md transition-[translate,border-color] duration-250 hover:translate-x-1.25 hover:border-accent"
          >
            <span className="font-mono text-xs font-medium text-muted">{String(i + 1).padStart(2, '0')}</span>
            {label}
            <span className={`rounded-full border px-2.25 py-0.5 font-mono text-2xs font-medium ${pill[state]}`}>
              {state}
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </DemoBox>
  )
}

/* ---------- Demo 4: split a trip, see who pays whom (Hoku) ---------- */
const riders = ['Arjun', 'Meera', 'Kabir']
const tripCosts = [
  { item: 'Fuel', amount: 1800, paidBy: 'Arjun' },
  { item: 'Homestay', amount: 4200, paidBy: 'Meera' },
  { item: 'Dinner', amount: 1500, paidBy: 'Kabir' },
]
const inr = (n) => `₹${n.toLocaleString('en-IN')}`

/** Equal split, then the fewest payments: the biggest debtor pays the biggest creditor first. */
function settleUp(costs) {
  const share = costs.reduce((s, c) => s + c.amount, 0) / riders.length
  const bal = riders.map((name) => ({
    name,
    v: costs.filter((c) => c.paidBy === name).reduce((s, c) => s + c.amount, 0) - share,
  }))
  const owes = bal.filter((b) => b.v < 0).sort((a, b) => a.v - b.v)
  const gets = bal.filter((b) => b.v > 0).sort((a, b) => b.v - a.v)
  const out = []
  let i = 0
  let j = 0
  while (i < owes.length && j < gets.length) {
    const pay = Math.min(-owes[i].v, gets[j].v)
    out.push({ from: owes[i].name, to: gets[j].name, amount: Math.round(pay) })
    owes[i].v += pay
    gets[j].v -= pay
    if (owes[i].v > -0.5) i++
    if (gets[j].v < 0.5) j++
  }
  return { share, out }
}

function SplitDemo() {
  const id = useId()
  const [costs, setCosts] = useState(tripCosts)
  const { share, out } = settleUp(costs)

  return (
    <DemoBox label="Split a weekend ride" note="illustrative">
      {costs.map((c, k) => (
        <div key={c.item} className="mb-2 grid grid-cols-[1fr_72px_110px] items-center gap-2 text-md">
          <label htmlFor={`${id}-${k}`}>{c.item}</label>
          <span className="text-right font-mono text-xs font-medium tabular-nums">{inr(c.amount)}</span>
          <select
            id={`${id}-${k}`}
            aria-label={`${c.item} paid by`}
            value={c.paidBy}
            onChange={(e) => setCosts((all) => all.map((x, n) => (n === k ? { ...x, paidBy: e.target.value } : x)))}
          >
            {riders.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      ))}
      <p className="mt-3.5 text-sm text-muted">
        {inr(costs.reduce((s, c) => s + c.amount, 0))} total, {inr(share)} each. Pick who paid to see the settle-up.
      </p>
      <ul aria-live="polite" className="mt-3 grid gap-2">
        {out.map((t) => (
          <motion.li
            key={`${t.from}-${t.to}-${t.amount}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="flex items-center justify-between gap-2 rounded-[10px] border border-rule bg-surface px-3 py-2.5 text-md"
          >
            <span>
              <b className="font-semibold">{t.from}</b> pays <b className="font-semibold">{t.to}</b>
            </span>
            <span className="font-mono text-xs font-medium text-accent tabular-nums">{inr(t.amount)}</span>
          </motion.li>
        ))}
      </ul>
    </DemoBox>
  )
}

const demos = { trigger: TriggerDemo, bars: BarsDemo, steps: StepsDemo, split: SplitDemo }

export default function Projects() {
  return (
    <section id="projects" className="pt-16 pb-8 md:pt-24 md:pb-10">
      <div className="wrap">
        <SectionHead index="02" label="PROJECTS" title="Tools people use all day." />
        <div className="grid gap-5.5">
          {projects.map((p, i) => {
            const Demo = demos[p.demo]
            return (
              <TiltCard key={p.title}>
                <div className="relative">
                  {/* Big outlined index number, sitting behind the heading */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-1 right-0 hidden font-display text-index leading-[.8] font-extrabold tracking-[-.06em] text-transparent [-webkit-text-stroke:1.5px_var(--rule)] lg:block"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="relative font-mono text-label text-muted">{p.kicker}</span>
                  <h3 className="relative mt-2 mb-3.5 font-display text-title leading-[1.05] font-extrabold tracking-[-.03em]">
                    {p.title}
                  </h3>
                  <p className="mb-4 text-muted">{p.text}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-rule px-2.75 py-1 font-mono text-xs font-medium text-muted transition-colors group-hover:border-[color-mix(in_srgb,var(--accent)_50%,var(--rule))] group-hover:text-ink"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-baseline gap-3">
                    <b className="text-grad font-display text-metric leading-none font-extrabold tracking-[-.04em]">
                      {p.metric}
                    </b>
                    <span className="max-w-[16ch] text-sm leading-[1.3] text-muted">{p.metricText}</span>
                  </div>
                  {p.link ? (
                    <a
                      href={p.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative mt-5 inline-flex items-center gap-1.5 text-md font-semibold text-accent no-underline hover:underline"
                    >
                      {p.link.text}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
                <Demo />
              </TiltCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
