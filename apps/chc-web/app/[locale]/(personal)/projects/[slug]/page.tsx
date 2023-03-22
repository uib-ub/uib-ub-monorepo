import { toPlainText } from '@portabletext/react'
import { ProjectPage } from 'components/pages/project/ProjectPage'
import { ProjectPreview } from 'components/pages/project/ProjectPreview'
import { PreviewSuspense } from 'components/preview/PreviewSuspense'
import { PreviewWrapper } from 'components/preview/PreviewWrapper'
import { getProjectBySlug, getHomePageTitle } from 'lib/sanity/sanity.client'
import { getPreviewToken } from 'lib/sanity/sanity.server.preview'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}) {
  const token = getPreviewToken()

  const [homePageTitle, project] = await Promise.all([
    getHomePageTitle({ token }),
    getProjectBySlug({ slug: params.slug, token }),
  ])

  return {
    baseTitle: homePageTitle,
    description: project?.overview ? toPlainText(project.overview) : '',
    image: project?.coverImage,
    title: project?.title,
  }
}

export default async function ProjectSlugRoute({
  params,
}: {
  params: { slug: string }
}) {
  const token = getPreviewToken()
  const data = await getProjectBySlug({ slug: params.slug })

  if (!data && !token) {
    notFound()
  }

  return (
    <>
      {token ? (
        <PreviewSuspense
          fallback={
            <PreviewWrapper>
              <ProjectPage data={data!} />
            </PreviewWrapper>
          }
        >
          <ProjectPreview token={token} slug={params.slug} />
        </PreviewSuspense>
      ) : (
        <ProjectPage data={data!} />
      )}
    </>
  )
}
