import { ThemeProvider } from '@/components/providers/theme-provider'
import '@/app/globals.css'
import type { Metadata } from 'next'
import SessionProvider from '@/components/providers/session-provider'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { token } from '@/sanity/lib/fetch'
import { Header } from '@/components/header'
import { PreviewIndicator } from '@/components/preview-indicator'
import { Suspense } from 'react'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'UB dashboard',
  description: 'Oversikt over UBs personer, grupper, tjenester og systemer',
}

const PreviewProvider = dynamic(() => import('@/components/providers/preview-provider'))

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        {draftMode().isEnabled ? (
          <PreviewProvider token={token}>
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
            <Footer />
          </PreviewProvider>
        ) : (
          <div className='flex flex-col min-h-screen'>
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>

            <Footer />
          </div>
        )}

        {draftMode().isEnabled ? (<PreviewIndicator />) : null}
        <TailwindIndicator />
      </SessionProvider>
    </ThemeProvider>
  )
}
