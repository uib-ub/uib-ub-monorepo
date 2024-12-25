import { ThemeProvider } from '@/components/providers/theme-provider'
import '@/app/globals.css'
import type { Metadata } from 'next'
import SessionProvider from '@/components/providers/session-provider'
import { TailwindIndicator } from '@/components/shared/tailwind-indicator'
import { Header } from '@/components/shared/header/header'
import { Suspense } from 'react'
import { Footer } from '@/components/shared/footer'

export const metadata: Metadata = {
  title: 'UB-dashboard',
  description: 'Oversikt over UBs personer, grupper, tjenester og systemer',
}

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
        <div className='flex flex-col min-h-screen'>
          <Header />
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>

          <Footer />
        </div>
        <TailwindIndicator />
      </SessionProvider>
    </ThemeProvider>
  )
}
