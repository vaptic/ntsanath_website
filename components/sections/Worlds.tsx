'use client'

import { useEffect, useRef } from 'react'

export default function Worlds() {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    function onScroll() {
      const img = imgRef.current
      if (!img) return
      const rect   = img.parentElement!.getBoundingClientRect()
      const winH   = window.innerHeight
      const pct    = (winH - rect.top) / (winH + rect.height)
      const offset = (pct - 0.5) * -60
      img.style.transform = `translateY(${offset}px) scale(1.12)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="worlds" className="worlds">
      {/* Full-bleed photo with parallax + veil */}
      <div className="worlds-media">
        {/* Film-reel SVG shown while image loads, hidden once loaded */}
        <div className="media-loader" aria-hidden="true">
          <svg className="media-loader-reel" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="50" r="3"  fill="currentColor" />
            <circle cx="50" cy="22" r="7"  stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="50" cy="78" r="7"  stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="22" cy="50" r="7"  stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="78" cy="50" r="7"  stroke="currentColor" strokeWidth="2" opacity="0.6" />
          </svg>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/images/sanath-full.jpeg"
          alt=""
          aria-hidden="true"
          style={{ transform: 'scale(1.12)' }}
          onLoad={e => (e.currentTarget.closest('.worlds-media')?.classList.add('is-loaded'))}
        />
        <div className="worlds-veil" aria-hidden="true" />
      </div>

      {/* Copy */}
      <div className="worlds-copy">
        <p className="kicker worlds-kicker">Off the clock</p>
        <h2 className="display display-md worlds-h2">
          Sometimes I compete.<br />Capture. Conquer.
        </h2>
        <p className="worlds-body">
          CTF competitions, photography, and music production. A different
          kind of adversarial thinking.
        </p>
      </div>
    </section>
  )
}
