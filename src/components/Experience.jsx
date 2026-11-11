import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import Reveal from './ui/Reveal.jsx'
import SectionHead from './ui/SectionHead.jsx'
import Rich from './ui/Rich.jsx'
import { jobs } from '../data.js'

export default function Experience() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  // 0 when the timeline's top reaches 75% of the viewport, 1 when its end reaches 60%
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <section id="work" className="pt-16 pb-8 md:pt-24 md:pb-10">
      <div className="wrap">
        <SectionHead index="01" label="EXPERIENCE" title="Where I've shipped." />

        <div ref={ref} className="relative pl-8.5 sm:pl-11">
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-1.75 w-0.5 bg-rule sm:left-2.75">
            <motion.div
              style={{ scaleY: reduce ? 1 : fill }}
              className="absolute inset-0 origin-top bg-linear-to-b from-accent to-accent2"
            />
          </div>

          {jobs.map((job) => (
            <Reveal as="article" key={job.company} className="relative pb-14 last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute top-2 -left-7.75 size-4 rounded-full border-[3px] border-accent shadow-[0_0_0_6px_color-mix(in_srgb,var(--accent)_16%,transparent)] sm:-left-10.25 ${
                  job.current ? 'animate-ring bg-accent' : 'bg-bg'
                }`}
              />
              <div className="flex flex-wrap gap-3.5 font-mono text-label text-muted">
                <b className="font-medium text-accent">{job.when}</b>
                <span>{job.where}</span>
              </div>
              <h3 className="mt-2 mb-0.5 font-display text-title leading-[1.1] font-extrabold tracking-[-.03em]">
                {job.company}
              </h3>
              <p className="mb-4.5 text-lg text-muted">{job.role}</p>
              <ul className="grid max-w-[72ch] gap-2.5">
                {job.points.map((p) => (
                  <li
                    key={p}
                    className="rounded-r-[10px] border-l-2 border-rule py-3 pr-4 pl-5 transition-[border-color,background-color,translate] duration-250 hover:translate-x-1.5 hover:border-accent hover:bg-surface"
                  >
                    <Rich text={p} />
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
