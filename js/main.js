/* ============================================================
   SANATH JASON — Portfolio JavaScript
   Three.js network bg · Cursor · Scroll · Animations
   ============================================================ */

'use strict';

/* ─── 1. THREE.JS NETWORK BACKGROUND ───────────────────────── */
(function initNetwork() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 1000);
  camera.position.z = 80;

  const COUNT    = 110;
  const MAX_DIST = 20;

  /* ── Particles ── */
  const pPos = new Float32Array(COUNT * 3);
  const vel  = [];

  for (let i = 0; i < COUNT; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 150;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    vel.push({
      x: (Math.random() - 0.5) * 0.035,
      y: (Math.random() - 0.5) * 0.035,
    });
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pointsMesh = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.45, transparent: true, opacity: 0.55 })
  );
  scene.add(pointsMesh);

  /* ── Lines ── */
  const MAX_LINE_VERTS = COUNT * COUNT;          // safe upper bound
  const lPos = new Float32Array(MAX_LINE_VERTS * 3);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  const linesMesh = new THREE.LineSegments(
    lGeo,
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 })
  );
  scene.add(linesMesh);

  /* ── Mouse ── */
  let tgtX = 0, tgtY = 0, camX = 0, camY = 0;
  window.addEventListener('mousemove', (e) => {
    tgtX = (e.clientX / W() - 0.5) * 18;
    tgtY = -(e.clientY / H() - 0.5) * 10;
  });

  /* ── Scroll fade ── */
  window.addEventListener('scroll', () => {
    const fade = Math.max(0, 1 - window.scrollY / (H() * 0.65));
    canvas.style.opacity = fade;
  }, { passive: true });

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });

  /* ── Render loop ── */
  (function animate() {
    requestAnimationFrame(animate);

    // Skip render when canvas invisible (saves battery)
    if (parseFloat(canvas.style.opacity || '1') <= 0) return;

    /* Move particles */
    for (let i = 0; i < COUNT; i++) {
      pPos[i * 3]     += vel[i].x;
      pPos[i * 3 + 1] += vel[i].y;
      if (Math.abs(pPos[i * 3])     > 75) vel[i].x *= -1;
      if (Math.abs(pPos[i * 3 + 1]) > 50) vel[i].y *= -1;
    }
    pGeo.attributes.position.needsUpdate = true;

    /* Build line segments */
    let li = 0;
    const MD2 = MAX_DIST * MAX_DIST;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pPos[i * 3]     - pPos[j * 3];
        const dy = pPos[i * 3 + 1] - pPos[j * 3 + 1];
        if (dx * dx + dy * dy < MD2) {
          lPos[li++] = pPos[i * 3];     lPos[li++] = pPos[i * 3 + 1]; lPos[li++] = pPos[i * 3 + 2];
          lPos[li++] = pPos[j * 3];     lPos[li++] = pPos[j * 3 + 1]; lPos[li++] = pPos[j * 3 + 2];
        }
      }
    }
    lGeo.setDrawRange(0, li / 3);
    lGeo.attributes.position.needsUpdate = true;

    /* Camera mouse parallax */
    camX += (tgtX - camX) * 0.028;
    camY += (tgtY - camY) * 0.028;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  })();
})();


/* ─── 2. CUSTOM CURSOR ──────────────────────────────────────── */
(function initCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  let cx = -100, cy = -100;
  let tx = -100, ty = -100;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  (function trackCursor() {
    cx += (tx - cx) * 0.10;
    cy += (ty - cy) * 0.10;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(trackCursor);
  })();

  const hoverEls = document.querySelectorAll('a, button, .expertise-card, .cert-badge, .process-step, .exp-item, .contact-link, .nav-brand, .name-line');
  hoverEls.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
})();


