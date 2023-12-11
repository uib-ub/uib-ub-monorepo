import { MainShell } from '@/components/shared/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Graph, { query, GraphProps } from '../_components/graph'
import PreviewGraph from '../_components/preview-graph'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function GraphPage() {
  const data = await sanityFetch<GraphProps>({ query, tags: [`Graph`] })

  return (
    <MainShell>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewGraph}
      >
        <Graph data={data} />
      </LiveQuery>
    </MainShell>
  )
}