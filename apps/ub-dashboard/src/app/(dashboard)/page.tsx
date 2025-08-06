import React, { Suspense } from 'react'
import { UibIcon } from 'assets'
import { auth } from '@/auth'
import { SignIn } from '@/components/auth/login-button'

export default async function Home() {
  const session = await auth()

  if (!session) {
    return (
      <main className='py-8 px-4 mx-auto max-w-(--breakpoint-xl) text-center lg:py-16 lg:px-12 flex flex-col grow gap-10'>
        <UibIcon className='w-1/3 md:w-60 mx-auto' />
        <h1 className='text-4xl md:text-6xl'>UB-dashboard</h1>
        <SignIn size='lg' variant='default' className='text-lg md:text-xl py-4' />
      </main>
    )
  }

  return (
    <main className='py-8 px-4 mx-auto max-w-(--breakpoint-xl) text-center lg:py-16 lg:px-12 flex flex-col grow gap-10'>
      <UibIcon className='w-1/3 md:w-60 mx-auto' />
      <h1 className='text-4xl md:text-6xl'>UB-dashboard</h1>
      <p className='text-3xl font-bold leading-tight max-w-xl'>
        Oversikt over det som er viktigst; mennesker og relasjoner og historikk og sånt 😊.
      </p>
    </main>
  )
}
