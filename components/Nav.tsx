'use client'

import { useState } from 'react'

const EMAIL = 'sanath.jeason@vaptic.com'

export default function Nav() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
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
    <nav className="nav" aria-label="Primary navigation">
      <a href="/" className="nav-brand" aria-label="Sanath Jeason home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/signature.png"
          alt="Sanath Jeason"
          className="nav-signature-img"
        />
      </a>
      <button
        className="nav-email"
        onClick={handleCopy}
        aria-label={copied ? 'Email copied' : 'Copy email address'}
      >
        {copied ? 'Copied ✓' : EMAIL}
      </button>
    </nav>
  )
}
