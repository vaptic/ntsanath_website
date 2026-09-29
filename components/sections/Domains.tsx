'use client'

import { useEffect, useRef, useState } from 'react'

const INDUSTRIES = [
  { name: 'BFSI',          sub: 'Banking & Insurance',                   tint: 'rgba(0,30,60,.5)' },
  { name: 'Healthcare',    sub: 'Hospitals & HealthTech',                 tint: 'rgba(0,50,30,.5)' },
  { name: 'E-Commerce',    sub: 'Retail & Digital Commerce',              tint: 'rgba(50,15,0,.5)' },
  { name: 'Government',    sub: 'Public Sector & Critical Infrastructure', tint: 'rgba(20,0,50,.5)' },
  { name: 'Manufacturing', sub: 'Industry 4.0 & OT/ICS',                 tint: 'rgba(35,30,0,.5)' },
  { name: 'Education',     sub: 'EdTech & Universities',                  tint: 'rgba(0,25,45,.5)' },
]

export default function Domains() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [nameKey, setNameKey] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    function onScroll() {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const sectionH = el.offsetHeight - window.innerHeight
      const scrolled = Math.max(0, -rect.top)
      const progress = Math.min(1, scrolled / sectionH)
      const idx = Math.min(Math.floor(progress * INDUSTRIES.length), INDUSTRIES.length - 1)

      if (idx !== prevRef.current) {
        prevRef.current = idx
        setActive(idx)
        setNameKey(k => k + 1)
        const ov = overlayRef.current
        if (ov) {
          ov.classList.remove('flash')
          void ov.offsetWidth
          ov.classList.add('flash')
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const ind = INDUSTRIES[active]

  return (
    <section id="domains" aria-label="Industries served">
      <div className="domains-wrap" ref={wrapRef}>
        <div className="domains-pin">
          <div className="domains-beat-overlay" ref={overlayRef} aria-hidden="true" />

          {/* Left: name + intro + list */}
          <div>
            <p className="kicker domains-kicker">Industries Secured</p>

            <div className="domains-current" key={nameKey}>
              <div className="domains-name">
                <span className="domains-name-inner">{ind.name}</span>
              </div>
              <p className="kicker" style={{ color: 'var(--g5)', marginTop: '.5rem' }}>{ind.sub}</p>
            </div>

            <div className="domains-intro-copy" style={{ marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--g5)', fontSize: '.9rem', lineHeight: '1.65', maxWidth: '30ch' }}>
                End-to-end penetration testing and security consulting across six critical industries.
              </p>
            </div>

            <ul className="domains-list" style={{ marginTop: '1.75rem' }} aria-label="All industries">
              {INDUSTRIES.map((ind2, i) => (
                <li key={ind2.name} className={`domains-list-item${i === active ? ' is-active' : ''}`}>
                  {ind2.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: photo frame */}
          <div>
            <div className="domains-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="domains-poster"
                src="/images/sanath-full.jpeg"
                alt=""
                aria-hidden="true"
              />
              <div className="domains-veil" aria-hidden="true" />
              <div
                className="domains-frame-tint"
                style={{ background: ind.tint }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
