import { MainShell } from '@/components/shared/main-shell'
import { LiveQuery } from 'next-sanity/preview/live-query'
import { draftMode } from 'next/headers'
import Project, { query, ProjectProps } from '../_components/project'
import PreviewGroup from '../_components/preview-project'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function ProjectPage(
  props: {
    params: Promise<any>
  }
) {
  const params = await props.params;
  const data = await sanityFetch({ query, params: { id: params.id }, tags: [`Project:${params.id}`] })

  return (
    <MainShell>
      <LiveQuery
        enabled={(await draftMode()).isEnabled}
        query={query}
        params={params}
        initialData={data}
        as={PreviewGroup}
      >
        <Project data={data} />
      </LiveQuery>
    </MainShell>
  );
}