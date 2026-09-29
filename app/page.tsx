'use client'

import { useSmoothScroll } from '@/lib/useSmoothScroll'
import Loader from '@/components/Loader'
import Nav from '@/components/Nav'
import Chrome from '@/components/Chrome'
import Hero from '@/components/sections/Hero'
import Scale from '@/components/sections/Scale'
import Craft from '@/components/sections/Craft'
import Domains from '@/components/sections/Domains'
import Work from '@/components/sections/Work'
import Worlds from '@/components/sections/Worlds'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'

export default function Home() {
  useSmoothScroll()

  return (
    <>
      {/* Grain texture overlay */}
      <div className="grain" aria-hidden="true" />

      {/* Boot loader */}
      <Loader />

      {/* Fixed navigation */}
      <Nav />

      {/* Fixed chrome (progress bar, scene counter, film btn, cursor) */}
      <Chrome />

      {/* Main content */}
      <main>
        <Hero />
        <Scale />
        <Craft />
        <Domains />
        <Work />
        <Worlds />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
