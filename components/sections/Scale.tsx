'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Each stage names where you are in the story, then says it in one line —
// the reference's narration device (◇ BUILD / "Define the problem.").
const STAGES = [
  { stage: 'Start',    copy: '2012. First role at Wipro. Learning to think like an adversary.' },
  { stage: 'Operate',  copy: 'Enterprise security operations. Internal audits. Network assessments.' },
  { stage: 'Scale',    copy: 'Adecco Group. Multi-national clients. Cloud and AD security.' },
  { stage: 'Build',    copy: 'OffSys Labs Pvt Ltd. Building a full-service security practice.' },
  { stage: 'Depth',    copy: '500+ engagements. BFSI, healthcare, government, technology.' },
  { stage: 'Standard', copy: 'Zero major audit findings. 100+ clients. Six industries.' },
]

const LAYER_AT  = [0.05, 0.11, 0.33, 0.54, 0.75, 0.92]
const MAX = 500

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K'
  return String(n)
}

// Build the counter's inner markup as word/char spans so the glyph-glitch
// hover overlay can still measure a single digit. Written imperatively each
// frame (see the RAF smoother) instead of through React state, so the number
// glides continuously the way jeffmilanes' counter does.
function numHTML(str: string): string {
  const chars = str.split('').map(c => `<span class="char">${c}</span>`).join('')
  return `<span class="word">${chars}</span>`
}

// ── Same per-character split helper as Hero (Scene 01) ────────────────────────
// Non-space characters become .char spans eligible for the glyph-glitch overlay;
// spaces are plain spans so word-wrap still works normally.
function splitTextChars(text: string, prefix: string) {
  // Split on words FIRST, then on characters inside each word.
  //
  // Why: .char is display:inline-block so the glyph-glitch overlay can measure a
  // single letter. But a run of inline-blocks is breakable between any two of
  // them, so the browser was wrapping mid-word ("like a / n adversary").
  // Wrapping each word in an inline-block, nowrap span keeps per-letter boxes
  // while making the word itself the smallest breakable unit.
  const parts = text.split(/(\s+)/)   // keep the whitespace runs as their own entries
  return parts.map((part, w) => {
    if (part === '' ) return null
    if (/^\s+$/.test(part)) return <span key={`${prefix}-s-${w}`}>{part}</span>
    return (
      <span className="word" key={`${prefix}-w-${w}`}>
        {part.split('').map((ch, i) => (
          <span className="char" key={`${prefix}-w-${w}-${i}`}>{ch}</span>
        ))}
      </span>
    )
  })
}

const LAYER_LABELS = [
  { label: 'Perimeter',   y: 70  },
  { label: 'Gateway',     y: 160 },
  { label: 'Application', y: 250 },
  { label: 'Data',        y: 340 },
  { label: 'Storage',     y: 430 },
  { label: 'Cloud',       y: 510 },
]

// Chip half-width derived from the label so uppercase + wide tracking never overflows.
// (mono ~9.5px + 0.16em tracking ≈ 9.2px per char, so half-width = 4.6 * len, + 18 for dot/padding)
const hwFor = (label: string) => 4.6 * label.length + 18

const NODES = [
  { id: 'web',      label: 'Web',      x: 290, y: 70, layer: 0, hot: false },
  { id: 'mobile',   label: 'Mobile',   x: 450, y: 70,  layer: 0, hot: false },
  { id: 'network',  label: 'Network',  x: 610, y: 70, layer: 0, hot: true  },
  { id: 'firewall', label: 'Firewall', x: 450, y: 160,  layer: 1, hot: true  },
  { id: 'api',      label: 'API',      x: 290, y: 250, layer: 2, hot: true  },
  { id: 'services', label: 'Services', x: 450, y: 250, layer: 2, hot: false },
  { id: 'auth',     label: 'Auth',     x: 610, y: 250,  layer: 2, hot: false },
  { id: 'data',     label: 'Data',     x: 450, y: 340,    layer: 3, hot: true  },
  { id: 'cache',    label: 'Cache',    x: 290, y: 430, layer: 4, hot: false },
  { id: 'secrets',  label: 'Secrets',  x: 450, y: 430, layer: 4, hot: true  },
  { id: 'storage',  label: 'Storage',  x: 610, y: 430, layer: 4, hot: false },
  { id: 'cloud',    label: 'Cloud',    x: 450, y: 510, layer: 5, hot: true  },
]

