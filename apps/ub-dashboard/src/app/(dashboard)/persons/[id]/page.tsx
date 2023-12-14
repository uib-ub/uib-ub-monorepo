import { MainShell } from '@/components/shared/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Person, { query } from '../_components/person'
import PreviewPerson from '../_components/preview-person'
import { sanityFetch } from '@/sanity/lib/fetch'
import { getServerSession } from 'next-auth'
import { PersonProps } from '@/types'
import FantasyPerson from '../_components/fantasy-person'

export default async function PersonPage({
  params,
}: {
  params: any
}) {
  const session = await getServerSession()
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
        {/* session?.user?.email === 'caroline.armitage@uib.no' &&  */params.id === '381155bf-fc3b-40b3-bdcc-2cec4975d2f7' ? (
          <FantasyPerson data={data} />
        ) : (
          <Person data={data} />
        )
        }
      </LiveQuery>
    </MainShell>
  )
}