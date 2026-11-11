import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

/** Counts from 0 to `to` once it is mostly on screen.
 *  Renders a MotionValue directly, so React never re-renders per frame. */
export default function CountUp({ to, duration = 1.1 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const value = useMotionValue(reduce ? to : 0)
  const rounded = useTransform(value, (v) => Math.round(v))
  const inView = useInView(ref, { once: true, amount: 0.6 })

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      value.set(to)
      return
    }
    const controls = animate(value, to, { duration, ease: [0.33, 1, 0.68, 1] })
    return () => controls.stop()
  }, [inView, reduce, to, duration, value])

  return (
    <motion.span ref={ref} aria-hidden="true">
      {rounded}
    </motion.span>
  )
}
