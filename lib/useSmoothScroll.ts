'use client'

/**
 * Wires Lenis (smooth scroll) into GSAP's ScrollTrigger so the pinned/scrubbed
 * scenes read an eased scroll position instead of the raw, stepped native one.
 *
 * Without this, `scrub` fights the browser's own wheel quantisation and the
 * Scene 02 counter/diagram advance in visible jumps. With it, they glide —
 * this is the single biggest contributor to the "filmic" feel of the reference.
 *
 * Skipped entirely under prefers-reduced-motion, matching how the rest of the
 * site degrades (the SVG still renders in its final state).
 */
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Touch devices keep native scrolling — momentum scrolling plus Lenis feels wrong.
    if (window.matchMedia('(pointer: coarse)').matches) return

    const lenis = new Lenis({
      duration: 1.2,
      wheelMultiplier: 0.78,
      smoothWheel: true,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}
