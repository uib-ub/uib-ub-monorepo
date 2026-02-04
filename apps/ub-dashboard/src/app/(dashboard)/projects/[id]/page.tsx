import { MainShell } from '@/components/shared/main-shell'
import Project, { query } from '../_components/project'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function ProjectPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const { data } = await sanityFetch({ query, params: { id: params.id }, tags: [`Project:${params.id}`] })

  return (
    <MainShell>
      <Project data={data} />
    </MainShell>
  );
}