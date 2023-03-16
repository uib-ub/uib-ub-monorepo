import { Page } from 'components/pages/page/Page'
import { PagePreview } from 'components/pages/page/PagePreview'
import { PreviewSuspense } from 'components/preview/PreviewSuspense'
import { PreviewWrapper } from 'components/preview/PreviewWrapper'
import { getHomePageTitle, getPageBySlug, getSettings } from 'lib/sanity/sanity.client'
import { getPreviewToken } from 'lib/sanity/sanity.server.preview'
import { notFound } from 'next/navigation'
import { toPlainText } from '@portabletext/react'

export async function generateMetadata() {
  const token = getPreviewToken()

  const [homePageTitle, page, settings] = await Promise.all([
    getHomePageTitle({ token }),
    getPageBySlug({ slug: 'about', token }),
    getSettings({ token }),
  ])

  return {
    baseTitle: homePageTitle,
    description: page?.overview ? toPlainText(page.overview) : '',
    image: settings?.ogImage,
    title: page?.title,
  }
}

export default async function PageSlugRoute({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const token = getPreviewToken()
  const data = await getPageBySlug({ slug })

  if (!data && !token) {
    notFound()
  }

  return (
    <>
      {token ? (
        <PreviewSuspense
          fallback={
            <PreviewWrapper>
              <Page data={data!} />
            </PreviewWrapper>
          }
        >
          <PagePreview token={token} slug={params.slug} />
        </PreviewSuspense>
      ) : (
        <Page data={data!} />
      )}
    </>
  )
}


/* 



export default async function PageHead() {
  const token = getPreviewToken()

  const [homePageTitle, page, settings] = await Promise.all([
    getHomePageTitle({ token }),
    getPageBySlug({ slug: 'about', token }),
    getSettings({ token }),
  ])

  return (
    <SiteMeta
      baseTitle={homePageTitle}
      description={page?.overview ? toPlainText(page.overview) : ''}
      image={settings?.ogImage}
      title={page?.title}
    />
  )
}

*/