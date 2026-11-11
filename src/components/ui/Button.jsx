import { motion, useMotionValue, useSpring } from 'motion/react'
import { useFinePointer } from '../../hooks/index.js'

const spring = { stiffness: 300, damping: 20, mass: 0.5 }

const base =
  'group inline-flex items-center gap-2.5 rounded-full border font-semibold no-underline cursor-pointer transition-[background-color,color,box-shadow] duration-250 ease-snap'

const variants = {
  primary:
    'bg-grad border-transparent text-[#1a0d05] shadow-[0_8px_28px_-8px_color-mix(in_srgb,var(--accent)_70%,transparent)] hover:shadow-[0_12px_36px_-6px_color-mix(in_srgb,var(--accent)_80%,transparent)]',
  ghost: 'border-current hover:bg-current/12',
  ghostStage: 'border-stage-border text-cream hover:bg-cream/10',
}

const sizes = {
  md: 'px-5 py-3 text-md',
  sm: 'px-4 py-2 text-sm',
}

/** Link styled as a button that is pulled towards the cursor ("magnetic"). */
export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  arrow = false,
  className = '',
  children,
  ...rest
}) {
  const enabled = useFinePointer()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  const onPointerMove = (e) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.22)
    y.set((e.clientY - r.top - r.height / 2) * 0.3)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      href={href}
      style={{ x: sx, y: sy }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
      {arrow && (
        <span aria-hidden="true" className="transition-transform duration-250 group-hover:translate-x-1">
          →
        </span>
      )}
    </motion.a>
  )
}
