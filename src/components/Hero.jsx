import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import Button from './ui/Button.jsx'
import { easeOut } from './ui/Reveal.jsx'
import { useFinePointer, useTypewriter } from '../hooks/index.js'
import { profile, roles, stack } from '../data.js'

const fadeUp = (delay, duration = 0.8) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: easeOut },
})

/* ---------- Name: each letter rises out of a clipped line ---------- */
function SplitLine({ text, offset, gradient }) {
  return (
    <span aria-hidden="true" className="-mb-[.08em] block overflow-hidden pb-[.08em]">
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: '110%', rotate: 6 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.25 + (offset + i) * 0.045 }}
        >
          {/* Hover wobble lives on an inner span so it never fights the entrance */}
          <span
            className={`inline-block transition-transform duration-300 ease-snap hover:-translate-y-[.08em] hover:-rotate-4 ${
              gradient ? 'text-grad-hero' : ''
            }`}
          >
            {ch}
          </span>
        </motion.span>
      ))}
    </span>
  )
}

/* Its own component so the 70ms typing ticks only re-render this span.
   Every word is stacked invisibly in the same grid cell, so the slot is always
   as wide as the longest word and the sentence never reflows while typing. */
function RoleWord() {
  const text = useTypewriter(roles)
  return (
    <span className="inline-grid">
      {roles.map((w) => (
        <span key={w} aria-hidden="true" className="invisible col-start-1 row-start-1 border-r-2 border-transparent pr-1">
          {w}
        </span>
      ))}
      <span className="col-start-1 row-start-1 animate-caret justify-self-start border-r-2 border-amber pr-1 text-amber">
        {text}
      </span>
    </span>
  )
}

/* ---------- Floating glass cards with mouse parallax ---------- */
function FloatCard({ px, py, depth, delay = '0s', className = '', children }) {
  const x = useTransform(px, (v) => v * depth)
  const y = useTransform(py, (v) => v * depth)
  return (
    <motion.div
      style={{ x, y }}
      className={`absolute w-55 rounded-2xl border border-stage-border/60 bg-stage-card px-4.5 py-4 shadow-[0_30px_60px_-20px_var(--stage-shadow)] backdrop-blur-[14px] sm:w-62.5 ${className}`}
    >
      <div className="animate-bob" style={{ animationDelay: delay }}>
        {children}
      </div>
    </motion.div>
  )
}

const cardKey = 'flex justify-between font-mono text-2xs font-medium tracking-[.08em] text-haze uppercase'
const cardSub = 'text-label text-haze'
const barHeights = [40, 58, 46, 72, 64, 88, 100]

