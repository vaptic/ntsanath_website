"use client";

/**
 * Scene 04 in the video: "ACROSS INDUSTRIES" (or whatever you call it)
 * ----------------------------------------------------------------------
 * A single full-bleed <video> that never plays on its own — scrolling
 * "scrubs" its playhead directly (video.currentTime = progress * duration),
 * so the footage always tracks the exact scroll position, forwards and
 * backwards, like a physical film reel under your thumb. A poster image
 * covers the first paint before the video's metadata loads. Alongside it, a
 * label crossfades between industry names and a "0X / N" counter updates in
 * discrete steps.
 *
 * Two behaviors layered together:
 *   1. Continuous: video.currentTime tracks scroll progress every frame —
 *      this is what makes it feel "scrubbed" rather than "playing".
 *   2. Discrete: the *name* and *counter* don't crossfade continuously —
 *      they snap to whichever of N equal segments the continuous progress
 *      falls into (same floor(progress * N) pattern as the other sections),
 *      with a short opacity transition on change.
 */
import { useEffect, useRef, useState } from "react";
import { pinAndTrackProgress } from "../lib/smoothScroll";

// ---- PLACEHOLDER_INDUSTRIES: swap in your own sectors + a video/poster ----
const INDUSTRIES = [
  "Healthcare", "Banking & NBFC", "Insurance", "Payments & Fintech",
  "Government", "Education",
];

const VIDEO_SRC = "/media/industries-scrub.mp4"; // one video whose timeline maps to all industries
const POSTER_SRC = "/media/industries-poster.jpg";

export default function IndustryScrubCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const durationRef = useRef(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => { durationRef.current = v.duration; };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // fall back to the poster frame + first industry name, no scrub

    const trigger = pinAndTrackProgress(sectionRef.current, {
      end: "+=6000", // longer runway since this section covers many segments
      onUpdate: (progress) => {
        const v = videoRef.current;
        if (v && durationRef.current) {
          v.currentTime = progress * durationRef.current;
        }
        const idx = Math.min(INDUSTRIES.length - 1, Math.floor(progress * INDUSTRIES.length));
        setIndex(idx);
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <div ref={sectionRef} style={{ height: "100vh", position: "relative", background: "#000", overflow: "hidden" }}>
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        playsInline
        muted
        preload="auto"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 40%)" }} />
      <div style={{ position: "absolute", left: "6vw", bottom: "8vh", color: "#fff" }}>
        <h3
          key={index} // remounts on change so the fade-in restarts cleanly
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 800, animation: "industryFadeIn 0.5s ease" }}
        >
          {INDUSTRIES[index]}
        </h3>
        <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.15em", opacity: 0.75 }}>
          {String(index + 1).padStart(2, "0")} / {String(INDUSTRIES.length).padStart(2, "0")}
        </p>
      </div>
      <style>{`
        @keyframes industryFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
