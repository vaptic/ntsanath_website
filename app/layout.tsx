import type { Metadata } from 'next'
import { Archivo, Geist_Mono, Dancing_Script } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-sig',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'N. T. Sanath Jeason — Cybersecurity Consultant',
  description:
    'Penetration testing, VAPT, and security consulting. Founder of OffSys Labs Pvt Ltd. 12+ years securing BFSI, healthcare, government, and technology organisations.',
  keywords: [
    'cybersecurity consultant',
    'penetration testing',
    'VAPT',
    'OffSys Labs',
    'Sanath Jeason',
    'security audit',
    'ethical hacking',
  ],
  authors: [{ name: 'N. T. Sanath Jeason' }],
  openGraph: {
    title: 'N. T. Sanath Jeason — Cybersecurity Consultant',
    description:
      'Penetration testing, VAPT, and security consulting. Founder of OffSys Labs.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${geistMono.variable} ${dancingScript.variable}`}>
      <body>{children}</body>
    </html>
  )
}
