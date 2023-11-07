import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Timeline, { query } from '@/components/timeline'
import PreviewTimeline from './_components/preview-timeline'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/main-shell'

export default async function TimelinePage() {
  const data = await sanityFetch<any[]>({ query, revalidate: 7200 })

  return (
    <MainShell>
      <h1>Tidslinje</h1>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewTimeline}
      >
        <Timeline data={data} />
      </LiveQuery>
    </MainShell>
  )
}