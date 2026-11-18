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

## Hire me form (email)

The **Hire me** button opens a form (`src/components/HireDialog.jsx`) that posts to
`api/contact.js`, a Vercel serverless function that emails the message to you through
[Resend](https://resend.com). The API key stays on the server; replying to the email answers the
person who wrote.

One-time setup:

1. Sign up at resend.com with the inbox you want messages in, then create an API key.
2. In Vercel → this project → Settings → Environment Variables, add:
   - `RESEND_API_KEY` = the key from step 1
   - `CONTACT_TO` = your inbox (the address you signed up to Resend with)
   - `CONTACT_FROM` (optional) = e.g. `Portfolio <hello@your-domain.dev>` after you verify a domain
     in Resend. Without it, mail comes from `onboarding@resend.dev`, which can only deliver to your
     own Resend address, and that's all this form needs.
3. Redeploy.

`npm run dev` (Vite) doesn't run `/api`, so the form shows an error locally. To try it end to end,
run `npx vercel dev`, which serves the site and the function together using your env vars.

### Spam and rate limits

`api/_ratelimit.js` limits the form to **3 messages per visitor per 10 minutes**, **10 per visitor
per day** and **50 for the whole site per day** (under Resend's free 100/day, so a flood can't use
up the quota). A visitor over a limit gets "please try again later" and nothing is emailed. There's
also a hidden honeypot field that quietly drops bot submissions.

Without extra setup the counts live in the function's memory, which is best-effort: Vercel can run
several copies of the function and restarts them. To make the limits reliable, add Upstash Redis
(free tier):

1. Vercel → this project → **Storage** (or Marketplace) → add **Upstash for Redis**, and connect it
   to the project. It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you. (Or create a database
   at upstash.com and add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` yourself.)
2. Redeploy. If Upstash is ever unreachable, the form falls back to the in-memory limits.

The numbers are in `RULES` at the top of `api/_ratelimit.js`.
