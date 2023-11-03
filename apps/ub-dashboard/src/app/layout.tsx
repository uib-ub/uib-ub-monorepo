import { IBM_Plex_Mono, Inter, PT_Serif } from 'next/font/google'
import type { Metadata } from 'next'
import '@/app/globals.css'


export const metadata: Metadata = {
  title: 'UB dashboard',
  description: 'Oversikt over UBs personer, grupper, tjenester og systemer',
}

const serif = PT_Serif({
  variable: '--font-serif',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['400', '700'],
})
const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  // @todo: understand why extrabold (800) isn't being respected when explicitly specified in this weight array
  // weight: ['500', '700', '800'],
})
const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className={`${mono.variable} ${sans.variable} ${serif.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
