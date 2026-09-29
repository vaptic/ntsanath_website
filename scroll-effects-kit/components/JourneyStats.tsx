"use client";

/**
 * Scene 02 in the video: "THE JOURNEY"
 * ------------------------------------
 * A pinned section where a large number rapidly *scrambles* through random
 * digits before settling on a real value, once per "stage" you scroll past.
 * At the same time, an SVG node-diagram on the right progressively lights up
 * more nodes and "draws on" more connecting lines the further you scroll.
 *
 * The two things that make this read the way it does in the video:
 *   1. The number isn't a smooth count-up. It's a *slot-machine scramble*:
 *      for ~400-500ms it renders random digits at the target's length, then
 *      locks to the real formatted value. That's what gives the "806K" /
 *      "573K" / "7751" flicker you see as you scroll past each stage.
 *   2. The diagram lines use the `pathLength="1"` SVG trick: every <path>
 *      declares pathLength="1" so `stroke-dasharray` / `stroke-dashoffset`
 *      can be expressed in simple 0..1 units no matter the path's real
 *      length in pixels — then a CSS custom property driven by scroll
 *      progress animates the "draw on" effect per edge.
 */
import { useEffect, useRef, useState } from "react";
import { pinAndTrackProgress } from "../lib/smoothScroll";

// ---- PLACEHOLDER_STAGES: replace with your own copy/values ----
type Stage = {
  label: string; // e.g. "BUILD"
  headline: string; // one-line copy under the label
  value: number; // raw numeric value this stage lands on
  suffix?: string; // e.g. "+"
  unit: string; // e.g. "users", "engagements"
  revealNodeIds: string[]; // which diagram node ids are "lit" by this stage
};

const PLACEHOLDER_STAGES: Stage[] = [
  { label: "BUILD", headline: "Define the problem.", value: 0, unit: "users", revealNodeIds: ["web"] },
  { label: "SHIP", headline: "The first working version ships.", value: 1, unit: "users", revealNodeIds: ["web", "gateway", "backend"] },
  { label: "OPTIMIZE", headline: "Traffic becomes a design input.", value: 7751, unit: "users", revealNodeIds: ["web", "gateway", "backend", "cache", "data"] },
  { label: "OPERATE", headline: "Production changes the requirements.", value: 4965, unit: "users", revealNodeIds: ["web", "mobile", "gateway", "backend", "services", "data"] },
  { label: "SUSTAIN", headline: "The system has to keep working.", value: 806000, unit: "users", revealNodeIds: ["web", "mobile", "realtime", "gateway", "backend", "services", "ai", "data", "cache", "queue", "storage", "infra"] },
];

// ---- PLACEHOLDER_DIAGRAM: nodes + edges of your own pipeline ----
type DiagramNode = { id: string; label: string; x: number; y: number };
type DiagramEdge = { from: string; to: string };

const NODES: DiagramNode[] = [
  { id: "web", label: "Web", x: 80, y: 40 },
  { id: "mobile", label: "Mobile", x: 200, y: 40 },
  { id: "realtime", label: "Realtime", x: 320, y: 40 },
  { id: "gateway", label: "API Gateway", x: 200, y: 120 },
  { id: "backend", label: "Backend", x: 80, y: 200 },
  { id: "services", label: "Services", x: 200, y: 200 },
  { id: "ai", label: "AI", x: 320, y: 200 },
  { id: "data", label: "Data", x: 200, y: 280 },
  { id: "cache", label: "Cache", x: 80, y: 360 },
  { id: "queue", label: "Queue", x: 200, y: 360 },
  { id: "storage", label: "Storage", x: 320, y: 360 },
  { id: "infra", label: "Infra", x: 200, y: 440 },
];

const EDGES: DiagramEdge[] = [
  { from: "web", to: "gateway" }, { from: "mobile", to: "gateway" }, { from: "realtime", to: "gateway" },
  { from: "gateway", to: "backend" }, { from: "gateway", to: "services" }, { from: "gateway", to: "ai" },
  { from: "backend", to: "data" }, { from: "services", to: "data" }, { from: "ai", to: "data" },
  { from: "data", to: "cache" }, { from: "data", to: "queue" }, { from: "data", to: "storage" },
  { from: "cache", to: "infra" }, { from: "queue", to: "infra" }, { from: "storage", to: "infra" },
];

