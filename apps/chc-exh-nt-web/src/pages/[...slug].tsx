import { ArrowTopRightOnSquareIcon, Bars4Icon } from '@heroicons/react/24/outline'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useTranslations } from 'next-intl'
import { groq } from 'next-sanity'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Hero, Layout, Link, MarcusIcon, Menu, Pane, UiBIcon } from 'tailwind-ui'
import { Footer } from '../components/Footer'
import { MainNav } from '../components/Header/MainNav'
import SanityImage from '../components/SanityImage'
import { TextBlocks } from '../components/TextBlocks'
import { filterDataToSingleItem } from '../lib/functions'
import { routeQuery } from '../lib/queries/routeQuery'
import { usePreviewSubscription } from '../lib/sanity'
import { getClient } from '../lib/sanity.server'

export const getStaticPaths: GetStaticPaths = async () => {
  const routesQuery = groq`
    *[ _type == "Route" && defined(slug.current) && defined(page)] {
    "locales": [
      {
        "lang": page->.__i18n_lang,
        "slug": [slug.current]
      },
      ...page->.__i18n_refs[]->{
        "lang": __i18n_lang,
        "slug": [^.slug.current]
      }
    ],
  }`

  const routes = await getClient().fetch(routesQuery)
  const paths = routes?.map((route: any) => (
    route.locales.map((locale: any) => ({
      params: {
        "slug": locale.slug,
        "locale": locale.lang
      }
    }))
  )) || []

  return {
    paths: paths[0],
    fallback: 'blocking',
  }
}
export const getStaticProps: GetStaticProps = async ({ params, locale, preview = false }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : params?.slug?.join('/')
  const query = routeQuery
  const queryParams = { slug: slug, language: locale }
  const page = await getClient(preview).fetch(routeQuery, queryParams)

  // Escape hatch, if our query failed to return data
  if (!page) return { notFound: true }

  // Helper function to reduce all returned documents down to just one
  // const page = filterDataToSingleItem(data, preview)

  return {
    props: {
      // Pass down the "preview mode" boolean to the client-side
      preview,
      // Pass down the initial content, and our query
      data: { page, query, queryParams },
      messages: (await import(`../messages/${locale}.json`)).default
    },
  }
}

const Page: NextPage = ({ data, preview }: any) => {
  const { locale, defaultLocale } = useRouter()
  const t = useTranslations('Nav');

  const { data: previewData } = usePreviewSubscription(data?.query, {
    params: data?.queryParams ?? {},
    // The hook will return this on first render
    // This is why it's important to fetch *draft* content server-side!
    initialData: data?.page,
    // The passed-down preview context determines whether this function does anything
    enabled: preview,
  })

  // Client-side uses the same query, so we may need to filter it down again
  const page = filterDataToSingleItem(previewData, preview)
  //console.log(JSON.stringify(page, null, 2))

  const { mainNav, siteSettings: { label, description, identifiedBy } } = page
  const title = identifiedBy.filter((name: any) => name.language[0] === locale)[0].title

  {/* If LinguisticDocument the content is in the body field */ }
  const slug = page?.route[0]?.locale[0] ?? page?.route[0]?.fallback[0]
  const linguisticDocumentBody = page?.route[0]?.locale[0]?.body ?? page?.route[0]?.fallback[0]?.body

  const localeCaption = slug?.about?.caption?.filter((i: any) => i.language === locale)[0]?.body

  const aboutImage = slug?.about ?
    <SanityImage
      image={slug.about.image}
      type='responsive'
      alt={slug.about.image?.alt ?? ''}
      priority
    /> : null

  const heroImage = slug?.image ? <SanityImage
    image={slug.image}
    type='responsive'
    alt={slug.image?.alt ?? ''}
    priority
  /> : null

  // Notice the optional?.chaining conditionals wrapping every piece of content?
  // This is extremely important as you can't ever rely on a single field
  // of data existing when Editors are creating new documents.
  // It'll be completely blank when they start!
  return (
    <>
      <Head>
        <title>{label[locale || 'no']}</title>
        <meta name="description" content={description[locale || 'no']} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout
        data={page}
        title={
          <NextLink href={`/`} className='text-neutral-800 dark:text-neutral-200 font-bold'>
            {title}
          </NextLink>
        }
        nav={
          <div className='flex sm:flex-col gap-2'>
            <UiBIcon className='max-sm:w-6 max-sm:h-6 md:w-8 md:h-8 text-neutral-800 dark:text-neutral-100 dark:hover:text-neutral-200' />
            <MainNav
              title={t('menu')}
              aria-label='primary navigation'
              buttonLabel={
                <div className='gap-1 flex md:flex-col backdrop-blur-sm rounded items-center'>
                  <Bars4Icon className={'max-sm:w-5 max-sm:h-5 sm:w-6 sm:h-6'} />
                  <div className='max-md:sr-only'>{t('menu')}</div>
                </div>
              }
              value={mainNav}
            />
          </div>
        }
        icon={
          <Menu
            aria-label='secondary navigation'
            button={
              <MarcusIcon className='max-sm:w-6 max-sm:h-6 md:w-8 md:h-8 text-neutral-700 hover:text-neutral-800 dark:text-neutral-200 dark:hover:text-neutral-200' />
            }>
            <div className={`gap-5 ${locale === 'ar' ? 'text-xl ' : 'text-sm'} dark:text-neutral-300 text-neutral-700 px-5 py-3`}>
              <div>{t('partOfMarcus')} <a href='https://marcus.uib.no' target='_blank' rel="noreferrer">Marcus <ArrowTopRightOnSquareIcon className='inline h-4 w-4' /></a></div>
            </div>
          </Menu>
        }
      >
        <Pane intent='content'>
          <main className='flex flex-col mt-5 mb-20'>
            <Hero
              label={slug?.label ?? title}
              image={aboutImage || heroImage || null}
              figCaption={
                <figcaption className='flex gap-1 justify-end mt-1 font-light text-sm text-neutral-500 dark:text-neutral-400'>
                  <TextBlocks value={slug?.about?.description} />
                  <div key={slug?.about?._id}>
                    <p className='font-light text-sm'>
                      <i>
                        <Link href={`/id/${slug?.about?._id}`}>
                          {slug?.about?.label[locale!] ?? slug?.about?.label[defaultLocale!]}
                        </Link>
                      </i>

                      {/* {slug?.about?.hasCurrentOwner?.length && `. ${slug?.about?.hasCurrentOwner[0].label[locale ?? ''] ?? slug?.about.objectMetadata?.hasCurrentOwner[0].label[defaultLocale ?? '']}.`} */}
                    </p>
                  </div>
                </figcaption>
              }
              creators={slug?.creator}
              locale={locale || ''}
            />

            <div className='mt-5 mb-54 grid grid-cols-content font-light font-serif text-lg'>
              {linguisticDocumentBody && <TextBlocks value={linguisticDocumentBody} />}
              {!linguisticDocumentBody && (<div className='col-start-1 col-end-6 md:col-start-3 md:col-end-4 text-center text-4xl'>غير مترجمة</div>)} {/* "Not translated" */}
            </div>
          </main>
          <Footer locale={locale} />
        </Pane>
      </Layout>
    </>
  )
}

export default Page