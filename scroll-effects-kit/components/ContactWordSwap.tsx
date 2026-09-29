"use client";

/**
 * Scene 07 in the video: contact headline word-swap
 * -----------------------------------------------------
 * "What should we build ~~next~~ now?" — the old word gets a strike-through
 * line that draws across it left-to-right, then the replacement word fades
 * in right after. Two elements stacked on the old word (the word itself, and
 * an absolutely-positioned line sitting on top of it), plus a separate span
 * for the new word that starts invisible.
 *
 * Sequence, triggered once when the section scrolls into view:
 *   1. t=0ms:   old word already visible (rendered from the start)
 *   2. t=0ms:   the strike line animates width 0% -> 100% over ~500ms
 *   3. t=450ms: the new word fades/slides in right after the strike lands
 */
import { useEffect, useRef, useState } from "react";

export default function ContactWordSwap({
  oldWord = "next",
  newWord = "now",
}: {
  oldWord?: string;
  newWord?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [struck, setStruck] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setStruck(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStruck(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <h2 ref={ref} style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", fontWeight: 800, color: "#fff" }}>
      What should we
      <br />
      build{" "}
      <span style={{ position: "relative", display: "inline-block" }}>
        {oldWord}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            height: 3,
            background: "#fff",
            width: struck ? "100%" : "0%",
            transition: "width 0.5s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        />
      </span>
      <span
        style={{
          marginLeft: "0.3em",
          opacity: struck ? 1 : 0,
          transform: struck ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease 0.45s, transform 0.4s ease 0.45s",
          display: "inline-block",
        }}
      >
        {newWord}
      </span>
      ?
    </h2>
  );
}
