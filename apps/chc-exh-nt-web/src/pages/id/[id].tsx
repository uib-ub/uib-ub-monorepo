import { ArrowTopRightOnSquareIcon, Bars4Icon, CodeBracketSquareIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import type { GetStaticProps, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { groq } from 'next-sanity';
import dynamic from "next/dynamic";
import ErrorPage from 'next/error';
import Head from "next/head";
import NextLink from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { Layout, MarcusIcon, Menu, Palette, Pane, Spacer, Subjects, UiBIcon } from "tailwind-ui";
import { MainNav } from '../../components/Header/MainNav';
import { Description } from '../../components/Props/Description';
import { publicDocumentTypes } from '../../lib/constants';
import { item, mainNav, siteSettings } from '../../lib/queries/fragments';
import { usePreviewSubscription } from '../../lib/sanity';
import { getClient } from '../../lib/sanity.server';

const ManifestViewer = dynamic(() => import("../../components/IIIF/ManifestViewer"), {
  ssr: false,
});

interface IData {
  item: any
  siteSettings: any
  mainNav: any
}

/**
* Helper function to return the correct version of the document
* If we're in "preview mode" and have multiple documents, return the draft
*/
function filterDataToSingleItem(data: IData, preview: boolean) {
  if (!Array.isArray(data)) return data

  return data.item.length > 1 && preview
    ? data.item.filter((item: any) => item._id.startsWith(`drafts.`)).slice(-1)[0]
    : data.item.slice(-1)[0]
}

const idsQuery = groq`
  *[_type in $publicDocumentTypes] {
    _id
  }
`

const typeQuery = groq`
  *[_id == $id][0] {
    _type
  }
`

export const getStaticProps: GetStaticProps = async ({ params, locale, preview = false }) => {
  //console.log('Params: ', params)
  const ID = typeof params?.id === 'string' ? params.id : params?.id?.pop()
  const { _type: type, notFound = false } = await getClient(preview).fetch(typeQuery, { id: ID })
  //console.log('Type: ', type)

  if (notFound === true) return { notFound }

  const query = `{
    'item': *[_id == $id] {
      ${type === 'HumanMadeObject' ? item : ''}
    },
    ${siteSettings},
    ${mainNav}
  }`

  const queryParams = { id: ID, language: locale }
  const data = await getClient(preview).fetch(query, queryParams)

  // console.log(JSON.stringify(data, null, 2))

  // Escape hatch, if our query failed to return data
  if (!data) return { notFound: true }

  // Helper function to reduce all returned documents down to just one
  const page = filterDataToSingleItem(data, preview)
  // console.log(JSON.stringify(page, null, 2))

  return {
    props: {
      // Pass down the "preview mode" boolean to the client-side
      preview,
      // Pass down the initial content, and our query
      data: { page, query, queryParams },
      messages: (await import(`../../messages/${locale}.json`)).default
    },
  }
}

export async function getStaticPaths() {
  const results = await getClient().fetch(idsQuery, { publicDocumentTypes })
  //console.log('Results: ', results)
  return {
    paths: [
      ...results?.map((item: any) => ({
        params: {
          id: item._id,
          locale: 'en'
        },
      })),
      ...results?.map((item: any) => ({
        params: {
          id: item._id,
          locale: 'no'
        },
      })),
      ...results?.map((item: any) => ({
        params: {
          id: item._id,
          locale: 'ar'
        },
      }))
    ] || [],
    fallback: 'blocking',
  }
}


const Id: NextPage = ({ data, preview }: any) => {
  const { locale, isFallback }: NextRouter = useRouter()
  const t = useTranslations('Nav');

  const { data: previewData } = usePreviewSubscription(data?.query, {
    params: data?.queryParams ?? {},
    // The hook will return this on first render
    // This is why it's important to fetch *draft* content server-side!
    initialData: data?.page,
    // The passed-down preview context determines whether this function does anything
    enabled: preview,
  })

  // This includes setting the noindex header because static files always return a status 200 but the rendered not found page page should obviously not be indexed
  if (!isFallback && !data?.page?.item?.[0]?._id) {
    return <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <ErrorPage statusCode={404} />
    </>
  }

  // Client-side uses the same query, so we may need to filter it down again
  const page = filterDataToSingleItem(previewData, preview)
  // Get Open Graph images in different sizes
  // const openGraphImages = getOpenGraphImages(page?.item[0]?.image, page?.item[0]?.label[locale])

  // Notice the optional?.chaining conditionals wrapping every piece of content?
  // This is extremely important as you can't ever rely on a single field
  // of data existing when Editors are creating new documents.
  // It'll be completely blank when they start!

  const { siteSettings: { label, description, identifiedBy }, mainNav, item } = page
  const title = identifiedBy.filter((name: any) => name.language[0] === locale)[0].title

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
            <div className='gap-5 text-sm dark:text-neutral-300 text-neutral-700 px-5 py-3'>
              <div>{t('partOfMarcus')} <a href='https://marcus.uib.no' target='_blank' rel="noreferrer">Marcus <ArrowTopRightOnSquareIcon className='inline h-4 w-4' /></a></div>
            </div>
          </Menu>
        }
      >
        <main className='md:flex md:flex-grow min-h-screen'>
          {/* <Pane intent='aside'>
            <div>
              <SanityImage
                image={item[0].image}
                alt={''}
                className='hidden sm:block object-contain object-left md:max-h-72'
              />
            </div>


            <h1 className='text-3xl md:text-2xl lg:text-3xl'>{item[0].label[locale || ''] || `Missing ${locale} title`}</h1>

            {item[0]?.activityStream && item[0].activityStream
              .filter((activity: any) => ['crm:BeginningOfExistence', 'crm:Production'].includes(activity.subType))
              .map((activity: any) => (
                <div key={activity._id || activity._key}>
                  <div>{activity.contributionAssignedBy?.[0].assignedActor?.label[locale || ''] || Object.values(activity.contributionAssignedBy?.[0].assignedActor?.label)[1]}</div>
                  <div className='text-xs text-slate-700 dark:text-slate-300 m-0 p-0'>{activity.timespan?.edtf}</div>
                  <div className='flex flex-col text-xs font-light'>
                    {activity.usedGeneralTechnique && activity.usedGeneralTechnique.map((t: any) => (
                      <div key={t._id ?? item._key}>{t.label[locale || '']}</div>
                    ))}
                  </div>
                </div>
              ))
            }

            {item[0]?.subject ?
              <Subjects value={item[0]?.subject} language={locale || ''} />
              : null
            }

            <Spacer />

            {item[0]?.depicts.some((depiction: any) => depiction._type === "Place") ?
              item[0]?.depicts
                .map((place: any) => (
                  <div key={place._id || place._key}>
                    <div>{place.label[locale || '']}</div>
                  </div>
                )) : null
            }

            {item[0]?.depicts.some((depiction: any) => depiction._type === "Place") ? (
              <Minimap
                label={item[0]?.depicts?.[0].label[locale ?? '']}
                lnglat={[item[0]?.depicts?.[0].definedBy?.lng, item[0]?.depicts?.[0].definedBy?.lat]}
              />
            ) : null}

            <div className='flex flex-col gap-1 my-3'>
              {item[0]?.preferredIdentifier ?
                <div className='flex gap-1 items-center font-light text-xs text-gray-700 dark:text-gray-300 mb-1'>
                  <IdentificationIcon className='w-5 h-5' />
                  <p className='text-xs dark:text-gray-300'>{item[0]?.preferredIdentifier}</p>

                  <Spacer />

                  <NextLink
                    href={`https://api-ub.vercel.app/items/${item[0]?.preferredIdentifier}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    <CodeBracketSquareIcon className='w-5 h-5' />
                    <span className="sr-only">JSON data</span>
                  </NextLink>
                </div>
                : null
              }

              {item[0]?.image?.palette ?
                <Palette colors={item[0]?.image?.palette} />
                : null
              }
            </div>
          </Pane> */}

          <Pane intent='content'>
            {item[0]?.manifest ?
              <div className='min-h-[70vh] mb-5 border border-neutral-300 shadow-lg'>
                {/* @ts-ignore */}
                <ManifestViewer
                  id={item[0].manifest}
                  options={{
                    canvasHeight: '70vh',
                    renderAbout: false,
                    showIIIFBadge: false,
                    showTitle: false,
                    showInformationToggle: false,
                  }}
                />
              </div>
              : null
            }

            <div className='flex flex-col flex-wrap justify-center gap-3'>
              <h1 className='sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'>{item[0].label[locale!] ?? item[0].label['en']}</h1>

              {item[0]?.referredToBy ?
                <div className='max-w-prose xl:text-xl text-light'>
                  <Description value={item[0]?.referredToBy} language={locale || ''} />
                </div>
                : null
              }


              {item[0]?.activityStream && item[0].activityStream
                .filter((activity: any) => ['crm:BeginningOfExistence', 'crm:Production'].includes(activity.subType))
                .map((activity: any) => (
                  <div key={activity._key} className='flex flex-wrap items-baseline gap-3'>
                    <div className='w-24 flex-grow-0 text-sm font-light'>
                      {t('production')}
                    </div>
                    <div key={activity._id || activity._key}>
                      <div>{activity.contributionAssignedBy?.[0].assignedActor?.label[locale || ''] || Object.values(activity.contributionAssignedBy?.[0].assignedActor?.label)[1]}</div>
                      <div className='text-xs text-slate-700 dark:text-slate-300 m-0 p-0'>{activity.timespan?.edtf}</div>
                      <div className='flex flex-col text-xs font-light'>
                        {activity.usedGeneralTechnique && activity.usedGeneralTechnique.map((t: any) => (
                          <div key={t._id ?? item._key}>{t.label[locale || '']}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              }

              {item[0]?.subject ?
                <div className='flex flex-wrap items-baseline gap-3'>
                  <div className='w-24 flex-grow-0 text-sm font-light'>
                    {t('subjects')}
                  </div>
                  <Subjects value={item[0]?.subject} language={locale} />
                </div>
                : null
              }


              {item[0]?.depicts?.some((depiction: any) => depiction._type === "Place") ?
                item[0]?.depicts
                  .map((place: any) => (
                    <div key={place._id || place._key}>
                      <div>{place.label[locale || '']}</div>
                    </div>
                  )) : null
              }

              {/* {item[0]?.depicts?.some((depiction: any) => depiction._type === "Place") ? (
                <Minimap
                  label={item[0]?.depicts?.[0].label[locale ?? 'en']}
                  lnglat={[item[0]?.depicts?.[0].definedBy?.lng, item[0]?.depicts?.[0].definedBy?.lat]}
                />
              ) : null} */}

              <div className='flex flex-col gap-1 my-3'>
                {item[0]?.preferredIdentifier ?
                  <div className='flex gap-1 items-center font-light text-xs text-gray-700 dark:text-gray-300 mb-1'>
                    <IdentificationIcon className='w-5 h-5' />
                    <p className='text-xs dark:text-gray-300'>{item[0]?.preferredIdentifier}</p>

                    <Spacer />

                    <a
                      href={`https://api-ub.vercel.app/items/${item[0]?.preferredIdentifier}`}
                      target='_blank'
                      rel='noreferrer'
                    >
                      <CodeBracketSquareIcon className='w-5 h-5' />
                      <span className="sr-only">JSON data</span>
                    </a>
                  </div>
                  : null
                }

                {item[0]?.image?.palette ?
                  <Palette colors={item[0]?.image?.palette} />
                  : null
                }
              </div>

            </div>
          </Pane>
        </main>

      </Layout>

    </>
  );
};

export default Id;
