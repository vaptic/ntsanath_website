# Scroll-effects kit — code for what's in the video

This is a working implementation of the mechanics shown in your recording, mapped to generic
components you can drop into your own Next.js project and re-skin with your own numbers,
labels, photos, and case studies. Nothing here contains Jeffrey Milanes' name, copy, or images —
every label ("API Gateway", "Backend", "Think/Design/Build") is a generic technical term, used the
same way any architecture diagram would.

## What's in the video, mapped to files

| What you see on screen | Section id on the reference | File here |
|---|---|---|
| Big number that scrambles through random digits then lands on a value ("0 → 1 → 7751 → 4965 → 72 → 806K → 1M+"), while a node-diagram beside it lights up more nodes/paths as you scroll | `#story` / `.scale-pin` | `components/JourneyStats.tsx` |
| A cloud of particles that silently reshapes (diamond → triangle → other silhouettes) as you scroll past 5 pinned "beats" (Think/Design/Build/Ship/Evolve) | `#craft` / `.craft-sticky` canvas | `components/ProcessParticles.tsx` |
| A full-bleed video that doesn't *play* on its own timeline — scrubbing your mouse wheel scrubs the video's playhead, while a name/counter crossfades | `#domains` / `.domains-pin` | `components/IndustryScrubCarousel.tsx` |
| Case-study rows whose photo unmasks (clip-path) and text blocks stagger in as they cross into view | `#work` / `.work-item` | `components/CaseStudyReveal.tsx` |
| Contact headline where one word gets struck through and swapped for another on scroll/hover | `#contact` / `.build-next` | `components/ContactWordSwap.tsx` |

## Install

```bash
npm install gsap lenis
```

(`lenis` replaces the older `@studio-freight/lenis` package name — same library, smooth-scroll only.
Three.js's particle system in `ProcessParticles.tsx` is plain `three`, already a peer of most
Next.js/Three setups — `npm install three` and `@types/three` if you're on TypeScript.)

## Global wiring

1. Wrap your page in Lenis for smooth scrolling — GSAP's `ScrollTrigger` needs to know Lenis is
   driving the scroll instead of the native scrollbar. See `lib/smoothScroll.ts`.
2. Every pinned section below is built the same way structurally: a tall **spacer** div
   (`min-height: N vh`) containing a `position: sticky; top: 0; height: 100vh` panel. GSAP's
   `ScrollTrigger` with `pin: true` can also generate this spacer for you automatically — both
   approaches are included; pick one and stay consistent.
3. `prefers-reduced-motion`: every component below checks
   `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and, if true, skips pinning/
   animation and renders the final state immediately. Don't strip this out — it's an accessibility
   requirement, not decoration.

## Content you fill in

Everywhere you see `PLACEHOLDER_` in the code is where your real content goes: your pipeline stage
labels and thresholds, your particle-shape keyframes, your case studies, your industries/photos,
your contact headline words. The mechanics don't change — only the arrays of data at the top of
each file do.
