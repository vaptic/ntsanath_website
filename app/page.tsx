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
export default function Home() {
  useSmoothScroll()

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Loader />
      <Nav />
      <Chrome />

      <main>
        <Hero />
        <Scale />
        <Craft />
        <Domains />
        <Work />
        <Worlds />
        <Contact />
      </main>
    </>
  )
}
