'use client'

import { useEffect, useRef, useState } from 'react'

const BEATS = [
  {
    id: 'recon',
    num: '01',
    title: 'Recon',
    body: 'Understand the target. Map the perimeter. Enumerate services, subdomains, and exposed interfaces.',
    cmd: '$ mapping the attack surface before a single packet',
  },
  {
    id: 'model',
    num: '02',
    title: 'Model',
    body: 'Identify adversaries, attack vectors, and business-critical assets. STRIDE + CVSS + MITRE ATT&CK.',
    cmd: '$ identifying threat actors, vectors, and business risk',
  },
  {
    id: 'exploit',
    num: '03',
    title: 'Exploit',
    body: 'Controlled exploitation to demonstrate real impact. Web, API, network, cloud, AD, mobile.',
    cmd: '$ controlled exploitation — proof, not speculation',
  },
  {
    id: 'report',
    num: '04',
    title: 'Report',
    body: 'Executive and technical reports. Risk-ranked findings with reproduction steps and remediation guidance.',
    cmd: '$ evidence-based findings, severity-ranked, reproducible',
  },
  {
    id: 'remediate',
    num: '05',
    title: 'Remediate',
    body: 'Re-test every fix. Close every finding. Compliance-mapped. Audit-ready.',
    cmd: '$ verify every fix. retest. close the loop.',
  },
]

export default function Craft() {
  const [activeIdx, setActiveIdx] = useState(0)
  const beatRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    beatRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              el.classList.add('is-on')
              setActiveIdx(i)
            } else {
              el.classList.remove('is-on')
            }
          })
        },
        { threshold: 0.5 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <section id="craft" className="craft">
      {/* Sticky left panel */}
      <div className="craft-sticky">
        <div className="craft-icon-wrap" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="12" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12V9a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="14" cy="19" r="2" fill="currentColor" />
            <line x1="14" y1="21" x2="14" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div>
          <p className="kicker craft-sticky-kicker">The Methodology</p>
          <h2>How I<br />Work</h2>
        </div>

        <div className="terminal" aria-label="Current step">
          <span className="terminal-prompt">{BEATS[activeIdx].cmd}</span>
        </div>
      </div>

      {/* Scrolling beats */}
      <div className="craft-beats">
        {BEATS.map((beat, i) => (
          <div
            key={beat.id}
            className="craft-beat"
            ref={el => { beatRefs.current[i] = el }}
          >
            <div className="craft-beat-num">{beat.num} / {BEATS.length.toString().padStart(2, '0')}</div>
            <div className="craft-beat-title display display-md">{beat.title}</div>
            <p className="craft-beat-body">{beat.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
