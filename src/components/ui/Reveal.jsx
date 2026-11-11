import { motion } from 'motion/react'

export const easeOut = [0.2, 0.9, 0.2, 1]

/** Fades and lifts its content the first time it scrolls into view.
 *  `as` picks the element ("div", "article", "li"...). Extra props
 *  (style, role, event handlers) pass straight through. */
export default function Reveal({ as = 'div', delay = 0, y = 36, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
