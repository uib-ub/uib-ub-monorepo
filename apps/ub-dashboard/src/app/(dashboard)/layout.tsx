import React from 'react'
import '@/app/globals.css'
import type { Metadata } from 'next'
import { TailwindIndicator } from '@/components/shared/tailwind-indicator'
import { Header } from '@/components/shared/header/header'
import { Footer } from '@/components/shared/footer'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'UB-dashboard',
  description: 'Oversikt over UBs personer, grupper, tjenester og systemer',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session) {
    return <>{children}</>
  }

  return (
    <>
      <div className='flex flex-col min-h-screen'>
        <Header />
        {children}
        <Footer />
      </div>
      <TailwindIndicator />
    </>
  )
}
