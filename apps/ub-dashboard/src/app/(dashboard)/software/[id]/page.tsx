import { MainShell } from '@/components/shared/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Software, { query } from '../_components/software'
import PreviewSoftware from '../_components/preview-software'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function ProjectPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const data = await sanityFetch({ query, params: { id: params.id }, tags: [`Software:${params.id}`] })

  return (
    <MainShell>
      <LiveQuery
        enabled={(await draftMode()).isEnabled}
        query={query}
        params={params}
        initialData={data}
        as={PreviewSoftware}
      >
        <Software data={data} />
      </LiveQuery>
    </MainShell>
  );
}