/* ─── 3. SCROLL PROGRESS BAR ────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();


/* ─── 4. NAV SCROLLED STATE ─────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const toggle = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();


/* ─── 5. NAV LINK HOVER (replaces email copy) ───────────────── */
(function initNavLink() {
  const navEmail = document.querySelector('.nav-email');
  if (navEmail) {
    navEmail.addEventListener('mouseenter', () => {
      document.querySelector('.cursor') && document.querySelector('.cursor').classList.add('is-hovering');
    });
    navEmail.addEventListener('mouseleave', () => {
      document.querySelector('.cursor') && document.querySelector('.cursor').classList.remove('is-hovering');
    });
  }
})();


/* ─── 6. SECTION REVEALS ─────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.section-reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el) => obs.observe(el));
})();


/* ─── 7. STATS COUNTER ──────────────────────────────────────── */
(function initStats() {
  const statEls = document.querySelectorAll('.stat-number');
  if (!statEls.length) return;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 2000;
      const start  = performance.now();

      (function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / dur, 1);
        el.textContent = Math.round(easeOutCubic(progress) * target);
        if (progress < 1) requestAnimationFrame(tick);
      })(start);

      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  statEls.forEach((el) => obs.observe(el));
})();


/* ─── 8. TICKER DUPLICATE (seamless loop) ───────────────────── */
(function initTicker() {
  const inner = document.getElementById('tickerInner');
  if (!inner) return;
  // Duplicate content so the CSS animation loops seamlessly
  const clone = inner.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  inner.parentElement.appendChild(clone);
})();


/* ─── 9. HERO ENTRANCE ANIMATION ───────────────────────────── */
(function initHeroEntrance() {
  const lines    = document.querySelectorAll('.name-line');
  const kicker   = document.querySelector('.hero-kicker');
  const tagline  = document.querySelector('.hero-tagline');
  const hint     = document.querySelector('.hero-scroll-hint');
  const photo    = document.querySelector('.hero-photo');

  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  /* Name lines slide up */
  lines.forEach((line, i) => {
    line.style.cssText = `opacity:0; transform:translateY(110%);`;
    setTimeout(() => {
      line.style.transition = `opacity 0.9s ${EASE} ${i * 0.12}s, transform 0.9s ${EASE} ${i * 0.12}s`;
      line.style.opacity    = '1';
      line.style.transform  = 'translateY(0)';
    }, 80);
  });

  /* Other hero elements fade in */
  [kicker, tagline, hint, photo].forEach((el, i) => {
    if (!el) return;
    el.style.cssText = `opacity:0; transform:translateY(16px);`;
    const delay = 0.45 + i * 0.08;
    setTimeout(() => {
      el.style.transition = `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`;
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, 80);
  });
})();


/* ─── 10. STAGGERED CARD REVEALS ────────────────────────────── */
(function initCardStagger() {
  const grids = document.querySelectorAll('.expertise-grid, .cert-grid');

  grids.forEach((grid) => {
    const cards = grid.querySelectorAll('.expertise-card, .cert-badge');

    cards.forEach((card, i) => {
      card.style.cssText = `opacity:0; transform:translateY(24px);`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const gridCards = e.target.querySelectorAll('.expertise-card, .cert-badge');
        gridCards.forEach((card, i) => {
          setTimeout(() => {
            card.style.transition = `opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)`;
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          }, i * 80);
        });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1 });

    obs.observe(grid);
  });
})();


/* ─── 11. PROCESS STEP STAGGER ──────────────────────────────── */
(function initProcessStagger() {
  const container = document.querySelector('.process-steps');
  if (!container) return;

  const steps = container.querySelectorAll('.process-step');
  steps.forEach((step) => {
    step.style.cssText = `opacity:0; transform:translateY(20px);`;
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      steps.forEach((step, i) => {
        setTimeout(() => {
          step.style.transition = `opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)`;
          step.style.opacity    = '1';
          step.style.transform  = 'translateY(0)';
        }, i * 90);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  obs.observe(container);
})();


/* ─── 12. SMOOTH ANCHOR SCROLL ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (window._lenis) {
      window._lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ═══════════════════════════════════════════════════════════════
   SCENE 02 SYSTEM
   Lenis smooth scroll + GSAP ScrollTrigger reveals
   Visual language from jeffmilanes.com
═══════════════════════════════════════════════════════════════ */


/* ─── 13. LENIS SMOOTH SCROLL ───────────────────────────────── */
(function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.5,
    infinite: false,
  });

  /* Sync Lenis RAF with GSAP ticker so ScrollTrigger stays accurate */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());
  }

  /* Expose for anchor scroll */
  window._lenis = lenis;
})();


