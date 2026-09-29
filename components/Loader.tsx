'use client'

import { useEffect, useRef } from 'react'

const LINES = [
  { label: 'RECON',       status: '· · · · READY' },
  { label: 'THREAT MODEL', status: '· · · · READY' },
  { label: 'EXPLOITATION', status: '· · · · READY' },
  { label: 'REPORTING',   status: '· · · · READY' },
  { label: 'REMEDIATION', status: '· · · · READY' },
]

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export default function Loader() {
  const loaderRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    async function boot() {
      await delay(400)
      for (let i = 0; i < LINES.length; i++) {
        if (i > 0) await delay(300)
        lineRefs.current[i]?.classList.add('is-visible')
        await delay(80)
      }
      await delay(800)
      const loader = loaderRef.current
      if (loader) {
        loader.classList.add('is-done')
        loader.addEventListener('transitionend', () => {
          loader.style.display = 'none'
        }, { once: true })
      }
    }
    boot()
  }, [])

  return (
    <div className="loader" ref={loaderRef} role="status" aria-label="Loading">
      <div className="loader-inner">
        {LINES.map((line, i) => (
          <div
            key={line.label}
            className="loader-line"
            ref={el => { lineRefs.current[i] = el }}
          >
            <span>{line.label}</span>
            <span>{line.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
