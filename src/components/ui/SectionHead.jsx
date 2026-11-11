import Reveal from './Reveal.jsx'

export default function SectionHead({ index, label, title }) {
  return (
    <Reveal className="mb-9 md:mb-13">
      <span className="inline-flex items-center gap-3 font-mono text-label tracking-[.02em] text-accent after:h-px after:w-14 after:bg-accent">
        {index} / {label}
      </span>
      <h2 className="mt-3.5 max-w-[16ch] font-display text-h2 leading-[.98] font-extrabold tracking-[-.04em] text-balance">
        {title}
      </h2>
    </Reveal>
  )
}
