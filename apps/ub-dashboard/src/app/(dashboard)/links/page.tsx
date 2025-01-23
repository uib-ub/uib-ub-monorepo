import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Links, { query } from './_components/links'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'
import PreviewLinks from './_components/preview-links'

export default async function LinksPage() {
  const data = await sanityFetch({ query, revalidate: 7200 })

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-2'>
        <h1>Lenker</h1>
      </div>
      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewLinks}
      >
        <Links data={data} />
      </LiveQuery>
    </MainShell>
  )
}