"use client";

/**
 * Scene 03 in the video: "AT THE MACHINE"
 * ----------------------------------------
 * A pinned section with a plain <canvas> (three.js, WebGL) rendering a cloud
 * of points that silently morphs from one silhouette to another — a diamond,
 * then a triangle/pyramid, etc. — once per "beat" (Think / Design / Build /
 * Ship / Evolve), while a beat list on the right highlights the active item.
 *
 * The mechanism:
 *   1. One THREE.Points object with a fixed particle count (say 1500).
 *   2. For each beat, precompute a target Float32Array of xyz positions that
 *      approximates that beat's shape (here: five generic solids — swap
 *      these generator functions for whatever silhouettes you want).
 *   3. On beat change, tween the *current* position buffer toward the
 *      *target* buffer over ~1.2s (per-vertex lerp, ticked every frame) —
 *      not a crossfade of two objects, an actual per-particle migration,
 *      which is what gives the "points drift into a new shape" read.
 *   4. The whole thing spins slowly all the time via a constant rotation
 *      added in the render loop, independent of scroll.
 *   5. Which beat is "active" comes from the same discrete-stage math as
 *      JourneyStats.tsx: floor(progress * beatCount), clamped — not a
 *      continuous scroll-follow, a stepped index.
 */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { pinAndTrackProgress } from "../lib/smoothScroll";

// ---- PLACEHOLDER_BEATS: your own 5 steps ----
const BEATS = [
  { title: "Think", body: "Understand the problem, the constraints, and what should be built." },
  { title: "Design", body: "Shape the system: boundaries, data, APIs, risk, and scale." },
  { title: "Build", body: "Turn the decision into software." },
  { title: "Ship", body: "Production is the real test." },
  { title: "Evolve", body: "Architecture has to move with the product." },
];

const PARTICLE_COUNT = 1500;

// ---- Shape generators: each returns a Float32Array of length COUNT*3 ----
// Swap these for whatever silhouettes fit your own content.
function shapeDiamond(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const r = (1 - Math.abs(t - 0.5) * 2) * 1.4; // widest at the middle
    const y = (t - 0.5) * 2.6;
    pts[i * 3] = Math.cos(angle) * r;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = Math.sin(angle) * r * 0.3; // flattened toward camera
  }
  return pts;
}

function shapePyramid(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = Math.random() * 2.2 - 1.1;
    const t = (y + 1.1) / 2.2; // 0 at base, 1 at apex
    const half = (1 - t) * 1.3;
    pts[i * 3] = (Math.random() * 2 - 1) * half;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = (Math.random() * 2 - 1) * half * 0.3;
  }
  return pts;
}

function shapeSphere(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 1.3;
    pts[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pts[i * 3 + 2] = r * Math.cos(phi) * 0.3;
  }
  return pts;
}

function shapeCubeShell(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const face = Math.floor(Math.random() * 3);
    const a = Math.random() * 2 - 1;
    const b = Math.random() * 2 - 1;
    const s = 1.1;
    if (face === 0) { pts[i * 3] = a * s; pts[i * 3 + 1] = b * s; pts[i * 3 + 2] = (Math.random() > 0.5 ? 1 : -1) * s * 0.3; }
    else if (face === 1) { pts[i * 3] = a * s; pts[i * 3 + 1] = (Math.random() > 0.5 ? 1 : -1) * s; pts[i * 3 + 2] = b * s * 0.3; }
    else { pts[i * 3] = (Math.random() > 0.5 ? 1 : -1) * s; pts[i * 3 + 1] = a * s; pts[i * 3 + 2] = b * s * 0.3; }
  }
  return pts;
}

function shapeTorus(count: number): Float32Array {
  const pts = new Float32Array(count * 3);
  const R = 1.0, r = 0.4;
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    pts[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
    pts[i * 3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
    pts[i * 3 + 2] = r * Math.sin(v) * 0.5;
  }
  return pts;
}

const SHAPES = [shapeDiamond, shapePyramid, shapeSphere, shapeCubeShell, shapeTorus].map((fn) => fn(PARTICLE_COUNT));

export default function ProcessParticles() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const targetShapeRef = useRef(0);

  // --- Three.js setup (runs once) ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 5;

    const geometry = new THREE.BufferGeometry();
    const positions = Float32Array.from(SHAPES[0]); // mutable "current" buffer
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, sizeAttenuation: true });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    function resize() {
      const { clientWidth, clientHeight } = canvas.parentElement!;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let morphStart = 0;
    let morphFrom = Float32Array.from(SHAPES[0]);
    let morphing = false;
    const MORPH_MS = 1200;

    function startMorph(toIndex: number) {
      morphFrom = Float32Array.from(positions);
      morphStart = performance.now();
      morphing = true;
      targetShapeRef.current = toIndex;
    }
    // Expose a way for the scroll handler (outside this effect) to trigger morphs.
    (canvas as any).__startMorph = startMorph;

    function tick(now: number) {
      if (morphing) {
        const t = Math.min(1, (now - morphStart) / MORPH_MS);
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const target = SHAPES[targetShapeRef.current];
        for (let i = 0; i < positions.length; i++) {
          positions[i] = morphFrom[i] + (target[i] - morphFrom[i]) * ease;
        }
        geometry.attributes.position.needsUpdate = true;
        if (t >= 1) morphing = false;
      }
      if (!reduced) {
        points.rotation.y += 0.0025;
        points.rotation.x = Math.sin(now * 0.0002) * 0.1;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // --- Scroll -> discrete beat index -> trigger a morph ---
  useEffect(() => {
    if (!sectionRef.current) return;
    const trigger = pinAndTrackProgress(sectionRef.current, {
      end: "+=3500",
      onUpdate: (progress) => {
        const idx = Math.min(BEATS.length - 1, Math.floor(progress * BEATS.length));
        setActiveBeat((prev) => {
          if (prev !== idx && canvasRef.current) {
            (canvasRef.current as any).__startMorph?.(idx);
          }
          return idx;
        });
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <div ref={sectionRef} style={{ height: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "#000", color: "#fff" }}>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24, paddingRight: "8vw" }}>
        {BEATS.map((b, i) => (
          <div key={b.title} style={{ opacity: i === activeBeat ? 1 : 0.35, transition: "opacity 0.4s ease" }}>
            <p style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.7 }}>{String(i + 1).padStart(2, "0")}</p>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, margin: "0.25em 0" }}>{b.title}</h3>
            <p style={{ maxWidth: 320, fontSize: 14, opacity: 0.8 }}>{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
