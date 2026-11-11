import Reveal from './ui/Reveal.jsx'
import CountUp from './ui/CountUp.jsx'
import { stats } from '../data.js'

export default function Impact() {
  return (
    <div className="wrap">
      <div role="list" aria-label="Measured results" className="grid grid-cols-2 gap-4 pt-14 pb-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal
            key={s.text}
            role="listitem"
            delay={i * 0.08}
            className="group relative overflow-hidden rounded-2xl border border-rule bg-surface p-5 transition-[translate,border-color] duration-300 ease-snap hover:-translate-y-1.5 hover:border-accent sm:p-6"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-grad transition-transform duration-500 group-hover:scale-x-100" />
            <div className="text-grad font-display text-stat leading-none font-extrabold tracking-[-.04em] tabular-nums">
              <span className="sr-only">
                {s.value}
                {s.suffix}
              </span>
              <CountUp to={s.value} />
              <small aria-hidden="true" className="ml-0.5 text-[.5em]">
                {s.suffix}
              </small>
            </div>
            <p className="mt-2.5 text-sm leading-[1.45] text-muted">{s.text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