export default function Hero() {
  const heroRef = useRef(null)
  const stageRef = useRef(null)
  const fine = useFinePointer()

  // Spotlight that follows the cursor
  const mx = useMotionValue(320)
  const my = useMotionValue(260)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(255,154,31,.16), transparent 60%)`

  // Pointer position relative to the card stage, -0.5..0.5, smoothed
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spx = useSpring(px, { stiffness: 120, damping: 20 })
  const spy = useSpring(py, { stiffness: 120, damping: 20 })

  const onPointerMove = (e) => {
    if (!fine) return
    const r = heroRef.current.getBoundingClientRect()
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
    const s = stageRef.current.getBoundingClientRect()
    px.set((e.clientX - (s.left + s.width / 2)) / s.width)
    py.set((e.clientY - (s.top + s.height / 2)) / s.height)
  }

  return (
    <div
      id="hero"
      ref={heroRef}
      onPointerMove={onPointerMove}
      className="relative isolate overflow-hidden bg-night pt-10 text-cream sm:pt-16"
    >
      {/* Glow blobs (CSS keyframes) */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-30 -z-20 size-130 animate-drift rounded-full bg-[#ff5a24] opacity-[calc(.55*var(--stage-glow))] blur-[70px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-30 left-[22%] -z-20 size-105 animate-drift rounded-full bg-[#ffa21f] opacity-[calc(.32*var(--stage-glow))] blur-[70px] [animation-delay:-6s] [animation-duration:20s]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[30%] -left-35 -z-20 size-90 animate-drift rounded-full bg-[#5b3dff] opacity-[calc(.3*var(--stage-glow))] blur-[70px] [animation-delay:-12s] [animation-duration:24s]" />

      {/* Faded grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 40% 40%, #000 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 40% 40%, #000 20%, transparent 75%)',
        }}
      />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: spotlight }} />

      <div className="wrap grid items-center gap-10 pb-12 md:pb-18 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.span
            {...fadeUp(0.1)}
            className="inline-flex items-center gap-2.5 rounded-full border border-line bg-cream/4 py-1.5 pr-3.5 pl-3 font-mono text-label text-haze"
          >
            <span aria-hidden="true" className="size-2 animate-live rounded-full bg-live" />
            {profile.status}
          </motion.span>

          <h1
            aria-label={`${profile.firstName} ${profile.lastName}`}
            className="mt-6.5 mb-5.5 font-display text-h1 leading-[.88] font-extrabold tracking-[-.045em]"
          >
            <SplitLine text={profile.firstName} offset={0} />
            <SplitLine text={profile.lastName} offset={profile.firstName.length} gradient />
          </h1>

          <motion.p {...fadeUp(0.9)} className="mb-4.5 font-display text-role leading-[1.3] font-medium">
            I build <RoleWord />
            <br />
            products people enjoy using.
          </motion.p>

          <motion.p {...fadeUp(1.05)} className="mb-7.5 max-w-[52ch] text-lg text-haze">
            Frontend engineer with <strong className="font-semibold text-cream">2.5+ years</strong> shipping
            enterprise apps for <strong className="font-semibold text-cream">10,000+ users</strong>. I turn slow,
            clunky workflows into fast, clear interfaces, and I can prove it with numbers.
          </motion.p>

          <motion.div {...fadeUp(1.2)} className="flex flex-wrap gap-3">
            <Button href="#projects" arrow>
              See my work
            </Button>
            <Button href="#contact" variant="ghostStage">
              Say hello
            </Button>
          </motion.div>
        </div>

        <motion.div
          ref={stageRef}
          aria-hidden="true"
          {...fadeUp(0.7, 1)}
          className="relative h-100 perspective-[900px] lg:h-110"
        >
          <FloatCard px={spx} py={spy} depth={14} className="top-1.5 left-0 sm:left-[6%]">
            <div className={cardKey}>
              <span>Grievance form</span>
              <span>Next.js</span>
            </div>
            <div className="mt-1.5 font-display text-card-value leading-[1.05] font-extrabold tracking-[-.03em]">−40%</div>
            <div className={cardSub}>average submission time</div>
          </FloatCard>

          <FloatCard px={spx} py={spy} depth={26} delay="-2s" className="top-35 right-0 sm:w-67.5">
            <div className={cardKey}>
              <span>Decorum assets</span>
              <span>500+</span>
            </div>
            <div className="mt-2.5 flex h-9.5 items-end gap-1.25">
              {barHeights.map((h, k) => (
                <motion.i
                  key={k}
                  className="flex-1 origin-bottom rounded-t-[3px] bg-linear-to-b from-accent2 to-accent"
                  style={{ height: `${h}%` }}
                  initial={{ scaleY: 0.08 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1.2, ease: easeOut, delay: 1 + k * 0.07 }}
                />
              ))}
            </div>
            <div className={`${cardSub} mt-2`}>35% less manual processing</div>
          </FloatCard>

          <FloatCard px={spx} py={spy} depth={8} delay="-4s" className="bottom-1.5 left-[4%] sm:left-[14%] sm:w-67.5">
            <div className={cardKey}>
              <span>E-Register trigger</span>
              <span>live</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 font-mono text-2xs font-medium">
              <span className="rounded-full bg-cream/8 px-2 py-0.75">on share</span>
              <span className="rounded-full bg-cream/8 px-2 py-0.75">if approved</span>
              <span className="rounded-full bg-live/18 px-2 py-0.75 text-ok">notify ✓</span>
            </div>
            <div className={`${cardSub} mt-2.5`}>30% fewer setup steps</div>
          </FloatCard>
        </motion.div>
      </div>

      {/* Infinite marquee: list is doubled, then shifted -50% */}
      <div aria-hidden="true" className="group overflow-hidden border-t border-line bg-cream/2 py-4 whitespace-nowrap">
        <div className="inline-flex animate-marquee gap-10 pl-10 group-hover:[animation-play-state:paused]">
          {[...stack, ...stack].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-10 font-display text-marquee font-bold tracking-[-.01em] text-haze">
              {s}
              <span className="text-sm text-ember">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
