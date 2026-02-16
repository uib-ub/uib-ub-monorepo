import { MainShell } from '@/components/shared/main-shell'
import Software, { query } from '../_components/software'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function ProjectPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const { data } = await sanityFetch({ query, params: { id: params.id }, tags: [`Software:${params.id}`] })

  return (
    <MainShell>
      <Software data={data} />
    </MainShell>
  );
}