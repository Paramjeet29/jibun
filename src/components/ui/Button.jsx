import { motion, useMotionValue, useSpring } from 'motion/react'
import { useFinePointer } from '../../hooks/index.js'

const spring = { stiffness: 300, damping: 20, mass: 0.5 }

const base =
  'group inline-flex items-center justify-center gap-2.5 rounded-full border font-semibold no-underline cursor-pointer transition-[background-color,color,box-shadow,opacity] duration-250 ease-snap disabled:cursor-not-allowed'

const variants = {
  primary:
    'bg-grad border-transparent text-accent-ink shadow-[0_8px_28px_-8px_color-mix(in_srgb,var(--accent)_70%,transparent)] hover:shadow-[0_12px_36px_-6px_color-mix(in_srgb,var(--accent)_80%,transparent)]',
  ghost: 'border-current hover:bg-current/12',
  ghostStage: 'border-stage-border text-cream hover:bg-cream/10',
  quiet: 'border-rule text-ink hover:border-accent hover:bg-accent/6',
}

const sizes = {
  md: 'px-5 py-3 text-md',
  sm: 'px-4 py-2 text-sm',
}

/**
 * A button, pulled towards the cursor ("magnetic") unless `still` is set. With `href` it is a link;
 * without one it is a real <button> (type="button" unless you pass type="submit").
 * `still` turns off every hover movement (the magnet and the arrow nudge): use it for buttons that
 * should stay put, like Hire me in the nav and the buttons inside a dialog.
 */
export default function Button({
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  arrow = false,
  still = false,
  className = '',
  children,
  ...rest
}) {
  const Tag = href ? motion.a : motion.button
  const fine = useFinePointer()
  const magnetic = fine && !still
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  const onPointerMove = (e) => {
    if (!magnetic) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.22)
    y.set((e.clientY - r.top - r.height / 2) * 0.3)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <Tag
      {...(href ? { href } : { type })}
      style={magnetic ? { x: sx, y: sy } : undefined}
      onPointerMove={magnetic ? onPointerMove : undefined}
      onPointerLeave={magnetic ? reset : undefined}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className={still ? undefined : 'transition-transform duration-250 group-hover:translate-x-1'}
        >
          →
        </span>
      )}
    </Tag>
  )
}
