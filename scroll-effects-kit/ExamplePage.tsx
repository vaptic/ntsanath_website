"use client";

/**
 * Shows how the five components in this kit stack into one page, in the
 * same order they appear in the video. Copy the relevant pieces into your
 * own app/page.tsx — this file is a wiring reference, not meant to be used
 * verbatim (there's no hero/nav/cursor/typewriter here; those were already
 * covered in your master build prompt as generic mechanics).
 */
import { useSmoothScroll } from "./lib/smoothScroll";
import JourneyStats from "./components/JourneyStats";
import ProcessParticles from "./components/ProcessParticles";
import IndustryScrubCarousel from "./components/IndustryScrubCarousel";
import CaseStudyReveal from "./components/CaseStudyReveal";
import ContactWordSwap from "./components/ContactWordSwap";

export default function ExamplePage() {
  useSmoothScroll(); // wires Lenis + GSAP ScrollTrigger for the whole page

  return (
    <main>
      {/* ...hero section here... */}

      <JourneyStats />
      <ProcessParticles />
      <IndustryScrubCarousel />
      <CaseStudyReveal />

      <section style={{ minHeight: "60vh", display: "grid", placeItems: "center", background: "#000" }}>
        <ContactWordSwap oldWord="next" newWord="now" />
      </section>
    </main>
  );
}
