'use client'

import { useEffect, useRef } from 'react'

const CASES = [
  {
    num: '01',
    title: 'National Bank Group',
    tagline: 'Full-scope VAPT ahead of an RBI regulatory audit.',
    overview: 'A leading private-sector bank required comprehensive penetration testing across its entire digital estate — delivered in a compressed timeline with zero business disruption.',
    challenge: 'Fourteen web portals, internal network infrastructure, Active Directory, and multi-cloud workloads, all before an immovable Reserve Bank of India inspection date.',
    approach: [
      'External perimeter and 14 web portals assessed end-to-end',
      'Internal network and AD forest enumerated and exploited in-scope',
      'Cloud workloads across AWS and Azure reviewed',
      'Risk-ranked deliverables for executive and technical audiences',
    ],
    results: [
      '140 vulnerabilities remediated',
      'Zero critical findings at RBI audit',
      'PCI-DSS certification achieved',
      'Active Directory fully hardened',
    ],
    imgOffset: '30%',
  },
  {
    num: '02',
    title: 'Regional Hospital Network',
    tagline: 'Security uplift across 38 hospitals before a national health-data audit.',
    overview: 'A hospital group with 38 facilities and fragmented IT needed a full security audit covering legacy OT/SCADA systems, patient-data stores, and cloud workloads — all inside a six-week window.',
    challenge: 'Fragmented IT across 38 sites, legacy SCADA/BMS systems, 220K+ sensitive patient records, and no unified security policy in place.',
    approach: [
      'Network segmentation audit across all 38 facilities',
      'Medical device and OT/BMS inventory with full risk mapping',
      'Active Directory hardening deployed organisation-wide',
      'Cloud workload VAPT and HIPAA control documentation',
    ],
    results: [
      'Full network re-segmentation delivered',
      'Zero breaches in the 12 months post-engagement',
      'AD hardened across the entire organisation',
      'HIPAA controls fully mapped and documented',
    ],
    imgOffset: '18%',
  },
  {
    num: '03',
    title: 'Growth-Stage FinTech',
    tagline: 'End-to-end security for a ₹180M-daily-GMV payments platform.',
    overview: 'A fast-scaling platform with four million users needed full security coverage before a Series B raise — 200+ undocumented API endpoints, three payment gateways, and a cloud config that had never been audited.',
    challenge: 'Hyper-growth codebase with 200+ API endpoints, three payment gateways, iOS and Android apps, and no security gate in the CI/CD pipeline.',
    approach: [
      'Full API security assessment across 200+ endpoints',
      'Payment gateway and PCI-DSS SAQ-A review',
      'iOS and Android mobile VAPT',
      'Cloud configuration audit and CI/CD security-gate design',
    ],
    results: [
      '23 critical and high vulnerabilities closed',
      'PCI-DSS SAQ-A compliance achieved',
      'Zero payment incidents in six months post-fix',
      'CI/CD security gates added to the pipeline',
    ],
    imgOffset: '22%',
  },
]

export default function Work() {
  const imgRefs   = useRef<(HTMLImageElement | null)[]>([])
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Subtle vertical parallax on images as user scrolls
    function onScroll() {
      imgRefs.current.forEach(img => {
        if (!img) return
        const rect = img.getBoundingClientRect()
        const winH = window.innerHeight
        const pct  = (winH - rect.top) / (winH + rect.height)
        img.style.transform = `translateY(${(pct - 0.5) * -80}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Clip-path reveal: each image panel un-masks as it enters the viewport
    const observers: IntersectionObserver[] = []
    mediaRefs.current.forEach(el => {
      if (!el) return
      const obs = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              el.classList.add('is-revealed')
              obs.disconnect()
            }
          })
        },
        { threshold: 0.15 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observers.forEach(o => o.disconnect())
    }
  }, [])

  return (
    <section id="work" className="work">
      {/* Section header */}
      <div className="work-inner">
        <p className="kicker work-kicker">Case Studies</p>
        <h2 className="display display-md work-heading">
          Proof,<br />not promises.
        </h2>
      </div>

      {/* Case-study list */}
      <div className="work-list">
        {CASES.map((c, i) => (
          <article key={c.num} className="work-item">

            {/* Number (outline) + title in a 2-col grid */}
            <div className="work-head">
              <p className="work-index display" aria-hidden="true">{c.num}</p>
              <div className="work-title">
                <h3 className="work-name display display-md">{c.title}</h3>
              </div>
            </div>

            <p className="work-tagline">{c.tagline}</p>

            {/* Full-bleed image — clip-path animates open on scroll */}
            <div
              className="work-media"
              ref={el => { mediaRefs.current[i] = el }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/sanath-full.jpeg"
                alt={`${c.title} engagement`}
                ref={el => { imgRefs.current[i] = el }}
                style={{ objectPosition: `center ${c.imgOffset}` }}
              />
            </div>

            {/* Detail: overview paragraph + 3-column grid */}
            <div className="work-detail">
              <p className="work-overview">{c.overview}</p>
              <div className="work-cols">
                <div className="work-block">
                  <p className="work-label">The challenge</p>
                  <p className="work-text">{c.challenge}</p>
                </div>
                <div className="work-block">
                  <p className="work-label">Approach</p>
                  <ul className="work-points">
                    {c.approach.map(pt => <li key={pt}>{pt}</li>)}
                  </ul>
                </div>
                <div className="work-block">
                  <p className="work-label">The result</p>
                  <ul className="work-results">
                    {c.results.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              </div>
            </div>

          </article>
        ))}
      </div>
    </section>
  )
}
