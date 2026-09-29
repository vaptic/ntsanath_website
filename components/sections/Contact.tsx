'use client'

import { useEffect, useRef, useState } from 'react'

const EMAIL = 'sanath.jeason@vaptic.com'

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const secureRef = useRef<HTMLSpanElement>(null)
  const nowRef = useRef<HTMLSpanElement>(null)
  const [copied, setCopied] = useState(false)
  const animatedRef = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true
            triggerAnimation()
          }
        })
      },
      { threshold: 0.4 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  function triggerAnimation() {
    const secure = secureRef.current
    const now = nowRef.current
    if (!secure || !now) return

    // Step 1: draw strikethrough (delay 0.3s for drama)
    setTimeout(() => {
      secure.classList.add('is-struck')
    }, 300)

    // Step 2: reveal "now?" (after strike + fade)
    setTimeout(() => {
      now.classList.add('is-revealed')
    }, 1400)
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = EMAIL
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <p className="kicker contact-kicker">Get in touch</p>

      <div className="contact-headline">
        <div className="contact-headline-inner">
          <span className="contact-word">What</span>
          <span className="contact-word">should</span>
          <span className="contact-word">we</span>
          <span className="contact-secure" ref={secureRef}>
            secure
            <span className="contact-secure-strike" aria-hidden="true" />
          </span>
          <span className="contact-now" ref={nowRef}>
            &nbsp;now?
          </span>
        </div>
      </div>

      <div className="contact-email-wrap">
        <button
          className="contact-email-btn"
          onClick={copyEmail}
          aria-label={copied ? 'Email copied to clipboard' : 'Click to copy email'}
        >
          {copied ? 'Copied ✓' : EMAIL}
        </button>
      </div>

      <div className="contact-links">
        <a
          href="https://www.linkedin.com/in/sanath-jeason"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          LinkedIn ↗
        </a>
        <a
          href="https://offsyslabs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          OffSys Labs ↗
        </a>
      </div>
    </section>
  )
}
