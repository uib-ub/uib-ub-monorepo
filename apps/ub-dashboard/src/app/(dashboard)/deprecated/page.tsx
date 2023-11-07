import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Deprecated, { query } from './_components/deprecated'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/main-shell'
import PreviewDeprecated from './_components/preview-deprecated'

export default async function DeprecatedPage() {
  const data = await sanityFetch<any[]>({ query, revalidate: 7200 })

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-2'>
        <h1>Utfasede typer</h1>
      </div>
      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewDeprecated}
      >
        <Deprecated data={data} />
      </LiveQuery>
    </MainShell>
  )
}