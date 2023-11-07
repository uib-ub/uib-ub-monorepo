import { draftMode } from 'next/headers'
import { LiveQuery } from 'next-sanity/preview/live-query'
import Links, { query, accessPointQuery } from './_components/links'
import { sanityFetch } from '@/sanity/lib/fetch'
import { MainShell } from '@/components/main-shell'
import PreviewLinks from './_components/preview-links'

export default async function LinksPage() {
  const links = await sanityFetch<any[]>({ query, revalidate: 7200 })
  const accessPoints = await sanityFetch<any[]>({ query: accessPointQuery, revalidate: 7200 })

  const [urls, accessPointLinks] = await Promise.all([links, accessPoints])

  const extractAccessPoints = (accessPointLinks: any[]) => {
    return accessPointLinks.reduce((acc, curr) => {
      return [...acc, ...curr.accessPoint]
    }, [])
  }

  const data = [
    ...urls,
    ...extractAccessPoints(accessPointLinks),
  ]


  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-2'>
        <h1>Lenker</h1>
      </div>
      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
      <LiveQuery
        enabled={draftMode().isEnabled}
        query={query}
        initialData={data}
        as={PreviewLinks}
      >
        <Links data={data} />
      </LiveQuery>
    </MainShell>
  )
}