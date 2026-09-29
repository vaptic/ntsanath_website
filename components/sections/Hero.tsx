'use client'

import { useEffect, useRef, useState } from 'react'

const TYPE_WORDS = [
  'WEB APPS.',
  'MOBILE APPS.',
  'CLOUD INFRA.',
  'NETWORKS.',
  'APIs.',
  'ACTIVE DIRECTORY.',
]

const TYPE_SPEED   = 75
const DELETE_SPEED = 35
const PAUSE_END    = 1800
const PAUSE_NEXT   = 350

const MOUSE_X_FACTOR = 22
const MOUSE_Y_FACTOR = 14

// Must match the CSS fallback in --cursor-size (globals.css)
const CURSOR_DEFAULT = 26

const WORD_A      = 'Sanath'
const WORD_B      = 'Jeason'
const KICKER_TEXT = 'Cybersecurity consultant · VAPT specialist'
const TYPE_PREFIX = 'I SECURE '
const LEDE_TEXT   = "From reconnaissance to remediation, through every layer of the stack — and everything that's been compromised."

// ── h1 helper: every character → .char span (no spaces expected in these words)
function splitChars(word: string, prefix: string) {
  return word.split('').map((ch, i) => (
    <span className="char" key={`${prefix}${i}`}>{ch}</span>
  ))
}

// ── prose helper: non-space chars → .char span (hit-testable + glitch-able)
//                 space chars      → plain <span> (invisible to glitch, wraps normally)
function splitTextChars(text: string, prefix: string) {
  // Word-first split — see the matching helper in Scale.tsx. A bare run of
  // inline-block .char spans lets the browser break lines mid-word.
  const parts = text.split(/(\s+)/)
  return parts.map((part, w) => {
    if (part === '') return null
    if (/^\s+$/.test(part)) return <span key={`${prefix}s${w}`}>{part}</span>
    return (
      <span className="word" key={`${prefix}w${w}`}>
        {part.split('').map((ch, i) => (
          <span className="char" key={`${prefix}w${w}-${i}`}>{ch}</span>
        ))}
      </span>
    )
  })
}

