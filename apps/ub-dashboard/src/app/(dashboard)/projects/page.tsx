import Projects, { query } from './_components/projects'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'

export default async function ProjectsPage() {
  const { data } = await sanityFetch({ query })

  return (
    <MainShell>
      <h1>Prosjekt</h1>
      <Projects data={data} />
    </MainShell>
  );
}