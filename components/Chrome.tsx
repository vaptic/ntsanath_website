'use client'

import { useEffect, useRef, useState } from 'react'

const SCENES = [
  { id: 'hero',    label: 'SCENE 01' },
  { id: 'scale',   label: 'SCENE 02' },
  { id: 'craft',   label: 'SCENE 03' },
  { id: 'domains', label: 'SCENE 04' },
  { id: 'work',    label: 'SCENE 05' },
  { id: 'worlds',  label: 'SCENE 06' },
  { id: 'contact', label: 'SCENE 07' },
]

export default function Chrome() {
  const progressRef  = useRef<HTMLDivElement>(null)
  const filmBtnRef   = useRef<HTMLButtonElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)

  const [currentScene, setCurrentScene] = useState('SCENE 01')
  const [sceneKey, setSceneKey] = useState(0)
  const [audioOn, setAudioOn] = useState(false)

  // Audio refs
  const audioCtxRef    = useRef<AudioContext | null>(null)
  const gainNodeRef    = useRef<GainNode | null>(null)
  const audioEnabledRef = useRef(false)
  const targetGainRef  = useRef(0)
  const currentGainRef = useRef(0)
  const rafAudioRef    = useRef<number>(0)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    // Cursor: dot snaps instantly, ring lags via RAF lerp
    let cursorX = 0, cursorY = 0
    let ringX   = 0, ringY   = 0

    function onMouseMove(e: MouseEvent) {
      cursorX = e.clientX
      cursorY = e.clientY
    }

    function animateCursor() {
      ringX += (cursorX - ringX) * 0.12
      ringY += (cursorY - ringY) * 0.12

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform =
          `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`
      }
      requestAnimationFrame(animateCursor)
    }

    window.addEventListener('mousemove', onMouseMove)
    animateCursor()

    // Scroll handler
    function onScroll() {
      const scrollY = window.scrollY
      const docH = document.documentElement.scrollHeight
      const winH = window.innerHeight
      const pct = scrollY / (docH - winH)

      if (progressRef.current) {
        progressRef.current.style.width = `${pct * 100}%`
      }

      for (const scene of SCENES) {
        const el = document.getElementById(scene.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= winH * 0.5 && rect.bottom >= winH * 0.5) {
            if (currentSceneRef.current !== scene.label) {
              currentSceneRef.current = scene.label
              setCurrentScene(scene.label)
              setSceneKey(k => k + 1)
            }
            break
          }
        }
      }

      const delta = Math.abs(scrollY - lastScrollYRef.current)
      lastScrollYRef.current = scrollY
      if (audioEnabledRef.current) {
        targetGainRef.current = Math.min(delta * 0.004, 0.3)
      }
    }

    // Audio RAF loop
    function audioLoop() {
      const g = gainNodeRef.current
      if (g) {
        currentGainRef.current += (targetGainRef.current - currentGainRef.current) * 0.12
        g.gain.setTargetAtTime(currentGainRef.current, audioCtxRef.current!.currentTime, 0.01)
        targetGainRef.current *= 0.92
      }
      rafAudioRef.current = requestAnimationFrame(audioLoop)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    rafAudioRef.current = requestAnimationFrame(audioLoop)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafAudioRef.current)
    }
  }, [])

  const currentSceneRef = useRef('SCENE 01')
  currentSceneRef.current = currentScene

  function initAudio() {
    if (audioCtxRef.current) return
    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    const bufLen = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 3.5
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const bpf = ctx.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.value = 600
    bpf.Q.value = 0.5

    const gain = ctx.createGain()
    gain.gain.value = 0
    gainNodeRef.current = gain

    source.connect(bpf)
    bpf.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  }

  function toggleAudio() {
    initAudio()
    const next = !audioEnabledRef.current
    audioEnabledRef.current = next
    setAudioOn(next)

    if (!next) {
      targetGainRef.current = 0
      currentGainRef.current = 0
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1)
      }
    }
  }

  return (
    <>
      {/* Film-strip progress bar */}
      <div ref={progressRef} className="progress-bar" aria-hidden="true" />

      {/* Scene counter */}
      <div className="scene-counter" aria-live="polite">
        <span key={sceneKey} className="scene-counter-inner">{currentScene}</span>
      </div>

      {/* Film camera button */}
      <button
        ref={filmBtnRef}
        className={`film-btn${audioOn ? ' is-on' : ''}`}
        onClick={toggleAudio}
        aria-label={audioOn ? 'Mute ambient audio' : 'Play ambient audio'}
        title={audioOn ? 'Mute' : 'Play ambient sound'}
      >
        <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="1" y="5" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M25 10.5L31 7v14l-6-3.5V10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="4" y="1" width="4" height="4" rx=".5" fill="currentColor" opacity=".6" />
          <rect x="10" y="1" width="4" height="4" rx=".5" fill="currentColor" opacity=".6" />
          <rect x="16" y="1" width="4" height="4" rx=".5" fill="currentColor" opacity=".6" />
          <rect x="4" y="23" width="4" height="4" rx=".5" fill="currentColor" opacity=".6" />
          <rect x="10" y="23" width="4" height="4" rx=".5" fill="currentColor" opacity=".6" />
          <rect x="16" y="23" width="4" height="4" rx=".5" fill="currentColor" opacity=".6" />
          <circle cx="13" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="13" cy="14" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {/* Custom cursor — single lagging ring, no dot */}
      <div ref={cursorRingRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
