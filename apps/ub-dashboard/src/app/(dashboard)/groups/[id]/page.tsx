import { MainShell } from '@/components/shared/main-shell'
import Group, { query } from '../_components/group'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function GroupPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const { data } = await sanityFetch({ query, params: { id: params.id }, tags: [`Group:${params.id}`] })

  return (
    <MainShell>
      <Group data={data} />
    </MainShell>
  );
}