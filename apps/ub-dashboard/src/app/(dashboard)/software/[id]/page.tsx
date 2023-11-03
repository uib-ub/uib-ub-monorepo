import { MainShell } from '@/components/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Software, { query, SoftwareProps } from '../_components/software'
import PreviewSingleSoftware from '../_components/preview-single-software'
import { sanityFetch } from '@/lib/fetch'

export default async function ProjectPage({
  params,
}: {
  params: any
}) {
  const data = await sanityFetch<SoftwareProps>({ query, params: { id: params.id }, tags: [`Software:${params.id}`] })

  return (
    <MainShell>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        params={params}
        initialData={data}
        as={PreviewSingleSoftware}
      >
        <Software data={data} />
      </LiveQuery>
    </MainShell>
  )
}