export default function Hero() {
  const [displayed, setDisplayed] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imgRef     = useRef<HTMLImageElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const h1Ref      = useRef<HTMLHeadingElement>(null)

  // Glyph-glitch overlay
  const glitchRef  = useRef<HTMLDivElement>(null)
  const glitchARef = useRef<HTMLSpanElement>(null)
  const glitchBRef = useRef<HTMLSpanElement>(null)

  // Live array of ALL .char spans in the section — rebuilt whenever displayed changes
  const charElsRef    = useRef<HTMLSpanElement[]>([])
  // Which .char span is the cursor currently over (null = none)
  const currentCharRef = useRef<HTMLSpanElement | null>(null)

  // Mouse parallax
  const mouseTargetX  = useRef(0)
  const mouseTargetY  = useRef(0)
  const mouseCurrentX = useRef(0)
  const mouseCurrentY = useRef(0)
  const scrollYRef    = useRef(0)
  const rafRef        = useRef<number>(0)

  // ── Re-collect all .char spans every time the typing line changes.
  //    Also hide the overlay only if the char the cursor was over just disappeared
  //    (i.e. the typewriter deleted a char the cursor was resting on).
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    charElsRef.current = Array.from(section.querySelectorAll<HTMLSpanElement>('.char'))

    // If the currently tracked span is no longer in the DOM (typewriter deleted it), clear the overlay
    if (
      currentCharRef.current &&
      !charElsRef.current.includes(currentCharRef.current)
    ) {
      if (glitchRef.current) glitchRef.current.style.display = 'none'
      document.documentElement.style.removeProperty('--cursor-size')
      currentCharRef.current = null
    }
  }, [displayed])

  useEffect(() => {
    // ── Typewriter ──────────────────────────────────────────────────
    let phraseIdx = 0
    let charIdx   = 0
    let deleting  = false

    function tick() {
      const phrase = TYPE_WORDS[phraseIdx]
      if (!deleting) {
        charIdx++
        setDisplayed(phrase.slice(0, charIdx))
        if (charIdx === phrase.length) {
          timeoutRef.current = setTimeout(() => { deleting = true; tick() }, PAUSE_END)
          return
        }
        timeoutRef.current = setTimeout(tick, TYPE_SPEED)
      } else {
        charIdx--
        setDisplayed(phrase.slice(0, charIdx))
        if (charIdx === 0) {
          deleting  = false
          phraseIdx = (phraseIdx + 1) % TYPE_WORDS.length
          timeoutRef.current = setTimeout(tick, PAUSE_NEXT)
          return
        }
        timeoutRef.current = setTimeout(tick, DELETE_SPEED)
      }
    }

    // ── Scroll parallax ─────────────────────────────────────────────
    function onScroll() { scrollYRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Mouse: parallax + glyph-glitch overlay ───────────────────────
    function onMouseMove(e: MouseEvent) {
      const section = sectionRef.current
      if (!section) return

      // Image parallax
      const rect = section.getBoundingClientRect()
      mouseTargetX.current = ((e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)) * MOUSE_X_FACTOR
      mouseTargetY.current = ((e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)) * MOUSE_Y_FACTOR

      // Hit-test: find whichever .char span the cursor is inside
      let found: HTMLSpanElement | null = null
      for (const span of charElsRef.current) {
        const cr = span.getBoundingClientRect()
        if (
          e.clientX >= cr.left && e.clientX <= cr.right &&
          e.clientY >= cr.top  && e.clientY <= cr.bottom
        ) {
          found = span
          break
        }
      }

      const glitch = glitchRef.current
      const gA     = glitchARef.current
      const gB     = glitchBRef.current

      if (found && glitch && gA && gB) {
        const cr = found.getBoundingClientRect()
        const ch = found.textContent ?? ''

        // Match overlay font to the hovered element's actual computed style so the
        // glitch glyph sits pixel-identically over the real character regardless of
        // which text element it belongs to (h1, kicker, type-line, lede).
        const cs = getComputedStyle(found)
        glitch.style.fontFamily    = cs.fontFamily
        glitch.style.fontSize      = cs.fontSize
        glitch.style.fontWeight    = cs.fontWeight
        glitch.style.fontStretch   = cs.fontStretch
        glitch.style.letterSpacing = cs.letterSpacing

        // Stamp overlay exactly over the character's bounding box
        glitch.style.display = 'flex'
        glitch.style.left    = `${cr.left}px`
        glitch.style.top     = `${cr.top}px`
        glitch.style.width   = `${cr.width}px`
        glitch.style.height  = `${cr.height}px`

        if (gA.textContent !== ch) gA.textContent = ch
        if (gB.textContent !== ch) gB.textContent = ch

        // Shrink cursor to the character's rendered height, but never larger than
        // the default — so large headline letters don't expand it, only small ones shrink it.
        const size = Math.max(8, Math.min(CURSOR_DEFAULT, Math.round(cr.height)))
        document.documentElement.style.setProperty('--cursor-size', `${size}px`)

        currentCharRef.current = found
      } else {
        if (glitch) glitch.style.display = 'none'
        currentCharRef.current = null
        document.documentElement.style.removeProperty('--cursor-size')
      }
    }

    function onMouseLeave() {
      mouseTargetX.current = 0
      mouseTargetY.current = 0
      if (glitchRef.current) glitchRef.current.style.display = 'none'
      currentCharRef.current = null
      document.documentElement.style.removeProperty('--cursor-size')
    }

    const section = sectionRef.current
    if (section) {
      section.addEventListener('mousemove', onMouseMove)
      section.addEventListener('mouseleave', onMouseLeave)
    }

    // ── RAF: smooth parallax on image ────────────────────────────────
    function animate() {
      mouseCurrentX.current += (mouseTargetX.current - mouseCurrentX.current) * 0.08
      mouseCurrentY.current += (mouseTargetY.current - mouseCurrentY.current) * 0.08
      if (imgRef.current) {
        imgRef.current.style.transform = `translate(${mouseCurrentX.current}px, ${
          scrollYRef.current * 0.28 + mouseCurrentY.current
        }px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    timeoutRef.current = setTimeout(tick, 1200)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
      document.documentElement.style.removeProperty('--cursor-size')
      if (section) {
        section.removeEventListener('mousemove', onMouseMove)
        section.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }, [])

  return (
    <section id="hero" className="hero" ref={sectionRef}>

      {/*
        Glyph-glitch overlay — fixed, invisible by default.
        On mousemove: repositioned to whichever .char span the cursor is inside,
        font styles copied from that element's getComputedStyle so it sits pixel-
        identically over the real glyph regardless of which text element it belongs to.
        Two clip-path animations (0.56s / 0.42s, steps(2)) that never sync → torn look.
      */}
      <div ref={glitchRef} className="glyph-glitch" aria-hidden="true">
        <span ref={glitchARef} className="glyph-glitch-a" />
        <span ref={glitchBRef} className="glyph-glitch-b" />
      </div>

      {/* Photo column */}
      <div className="hero-photo">
        <div className="media-stage is-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src="/images/sanath-full.jpeg"
            alt="N. T. Sanath Jeason, cybersecurity consultant"
            loading="eager"
            decoding="async"
            style={{ willChange: 'transform' }}
          />
          <div className="media-veil" aria-hidden="true" />
        </div>
      </div>

      {/* Copy column */}
      <div className="hero-copy">
        <div className="hero-copy-main">

          {/* ── h1: chars split so each letter is a .char for hit-testing ── */}
          <h1 className="display display-xl" ref={h1Ref}>
            <span className="clip"><span className="block">{splitChars(WORD_A, 'a')}</span></span>
            <span className="clip"><span className="block">{splitChars(WORD_B, 'b')}</span></span>
          </h1>

          {/* ── Kicker: each non-space char is a .char span ── */}
          <p
            className="kicker hero-kicker"
            aria-label={KICKER_TEXT}
          >
            {splitTextChars(KICKER_TEXT, 'k')}
          </p>

          {/* ── Typing line ── */}
          <p
            className="type-line display display-sm"
            aria-label={`I SECURE ${TYPE_WORDS.join(', ')}`}
          >
            {/* Invisible sizer keeps the container wide enough for the longest word */}
            <span className="type-line-sizer" aria-hidden="true">
              {TYPE_WORDS.map(w => <span key={w}>I SECURE {w}</span>)}
            </span>
            {/* Live text: static prefix + typewriter output, each char glitch-able */}
            <span className="type-line-live" aria-hidden="true">
              {splitTextChars(TYPE_PREFIX, 'pfx')}
              {splitTextChars(displayed, 'd')}
              <span className="caret" />
            </span>
          </p>

          {/* ── Lede: each non-space char is a .char span ── */}
          <p
            className="hero-lede"
            aria-label={LEDE_TEXT}
          >
            {splitTextChars(LEDE_TEXT, 'l')}
          </p>

        </div>

        <a href="#scale" className="hero-scroll kicker">
          <span>Scroll the story</span>
          <span className="scroll-icon" aria-hidden="true">
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
              <path d="M5 1v11M1 9l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  )
}
