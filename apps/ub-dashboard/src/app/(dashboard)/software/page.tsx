import Software, { query } from './_components/software-list'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'

export default async function SoftwarePage() {
  const { data } = await sanityFetch({ query })

  return (
    <MainShell>
      <h1 className='mb-2'>Programvare</h1>
      <Software data={data} />
    </MainShell>
  );
}