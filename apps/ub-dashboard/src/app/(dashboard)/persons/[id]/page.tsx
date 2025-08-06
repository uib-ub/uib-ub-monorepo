import { MainShell } from '@/components/shared/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Person, { query } from '../_components/person'
import PreviewPerson from '../_components/preview-person'
import { sanityFetch } from '@/sanity/lib/fetch'
import { auth } from "@/auth"
import { PersonProps } from '@/types'
import FantasyPerson from '../_components/fantasy-person'

export default async function PersonPage(
  props: {
    params: Promise<any>
  }
) {
  const params = await props.params;
  const session = await auth()
  const data = await sanityFetch({ query, params: { id: params.id }, tags: [`Actor:${params.id}`] })

  const isFantasyPerson = ['caroline.armitage@uib.no', 'tarje.lavik@uib.no'].includes(session?.user?.email ?? '') && ['381155bf-fc3b-40b3-bdcc-2cec4975d2f7', '6747ea34-a8f3-43cb-adf0-037c1ab2b6fd'].includes(params.id ?? '')

  return (
    <MainShell>
      <LiveQuery
        enabled={(await draftMode()).isEnabled}
        query={query}
        params={params}
        initialData={data}
        as={PreviewPerson}
      >
        {isFantasyPerson ? (
          <FantasyPerson data={data} />
        ) : (
          <Person data={data} />
        )
        }
      </LiveQuery>
    </MainShell>
  );
}