const EDGES = [
  { id: 'e-web-fw',      d: 'M 290 91 C 362 91, 378 139, 450 139',    to: 1 },
  { id: 'e-mob-fw',      d: 'M 450 91 C 490 91, 410 139, 450 139',    to: 1 },
  { id: 'e-net-fw',      d: 'M 610 91 C 682 91, 378 139, 450 139',    to: 1 },
  { id: 'e-fw-api',      d: 'M 450 181 C 522 181, 218 229, 290 229',  to: 2 },
  { id: 'e-fw-svc',      d: 'M 450 181 C 490 181, 410 229, 450 229',  to: 2 },
  { id: 'e-fw-auth',     d: 'M 450 181 C 522 181, 538 229, 610 229',  to: 2 },
  { id: 'e-api-data',    d: 'M 290 271 C 362 271, 378 319, 450 319',  to: 3 },
  { id: 'e-svc-data',    d: 'M 450 271 C 490 271, 410 319, 450 319',  to: 3 },
  { id: 'e-auth-data',   d: 'M 610 271 C 682 271, 378 319, 450 319',  to: 3 },
  { id: 'e-data-cache',  d: 'M 450 361 C 522 361, 218 409, 290 409',  to: 4 },
  { id: 'e-data-sec',    d: 'M 450 361 C 490 361, 410 409, 450 409',  to: 4 },
  { id: 'e-data-stor',   d: 'M 450 361 C 522 361, 538 409, 610 409',  to: 4 },
  { id: 'e-cache-cloud', d: 'M 290 451 C 362 451, 378 489, 450 489',  to: 5 },
  { id: 'e-sec-cloud',   d: 'M 450 451 C 490 451, 410 489, 450 489',  to: 5 },
  { id: 'e-stor-cloud',  d: 'M 610 451 C 682 451, 378 489, 450 489',  to: 5 },
]

