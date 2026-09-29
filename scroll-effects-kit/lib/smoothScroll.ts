"use client";

/**
 * Wires Lenis (smooth-scroll) into GSAP's ScrollTrigger so pinned/scrubbed
 * animations read the eased scroll position instead of the raw, jumpy native
 * scroll. Call `useSmoothScroll()` once near the root of your page (e.g. in
 * app/layout.tsx's client wrapper, or the top-level page component).
 *
 * This is the piece that makes every pinned section elsewhere in this kit
 * feel "smoothed" rather than scroll-jacked/jittery.
 */
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Every Lenis scroll tick, tell ScrollTrigger to re-check pinned/scrubbed
    // animations against the new (eased) scroll position.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's own ticker instead of a separate rAF loop, so
    // both stay perfectly in sync (this is the standard Lenis+GSAP recipe).
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(ScrollTrigger.update as any);
    };
  }, []);
}

/**
 * Small helper used by every pinned component in this kit: returns 0..1
 * scroll progress through a given element's own scrollable range, updated on
 * every scroll tick via a GSAP ScrollTrigger instance. This mirrors the
 * `progress = clamp((viewportTop - containerTop) / (containerHeight - viewportHeight), 0, 1)`
 * formula manually, but lets ScrollTrigger do the math and rAF batching.
 */
export function pinAndTrackProgress(
  triggerEl: Element,
  opts: {
    start?: string; // default "top top"
    end: string; // e.g. "+=3000" or "bottom bottom"
    onUpdate: (progress: number) => void;
    pin?: boolean; // default true
    pinSpacing?: boolean; // default true
  }
) {
  return ScrollTrigger.create({
    trigger: triggerEl,
    start: opts.start ?? "top top",
    end: opts.end,
    pin: opts.pin ?? true,
    pinSpacing: opts.pinSpacing ?? true,
    scrub: true, // ties progress directly to scroll position, no easing lag
    onUpdate: (self) => opts.onUpdate(self.progress),
  });
}
