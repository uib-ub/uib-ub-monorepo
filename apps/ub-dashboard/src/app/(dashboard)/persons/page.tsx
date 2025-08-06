import React, { Suspense } from 'react'
import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Persons, { query } from './_components/persons'
import PreviewPersons from './_components/preview-persons'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'

export default async function PersonsPage() {
  const data = await sanityFetch({ query, revalidate: 7200 })

  return (
    <MainShell>
      <Suspense fallback={<div>Loading...</div>}>
        <h1>Personer</h1>
        <p className='max-w-prose mb-5'>Personer som jobber på UB, basert på data registrert i <i>dashboard-et</i>. De som ikke har nok data er filtrert bort, men de vises om man slår av &quot;Aktive&quot; filteret. Da vises også personer som ikke jobber på UB, men har en kobling til oss. Er ikke det utrolig tipp-toppers, da?</p>
        <LiveQuery
          enabled={(await draftMode()).isEnabled}
          query={query}
          initialData={data}
          as={PreviewPersons}
        >
          <Persons data={data} />
        </LiveQuery>
      </Suspense>
    </MainShell>
  );
}