function formatValue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M+`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

/** Runs a slot-machine scramble from the current displayed string to `target`,
 * calling onFrame with each intermediate string, then resolves once settled. */
function scrambleTo(
  target: string,
  onFrame: (s: string) => void,
  durationMs = 450
): () => void {
  const chars = "0123456789";
  const start = performance.now();
  let raf = 0;

  function tick(now: number) {
    const t = Math.min(1, (now - start) / durationMs);
    if (t >= 1) {
      onFrame(target);
      return;
    }
    // Reveal characters left-to-right as t increases; scramble the rest.
    const settleCount = Math.floor(t * target.length);
    let out = "";
    for (let i = 0; i < target.length; i++) {
      if (i < settleCount || !/[0-9]/.test(target[i])) {
        out += target[i];
      } else {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    onFrame(out);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export default function JourneyStats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [display, setDisplay] = useState(formatValue(PLACEHOLDER_STAGES[0].value));
  const lastStage = useRef(0);
  const cancelScramble = useRef<() => void>(() => {});

  useEffect(() => {
    if (!sectionRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStageIndex(PLACEHOLDER_STAGES.length - 1);
      setDisplay(formatValue(PLACEHOLDER_STAGES.at(-1)!.value));
      return;
    }

    const trigger = pinAndTrackProgress(sectionRef.current, {
      end: "+=4000", // total scrollable distance while this section stays pinned
      onUpdate: (progress) => {
        const idx = Math.min(
          PLACEHOLDER_STAGES.length - 1,
          Math.floor(progress * PLACEHOLDER_STAGES.length)
        );
        if (idx !== lastStage.current) {
          lastStage.current = idx;
          setStageIndex(idx);
          cancelScramble.current();
          cancelScramble.current = scrambleTo(
            formatValue(PLACEHOLDER_STAGES[idx].value),
            setDisplay
          );
        }
      },
    });

    return () => trigger.kill();
  }, []);

  const stage = PLACEHOLDER_STAGES[stageIndex];
  const litNodes = new Set(stage.revealNodeIds);

  return (
    <div ref={sectionRef} className="journey-pin" style={{ height: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", background: "#000", color: "#fff" }}>
      <div style={{ paddingLeft: "8vw" }}>
        <p style={{ fontFamily: "monospace", letterSpacing: "0.2em", fontSize: 12, opacity: 0.7 }}>THE JOURNEY</p>
        <p style={{ fontSize: "clamp(3rem, 10vw, 7rem)", fontWeight: 900, lineHeight: 1, margin: "0.25em 0" }}>
          {display}
        </p>
        <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.15em", opacity: 0.7 }}>{stage.unit.toUpperCase()}</p>
        <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.15em", marginTop: 16 }}>◇ {stage.label}</p>
        <p style={{ marginTop: 12, maxWidth: 360, opacity: 0.85 }}>{stage.headline}</p>
      </div>

      <svg viewBox="0 0 400 480" style={{ width: "100%", height: "auto" }}>
        {EDGES.map((e, i) => {
          const a = NODES.find((n) => n.id === e.from)!;
          const b = NODES.find((n) => n.id === e.to)!;
          const isLit = litNodes.has(e.from) && litNodes.has(e.to);
          return (
            <path
              key={i}
              d={`M ${a.x} ${a.y} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`}
              fill="none"
              stroke="#fff"
              strokeWidth={1.5}
              pathLength={1} // <-- the trick: dash math is now unit-based, not pixel-based
              style={{
                strokeDasharray: 1,
                strokeDashoffset: isLit ? 0 : 1,
                opacity: isLit ? 1 : 0.25,
                transition: "stroke-dashoffset 0.6s ease, opacity 0.6s ease",
              }}
            />
          );
        })}
        {NODES.map((n) => {
          const isLit = litNodes.has(n.id);
          return (
            <g key={n.id} transform={`translate(${n.x},${n.y})`} style={{ transition: "opacity 0.4s ease" }}>
              <rect
                x={-40} y={-16} width={80} height={32} rx={16}
                fill="none"
                stroke="#fff"
                strokeWidth={isLit ? 2 : 1}
                opacity={isLit ? 1 : 0.35}
              />
              <text x={0} y={0} dominantBaseline="central" textAnchor="middle" fontSize={10} fill="#fff" opacity={isLit ? 1 : 0.35} fontFamily="monospace">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
