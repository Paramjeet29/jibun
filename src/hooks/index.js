import { useEffect, useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from 'motion/react'

/** Live boolean for a CSS media query. */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** True only for a real mouse/trackpad and when the user allows motion.
 *  Gate every pointer-following effect (magnetic, tilt, parallax) on this. */
export function useFinePointer() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduce = useReducedMotion()
  return fine && !reduce
}

/** Types and deletes each word in turn. */
export function useTypewriter(words, startDelay = 2600) {
  const reduce = useReducedMotion()
  const [text, setText] = useState(words[0])

  useEffect(() => {
    if (reduce) return
    let wi = 0
    let ci = words[0].length
    let dir = -1
    let timer

    const tick = () => {
      const word = words[wi]
      let delay = 70
      ci += dir
      setText(word.slice(0, ci))
      if (dir === 1 && ci === word.length) {
        dir = -1
        delay = 1500
      } else if (dir === -1 && ci === 0) {
        dir = 1
        wi = (wi + 1) % words.length
        delay = 250
      }
      timer = setTimeout(tick, delay)
    }

    timer = setTimeout(tick, startDelay)
    return () => clearTimeout(timer)
  }, [words, startDelay, reduce])

  return text
}

/** Id of the last section whose top has passed 40% of the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const onScroll = () => {
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])

  return active
}

export function toggleTheme() {
  const root = document.documentElement
  const attr = root.dataset.theme
  const isDark =
    attr === 'dark' || (!attr && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const next = isDark ? 'light' : 'dark'
  root.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
}
