import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import GroupsOverview, { query } from '../_components/groups-overview'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/main-shell'
import PreviewGroups from '../_components/preview-groups-overview'
import Link from 'next/link'

export default async function GroupsPage() {
  const data = await sanityFetch<any[]>({ query, revalidate: 7200 })

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-5'>
        <h1>Grupper</h1> /
        <Link href='/groups'>
          Liste
        </Link>
        /
        <span className='underline'>
          Oversikt
        </span>
      </div>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewGroups}
      >
        <GroupsOverview data={data} />
      </LiveQuery>
    </MainShell>
  )
}