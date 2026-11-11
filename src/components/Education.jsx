import Reveal from './ui/Reveal.jsx'
import SectionHead from './ui/SectionHead.jsx'
import { education } from '../data.js'

export default function Education() {
  return (
    <section id="education" className="pt-16 pb-8 md:pt-24 md:pb-10">
      <div className="wrap">
        <SectionHead index="04" label="EDUCATION" title="Where I learned." />
        <Reveal className="flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-rule bg-surface p-6 sm:p-8">
          <div>
            <h3 className="mb-1.5 font-display text-title-sm leading-[1.15] font-extrabold tracking-[-.03em]">
              {education.school}
            </h3>
            <p className="text-muted">
              {education.degree} · {education.years}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
