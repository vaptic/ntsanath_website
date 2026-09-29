"use client";

/**
 * Scene 05 in the video: case-study rows
 * ----------------------------------------
 * Not pinned/scrubbed — a plain "reveal on scroll into view" pattern, but
 * with two distinct reveal styles layered:
 *   1. Text blocks (title, tagline, overview, each detail column) start
 *      translated down ~80px and invisible, then rise + fade in, staggered
 *      a few hundred ms apart so they arrive one after another rather than
 *      all at once.
 *   2. The photo starts "masked" — clip-path: inset(14% 7%) makes it look
 *      like a smaller framed image inset within its box — then animates to
 *      inset(0% 0%), so the photo appears to "unmask" outward to fill its
 *      full frame. That's a clip-path transition, not an opacity fade.
 *
 * Driven by a single IntersectionObserver per case-study item (not scroll
 * position math) — cheaper, and it naturally fires once per item as it
 * crosses ~20% into the viewport, matching how the reference plays it.
 */
import { useEffect, useRef, useState } from "react";

type CaseStudy = {
  index: string; // "01"
  name: string;
  tagline: string;
  photo: string;
  overview: string;
  scale?: { value: string; label: string }[];
  challenge: string;
  approach: string[];
  results: string[];
};

// ---- PLACEHOLDER_CASE_STUDIES: drop your own engagements/projects in here ----
const CASE_STUDIES: CaseStudy[] = [
  {
    index: "01",
    name: "Project name",
    tagline: "One-line hook describing the engagement.",
    photo: "/media/case-01.jpg",
    overview: "Two to four sentences of context: who the client is, what the product/system does, and the scale it operates at.",
    scale: [
      { value: "500+", label: "engagements delivered" },
      { value: "85%", label: "reduction in critical findings" },
      { value: "12+", label: "years of practice" },
    ],
    challenge: "What was broken, risky, or costly before the engagement.",
    approach: ["What you actually did, point one.", "What you actually did, point two."],
    results: ["Outcome one.", "Outcome two.", "Outcome three."],
  },
];

function useRevealOnView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // reveal once, don't re-hide on scroll back up
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RiseBlock({ visible, delayMs, children }: { visible: boolean; delayMs: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(80px)",
        transition: `opacity 0.7s ease ${delayMs}ms, transform 0.7s ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}

function CaseStudyItem({ item }: { item: CaseStudy }) {
  const { ref, visible } = useRevealOnView<HTMLElement>();

  return (
    <article ref={ref} style={{ marginBottom: "20vh" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
        <p aria-hidden style={{ fontSize: "2rem", fontWeight: 800, opacity: 0.4 }}>{item.index}</p>
        <div>
          <RiseBlock visible={visible} delayMs={0}>
            <h3 style={{ fontSize: "2.5rem", fontWeight: 800 }}>{item.name} ↗</h3>
          </RiseBlock>
          <RiseBlock visible={visible} delayMs={80}>
            <p style={{ opacity: 0.8 }}>{item.tagline}</p>
          </RiseBlock>
        </div>
      </div>

      {/* The "unmask" photo: clip-path inset shrinks to 0 on reveal, not opacity */}
      <div
        style={{
          marginTop: 24,
          clipPath: visible ? "inset(0% 0%)" : "inset(14% 7%)",
          transition: "clip-path 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
      >
        <img src={item.photo} alt="" style={{ width: "100%", display: "block", filter: "grayscale(1)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 32 }}>
        <RiseBlock visible={visible} delayMs={160}>
          <p style={{ maxWidth: 480 }}>{item.overview}</p>
        </RiseBlock>

        {item.scale && (
          <RiseBlock visible={visible} delayMs={240}>
            <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.6, marginBottom: 12 }}>OPERATING AT SCALE</p>
            <ul style={{ display: "flex", gap: 24, listStyle: "none", padding: 0 }}>
              {item.scale.map((s) => (
                <li key={s.label}>
                  <span style={{ display: "block", fontSize: "1.5rem", fontWeight: 800 }}>{s.value}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{s.label}</span>
                </li>
              ))}
            </ul>
          </RiseBlock>
        )}

        <RiseBlock visible={visible} delayMs={320}>
          <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.6 }}>THE CHALLENGE</p>
          <p style={{ marginTop: 8 }}>{item.challenge}</p>
        </RiseBlock>

        <RiseBlock visible={visible} delayMs={400}>
          <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.6 }}>WHAT I DID</p>
          <ul style={{ marginTop: 8 }}>
            {item.approach.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </RiseBlock>

        <RiseBlock visible={visible} delayMs={480}>
          <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.6 }}>THE RESULT</p>
          <ul style={{ marginTop: 8 }}>
            {item.results.map((r, i) => <li key={i}>✓ {r}</li>)}
          </ul>
        </RiseBlock>
      </div>
    </article>
  );
}

export default function CaseStudyReveal() {
  return (
    <section style={{ padding: "12vh 6vw", background: "#000", color: "#fff" }}>
      <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.6 }}>CASE STUDIES</p>
      <h2 style={{ fontSize: "3rem", fontWeight: 800, margin: "0.25em 0 1.5em" }}>Proof, not promises.</h2>
      {CASE_STUDIES.map((c) => <CaseStudyItem key={c.index} item={c} />)}
    </section>
  );
}
