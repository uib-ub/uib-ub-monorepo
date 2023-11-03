import { MainShell } from '@/components/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Person, { query } from '../_components/person'
import PreviewPerson from '../_components/preview-person'
import { sanityFetch } from '@/lib/fetch'
import { PersonProps } from '../_components/person'

export default async function PersonPage({
  params,
}: {
  params: any
}) {
  const data = await sanityFetch<PersonProps>({ query, params: { id: params.id }, tags: [`Actor:${params.id}`] })

  return (
    <MainShell>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        params={params}
        initialData={data}
        as={PreviewPerson}
      >
        <Person data={data} />
      </LiveQuery>
    </MainShell>
  )
}