/* ─── 14. SCENE 02 — JOURNEY REVEALS ────────────────────────── */
(function initScene02() {
  const section = document.querySelector('.scene-02');
  if (!section) return;

  /* Respect prefers-reduced-motion */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Element references */
  const words      = [...section.querySelectorAll('.s02-word')];
  const copyItems  = [...section.querySelectorAll('.s02-scale-stage, .s02-scale-unit, .s02-scale-copy, .s02-scale-proof')];
  const divLines   = [...section.querySelectorAll('.s02-divider-line')];
  const kicker     = section.querySelector('.s02-net-kicker');
  const bodyLines  = [...section.querySelectorAll('.s02-line')];
  const hubNode    = section.querySelector('.s02-hub-node');
  const outerNodes = [...section.querySelectorAll('.s02-evolve-node:not(.s02-hub-node)')];
  const links      = [...section.querySelectorAll('.s02-link')];
  const flows      = [...section.querySelectorAll('.s02-flow')];
  const stats      = [...section.querySelectorAll('.s02-stat')];
  const counters   = [...section.querySelectorAll('.s02-counter')];

  /* ── Slot-machine scramble (jeffmilanes exact: 450ms, left-to-right char reveal) ── */
  function scrambleTo(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';
    const target = el.dataset.target || '';
    const chars  = '0123456789';
    const dur    = 450;
    const t0     = performance.now();
    (function tick(now) {
      const t       = Math.min(1, (now - t0) / dur);
      const settled = Math.floor(t * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        out += (i < settled || !/[0-9]/.test(target[i]))
          ? target[i]
          : chars[Math.floor(Math.random() * 10)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ── IS-HOT hover handlers (jeffmilanes interactive glow on nodes) ── */
  outerNodes.forEach(node => {
    node.addEventListener('mouseenter', () => node.classList.add('is-hot'));
    node.addEventListener('mouseleave', () => node.classList.remove('is-hot'));
  });

  /* ── One-shot network activation (used by fallback + reduced-motion) ── */
  function activateNetwork() {
    if (hubNode) hubNode.classList.add('is-on');
    links.forEach((l, i)      => setTimeout(() => l.classList.add('is-on'), 200 + i * 80));
    outerNodes.forEach((n, i) => setTimeout(() => n.classList.add('is-on'), 500 + i * 110));
    flows.forEach((f, i)      => setTimeout(() => f.classList.add('is-on'), 900 + i * 60));
  }

  /* ══ GSAP PIN + SCRUB PATH ══════════════════════════════════ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* Set all starting states via GSAP (overrides CSS initial values) */
    gsap.set(words,    { opacity: 0, filter: 'blur(8px)', y: '0.55em', scale: 0.96 });
    gsap.set(copyItems,{ opacity: 0, y: '0.4em' });
    if (divLines[0]) gsap.set(divLines[0], { scaleX: 0, transformOrigin: 'left center' });
    if (divLines[1]) gsap.set(divLines[1], { scaleX: 0, transformOrigin: 'right center' });
    if (kicker) gsap.set(kicker, { opacity: 0, y: '0.4em' });
    gsap.set(bodyLines, { y: '110%' });
    gsap.set(stats,    { opacity: 0, y: 20 });

    /*
     * Scrub timeline — total spans 0 → 1 which maps to 2400px scroll distance.
     * Each fromTo position is a fraction of that range.
     * GSAP ease: 'none' on the timeline so scrub is linear; each tween uses its own ease.
     */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    /* Words: 0.04 → ~0.28 (jeffmilanes domains-name-in: blur 8px, Y 0.55em, scale 0.96) */
    words.forEach((w, i) => {
      tl.fromTo(w,
        { opacity: 0, filter: 'blur(8px)', y: '0.55em', scale: 0.96 },
        { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, duration: 0.16, ease: 'power3.out' },
        0.04 + i * 0.058
      );
    });

    /* Copy col items: 0.26 → ~0.47 (jeffmilanes scene-in: Y 0.4em) */
    copyItems.forEach((el, i) => {
      tl.fromTo(el,
        { opacity: 0, y: '0.4em' },
        { opacity: 1, y: 0, duration: 0.12, ease: 'power3.out' },
        0.26 + i * 0.042
      );
    });

    /* Divider draws: 0.42 → 0.56 */
    if (divLines[0]) {
      tl.fromTo(divLines[0], { scaleX: 0 }, { scaleX: 1, duration: 0.14, ease: 'power3.inOut' }, 0.42);
    }
    if (divLines[1]) {
      tl.fromTo(divLines[1], { scaleX: 0 }, { scaleX: 1, duration: 0.14, ease: 'power3.inOut' }, 0.43);
    }

    /* Kicker: 0.50 → 0.60 */
    if (kicker) {
      tl.fromTo(kicker,
        { opacity: 0, y: '0.4em' },
        { opacity: 1, y: 0, duration: 0.10, ease: 'power3.out' },
        0.50
      );
    }

    /* Body lines: 0.54 → ~0.70 */
    bodyLines.forEach((l, i) => {
      tl.fromTo(l, { y: '110%' }, { y: 0, duration: 0.12, ease: 'power3.out' }, 0.54 + i * 0.055);
    });

    /*
     * Stats row: starts at 0.78, stagger 0.02 per stat, duration 0.12 each.
     * Stat opacities at animation 0.91 (when scramble fires):
     *   Stat 1 (0.78→0.90): 108% → opacity 1   ✓
     *   Stat 2 (0.80→0.92):  92% → opacity ~0.9 ✓
     *   Stat 3 (0.82→0.94):  75% → opacity ~0.7 ✓
     *   Stat 4 (0.84→0.96):  58% → opacity ~0.5 ✓
     */
    tl.fromTo(stats,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.12, ease: 'power3.out', stagger: 0.02 },
      0.78
    );

    /*
     * Scramble fires at animation position 0.91 — when all stats are already visible.
     * tl.call() uses animation time (not raw scroll), so it always fires at the
     * correct moment regardless of how fast the user scrolls.
     */
    tl.call(() => {
      counters.forEach((c, i) => setTimeout(() => scrambleTo(c), i * 110));
      if (stats[0]) stats[0].classList.add('is-active');
    }, [], 0.91);

    /* Pad timeline to exactly 1 */
    tl.to({}, { duration: 0 }, 1);

    /* Network class-toggle state */
    const net = {
      hub:   false,
      links: links.map(()      => false),
      nodes: outerNodes.map(() => false),
      flows: flows.map(()      => false),
    };

    /* ── PIN + SCRUB ── */
    ScrollTrigger.create({
      trigger:    section,
      start:      'top top',
      end:        '+=2400',
      pin:        true,
      pinSpacing: true,
      scrub:      1,             /* 1-second lag → cinematic smoothness */
      animation:  tl,

      onUpdate(self) {
        const p = self.progress;

        /* Hub node activates at 62% */
        const hubOn = p >= 0.62;
        if (hubOn !== net.hub) {
          net.hub = hubOn;
          hubNode?.classList.toggle('is-on', hubOn);
        }

        /* 6 links draw in staggered from 66% → 76% */
        links.forEach((l, i) => {
          const on = p >= 0.66 + i * 0.017;
          if (on !== net.links[i]) { net.links[i] = on; l.classList.toggle('is-on', on); }
        });

        /* 6 outer nodes activate staggered from 70% → 82% */
        outerNodes.forEach((n, i) => {
          const on = p >= 0.70 + i * 0.020;
          if (on !== net.nodes[i]) { net.nodes[i] = on; n.classList.toggle('is-on', on); }
        });

        /* 6 flow lines start marching staggered from 76% → 86% */
        flows.forEach((f, i) => {
          const on = p >= 0.76 + i * 0.017;
          if (on !== net.flows[i]) { net.flows[i] = on; f.classList.toggle('is-on', on); }
        });

        /* (scramble handled by tl.call at animation position 0.91) */
      },
    });

  /* ══ INTERSECTION OBSERVER FALLBACK (no GSAP or reduced motion) ══ */
  } else {

    const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

    /* Set initial states */
    words.forEach(w => {
      w.style.opacity   = '0';
      w.style.filter    = 'blur(8px)';
      w.style.transform = 'translateY(0.55em) scale(0.96)';
    });
    copyItems.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(0.4em)'; });
    if (divLines[0]) { divLines[0].style.transformOrigin = 'left center';  divLines[0].style.transform = 'scaleX(0)'; }
    if (divLines[1]) { divLines[1].style.transformOrigin = 'right center'; divLines[1].style.transform = 'scaleX(0)'; }
    if (kicker) { kicker.style.opacity = '0'; kicker.style.transform = 'translateY(0.4em)'; }
    bodyLines.forEach(l => { l.style.transform = 'translateY(110%)'; });
    stats.forEach(s => { s.style.opacity = '0'; s.style.transform = 'translateY(20px)'; });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const t = e.target;

        if (t.classList.contains('s02-words')) {
          words.forEach((w, i) => {
            const d = i * 0.14;
            w.style.transition = `opacity 1.05s ${EASE} ${d}s, filter 1.05s ${EASE} ${d}s, transform 1.05s ${EASE} ${d}s`;
            w.style.opacity = '1'; w.style.filter = 'blur(0)'; w.style.transform = 'none';
          });
        }

        if (t.classList.contains('s02-copy-col')) {
          copyItems.forEach((el, i) => {
            const d = i * 0.12;
            el.style.transition = `opacity 0.85s ${EASE} ${d}s, transform 0.85s ${EASE} ${d}s`;
            el.style.opacity = '1'; el.style.transform = 'none';
          });
        }

        if (t.classList.contains('s02-divider')) {
          if (divLines[0]) { divLines[0].style.transition = `transform 1.4s ${EASE}`; divLines[0].style.transform = 'scaleX(1)'; }
          if (divLines[1]) { divLines[1].style.transition = `transform 1.4s ${EASE} 0.08s`; divLines[1].style.transform = 'scaleX(1)'; }
        }

        if (t.classList.contains('s02-net-intro') && kicker) {
          kicker.style.transition = `opacity 0.75s ${EASE}, transform 0.75s ${EASE}`;
          kicker.style.opacity = '1'; kicker.style.transform = 'none';
        }

        if (t.classList.contains('s02-body-lines')) {
          bodyLines.forEach((l, i) => {
            l.style.transition = `transform 0.95s ${EASE} ${i * 0.1}s`;
            l.style.transform  = 'translateY(0)';
          });
        }

        if (t.classList.contains('s02-diagram')) activateNetwork();

        if (t.classList.contains('s02-stats')) {
          stats.forEach((s, i) => {
            s.style.transition = `opacity 0.85s ease ${i * 0.1}s, transform 0.85s ${EASE} ${i * 0.1}s`;
            s.style.opacity = '1'; s.style.transform = 'translateY(0)';
          });
          counters.forEach((c, i) => setTimeout(() => scrambleTo(c), i * 200));
          if (stats[0]) stats[0].classList.add('is-active');
        }

        io.unobserve(t);
      });
    }, { threshold: 0.12 });

    ['.s02-words', '.s02-copy-col', '.s02-divider', '.s02-net-intro',
     '.s02-body-lines', '.s02-diagram', '.s02-stats'].forEach(sel => {
      const el = section.querySelector(sel);
      if (el) io.observe(el);
    });
  }

})();