export default function Scale() {
  const wrapRef    = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Refs to the imperatively-created glyph-glitch overlay (appended to <body>)
  const glitchRef = useRef<HTMLDivElement | null>(null)
  const gARef     = useRef<HTMLSpanElement | null>(null)
  const gBRef     = useRef<HTMLSpanElement | null>(null)

  // Ref to the counter <p> — handled separately with mousemove
  const numRef = useRef<HTMLParagraphElement>(null)

  const [stageIdx, setStageIdx] = useState(0)
  const [svgP, setSvgP] = useState(0)
  const prevIdxRef = useRef(0)

  // ── Counter smoothing (filmic count, jeffmilanes-style) ──
  // The scroll drives a TARGET; a RAF loop eases the DISPLAYED value toward it
  // each frame and writes it straight to the DOM. No React re-render per digit,
  // and the number glides instead of snapping across uneven stops.
  const numTargetRef = useRef(0)   // scroll progress 0..1 (target)
  const numDispRef   = useRef(0)   // eased, displayed progress
  const numStrRef    = useRef('')  // last string rendered

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Glyph-glitch overlay: appended directly to <body> ─────────────────────
    // Placing it on <body> guarantees position:fixed is relative to the viewport
    // with no ancestor containing-block or stacking-context interference.
    const glitch = document.createElement('div')
    glitch.className = 'glyph-glitch'
    glitch.setAttribute('aria-hidden', 'true')
    const gA = document.createElement('span')
    gA.className = 'glyph-glitch-a'
    const gB = document.createElement('span')
    gB.className = 'glyph-glitch-b'
    glitch.appendChild(gA)
    glitch.appendChild(gB)
    document.body.appendChild(glitch)
    glitchRef.current = glitch
    gARef.current     = gA
    gBRef.current     = gB

    if (prefersReducedMotion) {
      setSvgP(1)
      setStageIdx(STAGES.length - 1)
      numTargetRef.current = 1
      numDispRef.current = 1
      numStrRef.current = `${MAX}+`
      if (numRef.current) numRef.current.innerHTML = numHTML(`${MAX}+`)
      return () => {
        document.body.removeChild(glitch)
        glitchRef.current = null
      }
    }

    const el = wrapRef.current
    if (!el) return () => {
      document.body.removeChild(glitch)
      glitchRef.current = null
    }

    // ── ScrollTrigger ─────────────────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress
        setSvgP(p)
        numTargetRef.current = p
        const idx = Math.min(Math.round(p * (STAGES.length - 1)), STAGES.length - 1)
        if (idx !== prevIdxRef.current) {
          prevIdxRef.current = idx
          setStageIdx(idx)
        }
      },
    })

    // ── Filmic counter: ease displayed value toward the scroll target ─────────
    // 0.14 lerp per frame = a gentle trailing glide (same trick as the cursor
    // ring). Rebuild the digit spans only when the formatted string changes.
    let rafNum = 0
    const renderNum = () => {
      const target = numTargetRef.current
      numDispRef.current += (target - numDispRef.current) * 0.14
      if (Math.abs(target - numDispRef.current) < 0.0015) numDispRef.current = target
      const n = Math.round(numDispRef.current * MAX)
      const str = n >= MAX ? `${MAX}+` : formatCount(n)
      if (str !== numStrRef.current && numRef.current) {
        numStrRef.current = str
        numRef.current.innerHTML = numHTML(str)
      }
      rafNum = requestAnimationFrame(renderNum)
    }
    rafNum = requestAnimationFrame(renderNum)

    // ── Glyph-glitch: ONE section-level mousemove hit-test (ported from Scene 01) ─
    // Scene 02's text is highly dynamic — the counter is rewritten every frame and
    // the stage/copy remount on each stage change — so per-element listeners go
    // stale (which is why the old mouseenter version silently stopped firing).
    // Hit-testing a fresh character list on every mousemove is robust and covers
    // the copy, kicker, stage, counter digits AND the SVG node/layer labels.
    const section = sectionRef.current

    const showGlitch = (target: Element, ch: string, fontSrc: Element) => {
      const cr = target.getBoundingClientRect()
      const cs = getComputedStyle(fontSrc)
      glitch.style.fontFamily    = cs.fontFamily
      glitch.style.fontSize      = cs.fontSize
      glitch.style.fontWeight    = cs.fontWeight
      glitch.style.fontStretch   = cs.fontStretch
      glitch.style.letterSpacing = cs.letterSpacing
      glitch.style.display       = 'flex'
      glitch.style.left          = `${cr.left}px`
      glitch.style.top           = `${cr.top}px`
      glitch.style.width         = `${cr.width}px`
      glitch.style.height        = `${cr.height}px`
      if (gA.textContent !== ch) gA.textContent = ch
      if (gB.textContent !== ch) gB.textContent = ch
    }

    const onMove = (e: MouseEvent) => {
      if (!section) return
      const els = section.querySelectorAll<Element>('.char, .evolve-char, .evolve-layer-char')
      let found: Element | null = null
      for (const el of els) {
        const cr = el.getBoundingClientRect()
        if (cr.width === 0 || cr.height === 0) continue
        if (e.clientX >= cr.left && e.clientX <= cr.right &&
            e.clientY >= cr.top  && e.clientY <= cr.bottom) {
          found = el
          break
        }
      }
      if (found) {
        const isSvg = found.namespaceURI === 'http://www.w3.org/2000/svg'
        showGlitch(found, found.textContent ?? '', isSvg ? (found.parentElement ?? found) : found)
      } else {
        glitch.style.display = 'none'
      }
    }
    const onLeave = () => { glitch.style.display = 'none' }

    if (section) {
      section.addEventListener('mousemove', onMove)
      section.addEventListener('mouseleave', onLeave)
    }

    return () => {
      st.kill()
      cancelAnimationFrame(rafNum)
      if (section) {
        section.removeEventListener('mousemove', onMove)
        section.removeEventListener('mouseleave', onLeave)
      }
      document.body.removeChild(glitch)
      glitchRef.current = null
    }
  }, [])

  const s = STAGES[stageIdx]

  // is-hot: exactly one node — the layer with the highest LAYER_AT threshold crossed
  const hotLayerAt  = LAYER_AT.reduce((acc, at) => (svgP >= at && at > acc ? at : acc), -1)
  const hotLayerIdx = hotLayerAt === -1 ? -1 : LAYER_AT.indexOf(hotLayerAt)

  return (
    <section id="scale" ref={sectionRef}>

      <div className="scale-wrap" ref={wrapRef}>
        <div className="scale-pin">

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="scale-bg" aria-hidden="true">
            <img src="/images/sanath-full.jpeg" alt="" loading="lazy" decoding="async" />
          </div>

          {/* Left copy column */}
          <div className="scale-copy-col">
            <h2 id="scale-heading" className="sr-only">
              My experience: 12 years, 500+ engagements across six industries
            </h2>

            {/* Kicker — chars split for glitch */}
            <p className="kicker scale-kicker">
              {splitTextChars('The Journey', 'kicker')}
            </p>

            {/* Stage progress dots */}
            <div className="scale-stage-dots" aria-hidden="true">
              {STAGES.map((_, i) => (
                <span key={i} className={`scale-stage-dot${i <= stageIdx ? ' is-on' : ''}`} />
              ))}
            </div>

            {/* Counter — split into .char spans so each digit is glyph-glitch-able */}
            <p
              id="scale-value"
              ref={numRef}
              className="scale-num display display-xl"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              aria-label={`${MAX}+ engagements`}
            />

            {/* Unit label + stage name — the "where am I in the story" marker */}
            <p className="scale-unit">Engagements</p>
            <p className="scale-stage" key={`stage-${stageIdx}`}>
              {splitTextChars(s.stage, `stage-${stageIdx}`)}
            </p>

            {/* Stage copy text — .char spans enable glitch-on-hover same as Scene 01 */}
            <p className="scale-copy">
              {splitTextChars(s.copy, `copy-${stageIdx}`)}
            </p>

            {/* Proof line — .char spans */}
            <p className="scale-proof">
              {splitTextChars('500+ engagements · 100+ clients · 6 industries · 12 years', 'proof')}
            </p>
          </div>

          {/* Right — evolve SVG */}
          <div className="scale-system" aria-hidden="true">
            <svg
              viewBox="0 0 900 540"
              className="evolve"
              role="img"
              aria-label="Security attack surface, from perimeter to cloud"
            >
              <defs>
                <filter id="evolve-glow" x="-120%" y="-120%" width="340%" height="340%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="evolve-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Layer labels */}
              {LAYER_LABELS.map((ll) => (
                <text
                  key={ll.label}
                  x="34" y={ll.y}
                  dominantBaseline="central"
                  className="evolve-layer"
                >
                  {ll.label.split('').map((ch, ci) => (
                    <tspan key={ci} className="evolve-layer-char">{ch}</tspan>
                  ))}
                </text>
              ))}

              {/* Edges */}
              {EDGES.map(edge => {
                const atStart = LAYER_AT[edge.to - 1]
                const atEnd   = LAYER_AT[edge.to]
                const active  = svgP >= atEnd
                const drawing = svgP >= atStart
                const drawP   = !drawing ? 0 : Math.min(1, (svgP - atStart) / Math.max(atEnd - atStart, 0.001))
                const dashOff = 1 - drawP

                return (
                  <g key={edge.id}>
                    <path id={edge.id} d={edge.d} fill="none" stroke="transparent" />
                    <path d={edge.d} className="evolve-base" fill="none" />
                    <path
                      d={edge.d}
                      pathLength={1}
                      className={`evolve-link${active ? ' is-on' : ''}`}
                      fill="none"
                      style={{ strokeDashoffset: dashOff }}
                    />
                    <path
                      d={edge.d}
                      pathLength={1}
                      className={`evolve-flow${active ? ' is-on' : ''}`}
                      fill="none"
                    />
                    {active && (
                      <>
                        <circle r={2.6} fill="#ffffffcc" style={{ pointerEvents: 'none' }}>
                          <animateMotion dur="2.6s" repeatCount="indefinite" calcMode="linear">
                            <mpath href={`#${edge.id}`} />
                          </animateMotion>
                        </circle>
                        <circle r={2.2} fill="#ffffff55" style={{ pointerEvents: 'none' }}>
                          <animateMotion
                            dur="3.1s"
                            repeatCount="indefinite"
                            calcMode="linear"
                            keyPoints="1;0"
                            keyTimes="0;1"
                          >
                            <mpath href={`#${edge.id}`} />
                          </animateMotion>
                        </circle>
                      </>
                    )}
                  </g>
                )
              })}

              {/* Nodes — ghost at 0.3, fills to 1 on is-on */}
              {NODES.map(node => {
                const active = svgP >= LAYER_AT[node.layer]
                const isHot  = node.hot && node.layer === hotLayerIdx
                const cls    = `evolve-node${active ? ' is-on' : ''}${isHot ? ' is-hot' : ''}`
                const label  = node.label.toUpperCase()
                const hw     = hwFor(label)
                const dotCX  = -(hw - 16)

                return (
                  <g key={node.id} className={cls} transform={`translate(${node.x} ${node.y})`}>
                    <rect className="evolve-halo"
                      x={-hw} y={-20} width={hw * 2} height={40} rx={20} />
                    <rect className="evolve-chip"
                      x={-hw} y={-20} width={hw * 2} height={40} rx={20} />
                    <circle className="evolve-dot" cx={dotCX} r={3.2} />
                    <text x={8} dominantBaseline="central" textAnchor="middle">
                      {label.split('').map((ch, i) => (
                        <tspan key={i} className="evolve-char">{ch}</tspan>
                      ))}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

        </div>
      </div>
    </section>
  )
}
