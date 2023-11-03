import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Groups, { query } from './_components/groups'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/main-shell'
import PreviewGroups from './_components/preview-groups'
import Link from 'next/link'

export default async function GroupsPage() {
  const data = await sanityFetch<any[]>({ query, revalidate: 7200 })

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-4'>
        <h1>Grupper</h1> /
        <span className='underline'>
          Liste
        </span>
        /
        <Link href='/groups/overview'>
          Oversikt
        </Link>
      </div>
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewGroups}
      >
        <Groups data={data} />
      </LiveQuery>
    </MainShell>
  )
}