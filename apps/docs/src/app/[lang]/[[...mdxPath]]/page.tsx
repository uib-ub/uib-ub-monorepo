import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: { params: Promise<{ mdxPath: string[]; lang: string }> }) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath, params.lang)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props: { params: Promise<{ mdxPath: string[]; lang: string }> }) {
  const params = await props.params
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode
  } = await importPage(params.mdxPath, params.lang)
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}