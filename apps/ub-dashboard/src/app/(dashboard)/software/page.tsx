import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Software, { query } from './_components/software-list'
import PreviewSoftware from './_components/preview-software-list'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'

export default async function SoftwarePage() {
  const data = await sanityFetch({ query, revalidate: 7200 })

  return (
    <MainShell>
      <h1 className='mb-2'>Programvare</h1>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewSoftware}
      >
        <Software data={data} />
      </LiveQuery>
    </MainShell>
  )
}