import { Footer } from '@/src/app/_components/Footer'
import { sanityFetch } from '@/src/sanity/lib/fetch'
import { setRequestLocale } from 'next-intl/server'
import { groq, stegaClean } from 'next-sanity'
import { routeQuery } from '@/src/sanity/lib/queries/routeQuery'
import { Link } from '@/src/i18n/routing'
import React from 'react'
import { TextBlocks } from '@/src/app/_components/TextBlocks'
import { getTranslations } from 'next-intl/server'
import SanityImage from '@/src/app/_components/SanityImage'
import { urlFor } from '@/src/sanity/lib/utils'

/* export async function generateStaticParams() {
  const routesQuery = groq`
    *[ _type == "Route" && defined(slug.current) && defined(page)] {
    "locales": [
      {
        "lang": page->.language,
        "slug": [slug.current]
      },
      ...page->.__i18n_refs[]->{
        "lang": language,
        "slug": [^.slug.current]
      }
    ],
  }`

  const routes = await sanityFetch({ query: routesQuery, perspective: 'published', stega: false })
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
} */

async function getData(lang: string, slug: string[]) {
  const data = sanityFetch({ query: routeQuery, params: { slug: slug[0], language: lang }, perspective: 'published', stega: false })
  return data
}

export async function generateMetadata({
  params
}: {
  params: { lang: string, slug: string[] }
}) {
  const { lang, slug } = await params;
  const data = await getData(lang, slug);
  const page = data[0].translation.find((item: any) => item.language === lang) ?? data[0].translation.find((item: any) => item.language === 'no')

  return {
    title: stegaClean(page?.label),
    description: stegaClean(page?.excerpt),
    openGraph: {
      title: stegaClean(page?.label),
      description: stegaClean(page?.excerpt),
      locale: lang,
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: stegaClean(page?.label),
      description: stegaClean(page?.excerpt),
      images: page?.about?.image ? [urlFor(page?.about?.image)?.url()] : []
    }
  }
}


export default async function Page({ params }: { params: { lang: string, slug: string[] } }) {
  const { lang, slug } = await params
  const data = await getData(lang, slug);
  const page = data[0].translation.find((item: any) => item.language === lang) ?? data[0].translation.find((item: any) => item.language === 'no')
  const localeCaption = page.about?.caption?.filter((i: any) => stegaClean(i.language) === lang)[0]?.body

  // Enable static rendering
  setRequestLocale(lang)
  const t = await getTranslations('Page')

  return (
    <div className='p-5 pt-16'>
      {/* <code>
        <pre className='text-xs'>
          {JSON.stringify(page.about, null, 2)}
        </pre>
      </code> */}
      <div className='flex flex-col gap-10 items-center'>
        {page?.about?.image && (
          <figure className='flex flex-col gap-2 md:w-2/3 lg:w-1/2 max-h-[70vh] relative'>
            {page?.about?.preferredIdentifier.startsWith('ubb') ?
              <Link href={`/id/${stegaClean(page?.about?.preferredIdentifier)}`}>
                <SanityImage
                  image={page?.about?.image}
                  className="w-full max-h-[65vh]"
                />
              </Link> :
              <SanityImage
                image={page?.about?.image}
                className="w-full max-h-[65vh]"
              />}
            {localeCaption && <figcaption className='text-sm text-center mx-auto md:w-2/3 lg:w-1/2 font-light text-neutral-700 dark:text-neutral-300'><TextBlocks value={localeCaption} /></figcaption>}
          </figure>
        )}

        <div className='text-center md:w-10/12'>
          <h1 className='text-2xl sm:text-4xl lg:text-5xl font-black' >
            {page?.label}
          </h1>
          {page?.creator ? (
            <div className='mt-1 text-lg text-neutral-800 dark:text-neutral-300 font-serif' >
              <div>•••</div>
              <i>
                {t('by')}
              </i> {' '}
              <span>
                {page?.creator && page?.creator.map((person: any, i: any) => (
                  <React.Fragment key={person._key}>
                    <span className='font-bold'>
                      {person.assignedActor.label[lang]}
                    </span>
                    {i === page?.creator.length - 2 ? ` ${t('combinator')} ` : null}
                    {i < page?.creator.length - 2 ? ', ' : null}
                  </React.Fragment>
                ))}
              </span>
            </div>
          ) : null}
        </div>
      </div >

      <div className='mt-5 pb-20 grid gap-y-4 grid-cols-content font-light font-serif text-lg'>
        {page?.body && <TextBlocks value={page?.body} />}
      </div>

      <Footer locale={lang} className='mx-auto flex justify-center items-center h-screen' />
    </div>
  )
}
