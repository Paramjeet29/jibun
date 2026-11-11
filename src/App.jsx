import { MotionConfig } from 'motion/react'
import ScrollProgress from './components/ScrollProgress.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Impact from './components/Impact.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Skills from './components/Skills.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'

export default function App() {
  return (
    // "user" = follow the OS reduce-motion setting for every Motion animation.
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <a
        href="#work"
        className="sr-only bg-ink px-3.5 py-2 text-bg focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <Nav />
      <main id="top">
        <Hero />
        <Impact />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
    </MotionConfig>
  )
}
