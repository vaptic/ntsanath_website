'use client'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <h2 className="display display-sm footer-name">Sanath Jeason</h2>
        <p className="kicker footer-role">Cybersecurity consultant &middot; Founder, OffSys Labs Pvt Ltd</p>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">&copy; {year} N. T. Sanath Jeason. All rights reserved.</p>
        <div className="footer-links">
          <a
            href="https://www.linkedin.com/in/sanath-jeason"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            LinkedIn
          </a>
          <a
            href="https://offsyslabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            OffSys Labs
          </a>
          <button
            className="footer-link"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top &uarr;
          </button>
        </div>
      </div>
    </footer>
  )
}
