import { sanityFetch } from '@/src/sanity/lib/fetch'
import { item } from '@/src/sanity/lib/queries/fragments'
import { getTranslations } from 'next-intl/server'
import { Description } from '@/src/components/Props/Description'
import { CodeBracketSquareIcon, IdentificationIcon, SwatchIcon } from '@heroicons/react/24/outline'
import ManifestViewer from "@/src/components/IIIF/ManifestViewer"
import { Subjects } from '@/src/components/Props/Subjects'
import { Palette } from '@/src/components/Props/Palette'
import { getLabel } from '@/src/lib/utils'
import { Footer } from '@/src/components/Footer'
import { stegaClean } from 'next-sanity'

const getItem = async (id: string, lang: string) => {
  const data = await sanityFetch({
    query: item,
    params: { id, language: lang },
    perspective: 'published',
    stega: false
  })
  return data.find((item: any) => item._id === id)
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string, id: string }> }) {
  const { lang, id } = await params
  const item = await getItem(id, lang)

  return {
    title: stegaClean(item?.label[lang]),
    description: stegaClean(item?.excerpt || ''),
    openGraph: {
      title: stegaClean(item?.label[lang]),
      // description: stegaClean(subtitle[0] ?? subtitle),
      locale: lang,
      type: 'article'
    },
  }
}

export default async function ItemPage({ params }: { params: Promise<{ lang: string, id: string }> }) {
  const { lang, id } = await params
  const item = await getItem(id, lang)
  console.log("🚀 ~ ItemPage ~ item:", item)
  const t = await getTranslations('Item')

  if (!item) {
    return <div>Item not found</div>
  }
  let sanitizedManifest = stegaClean(item.manifest)

  const isValidManifest = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return url.startsWith('/')
    }
  }

  if (!sanitizedManifest || !isValidManifest(sanitizedManifest)) {
    console.error('Invalid manifest URL:', sanitizedManifest)
    return <div>Invalid manifest URL</div>
  }

  if (!sanitizedManifest.startsWith('/')) {
    sanitizedManifest = sanitizedManifest
      .replace('api-ub.vercel.app', 'api.ub.uib.no')
      .replace('/manifest', '?as=iiif')
  }

  const renderManifestViewer = () => {
    try {
      const encodedManifest = (sanitizedManifest)

      return (
        <ManifestViewer
          iiifContent={encodedManifest}
          options={{
            canvasHeight: '65vh',
            showIIIFBadge: false,
            showTitle: false,
            informationPanel: {
              open: false,
              renderToggle: true,
              renderAbout: true,
              renderContentSearch: false
            }
          }}
        />
      )
    } catch (error) {
      console.error('ManifestViewer error:', error)
      console.log('Problematic manifest URL:', sanitizedManifest)
      return <div>Error loading manifest viewer</div>
    }
  }

  return (
    <div>
      <div className='flex flex-col md:flex-grow min-h-screen p-5'>
        {/*  <code>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </code> */}

        {sanitizedManifest && (
          <div className='min-h-[65vh] mb-5 border border-neutral-300 dark:border-neutral-700 shadow-lg bg-neutral-100 dark:bg-neutral-900'>
            {renderManifestViewer()}
          </div>
        )}

        <div className='flex flex-col flex-wrap justify-center gap-5'>
          <h1 className='sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'>{item.label[lang]}</h1>

          {/* {item.referredToBy && (
          <div className='max-w-prose xl:text-lg text-light'>
            <Description value={item.referredToBy} language={lang} />
          </div>
        )} */}

          {item.activityStream && item.activityStream
            .filter((activity: any) => ['crm:BeginningOfExistence', 'crm:Production'].includes(activity.subType))
            .map((activity: any) => (
              <div key={activity._key} className='flex flex-wrap items-baseline gap-3'>
                <div className='w-24 flex-grow-0 text-sm font-light'>
                  {t('production')}
                </div>
                <div key={activity._id || activity._key}>
                  {activity.contributionAssignedBy.map((assigned: any) => (
                    <div key={assigned._id || assigned._key}>{getLabel(assigned.assignedActor?.label, lang)}</div>
                  ))}
                  <div className='text-xs text-slate-700 dark:text-slate-300 m-0 p-0'>{activity.timespan?.edtf}</div>
                  <div className='flex flex-col text-xs font-light'>
                    {activity.usedGeneralTechnique && activity.usedGeneralTechnique.map((t: any) => (
                      <div key={t._id ?? item._key}>{t.label[lang]}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          }

          {item.subject ?
            <div className='flex flex-wrap items-baseline gap-3'>
              <div className='w-24 flex-grow-0 text-sm font-light'>
                {t('subjects')}
              </div>
              <Subjects value={item.subject} language={lang} />
            </div>
            : null
          }


          {item.depicts?.some((depiction: any) => depiction._type === "Place") ?
            item.depicts
              .map((place: any) => (
                <div key={place._id || place._key}>
                  <div>{place.label[lang]}</div>
                </div>
              )) : null
          }

          <div className='flex flex-col gap-1 my-3'>
            {item.preferredIdentifier ?
              <div className='flex gap-1 items-center font-light text-xs text-gray-700 dark:text-gray-300 mb-1'>
                <IdentificationIcon className='w-5 h-5' />
                <p className='text-xs dark:text-gray-300'>{item.preferredIdentifier}</p>

                <a
                  href={`https://api.ub.uib.no/items/${stegaClean(item.preferredIdentifier)}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  <CodeBracketSquareIcon className='w-5 h-5' />
                  <span className="sr-only">JSON data</span>
                </a>
              </div>
              : null
            }

            {/* {item.image?.palette ?
            <div>
              <div className='flex gap-1 items-center text-xs font-light dark:text-neutral-200 text-neutral-800 mb-1'>
                <SwatchIcon className='w-5 h-5' />
                {t('palette')}
              </div>
              <Palette colors={item.image?.palette} />
            </div>
            : null
          } */}
          </div>
        </div>

      </div>
      <Footer locale={lang} className='mx-auto flex justify-center items-center h-screen' />
    </div>
  )
}

/* export async function generateStaticParams() {
  const results = await sanityFetch({
    query: `*[_type in $publicDocumentTypes]._id`,
    params: { publicDocumentTypes }
  })

  return results.flatMap((id: string) => [
    { lang: 'en', id },
    { lang: 'no', id }
  ])
}
 */