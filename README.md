# paramjeet.dev

Personal portfolio built with **React 19**, **Vite**, **Tailwind CSS v4** and **Motion** (formerly Framer Motion).

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Where things live

```
src/
  data.js                 all page copy: profile, jobs, projects, skills (edit text here)
  index.css               theme tokens, light/dark colours, CSS keyframes, small utilities
  hooks/index.js          useFinePointer, useTypewriter, useActiveSection, toggleTheme
  components/
    Nav.jsx               sticky nav, gliding active pill, theme toggle
    Hero.jsx              letter reveal, typewriter, spotlight, parallax cards, marquee
    Impact.jsx            count-up stat tiles
    Experience.jsx        scroll-linked timeline fill
    Projects.jsx          3D tilt cards + three interactive demos
    Skills.jsx            tabbed toolbox with sliding highlight and staggered chips
    Education.jsx
    Contact.jsx           copy-to-clipboard buttons, animated underline
    ui/                   Button (magnetic), Reveal, CountUp, SectionHead, Rich
```

## How the animation is split

| Kind | Tool | Examples |
|---|---|---|
| Endless loops | Tailwind keyframes in `index.css` (`animate-drift`, `animate-marquee`, ...) | blobs, marquee, live dot, caret |
| Entrance / on scroll | Motion `initial` / `whileInView` | `Reveal`, hero letters, steps demo |
| Follows the pointer | Motion `useMotionValue` + `useSpring` (no React re-renders) | magnetic buttons, tilt, spotlight, parallax |
| Linked to scroll | Motion `useScroll` | top progress bar, timeline fill |
| Shared highlight | Motion `layoutId` | nav pill, skill tab |
| Enter / exit swaps | Motion `AnimatePresence` | skill detail, copy → tick icon |

Accessibility: `<MotionConfig reducedMotion="user">` plus a `prefers-reduced-motion` block in
`index.css` turn motion off for people who ask for that. Pointer effects are also skipped
on touch screens (`useFinePointer`).

## Responsive text

All font sizes come from a fluid scale in `index.css` (`--text-h1`, `--text-h2`, `--text-title`,
`--text-base`, `--text-label`, ...). Each one grows smoothly from a 360px phone to a 1536px
screen, then stops, so use `text-h1`, `text-base`, `text-label` etc. instead of fixed pixel
sizes. To make something bigger or smaller everywhere, change its min/max in that one list.

## Theming

Colours are CSS variables in `index.css` (`--bg`, `--ink`, `--accent`, ...), exposed to
Tailwind as `bg-bg`, `text-ink`, `text-accent`, etc. Dark mode follows the OS, and the nav
toggle overrides it (saved in `localStorage`).
