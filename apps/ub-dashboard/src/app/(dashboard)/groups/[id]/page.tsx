import { MainShell } from '@/components/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Group, { query, GroupProps } from '../_components/group'
import PreviewGroup from '../_components/preview-group'
import { sanityFetch } from '@/lib/fetch'

export default async function GroupPage({
  params,
}: {
  params: any
}) {
  const data = await sanityFetch<GroupProps>({ query, params: { id: params.id }, tags: [`Group:${params.id}`] })

  return (
    <MainShell>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        params={params}
        initialData={data}
        as={PreviewGroup}
      >
        <Group data={data} />
      </LiveQuery>
    </MainShell>
  )
}