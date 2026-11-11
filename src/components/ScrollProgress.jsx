import { motion, useScroll, useSpring } from 'motion/react'

/** Thin gradient bar at the top that fills as you scroll the page. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-40 h-0.75 origin-left bg-linear-to-r from-accent to-accent2"
    />
  )
}
