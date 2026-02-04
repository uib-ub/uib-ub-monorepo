import { MainShell } from '@/components/shared/main-shell'
import Graph, { query } from '../_components/graph'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function GraphPage() {
  const { data } = await sanityFetch({ query, tags: ['Graph'] })

  return (
    <MainShell>
      <Graph data={data} />
    </MainShell>
  );
}