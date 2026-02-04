import GroupsOverview, { query } from '../_components/groups-overview'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'
import Link from 'next/link'

export default async function GroupsPage() {
  const { data } = await sanityFetch({ query })

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
      <GroupsOverview data={data} />
    </MainShell>
  );
}