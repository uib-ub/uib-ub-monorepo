import Deprecated, { query } from './_components/deprecated'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/shared/main-shell'

export default async function DeprecatedPage() {
  const { data } = await sanityFetch({ query })

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-2'>
        <h1>Utfasede typer</h1>
      </div>
      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
      <Deprecated data={data} />
    </MainShell>
  );
}