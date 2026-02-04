import React, { Suspense } from 'react'
import Groups, { query } from './_components/groups'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'
import Link from 'next/link'

export default async function GroupsPage() {
  const { data } = await sanityFetch({ query })

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-4'>
        <h1>Grupper</h1> /
        <span className='underline'>
          Liste
        </span>
        /
        <Link href='/groups/overview'>
          Oversikt
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Groups data={data} />
      </Suspense>
    </MainShell>
  );
}