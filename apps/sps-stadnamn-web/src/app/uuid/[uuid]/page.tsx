import { fetchDoc } from '@/app/api/_utils/actions'
import CadastralTable from '@/components/search/details/doc/cadastral-table'
import CollapsibleHeading from '@/components/doc/collapsible-heading'
import ErrorMessage from '@/components/error-message'
import Thumbnail from '@/components/image-viewer/thumbnail'
import CoordinateInfo from '@/components/search/details/doc/coordinate-info'
import { infoPageRenderers } from '@/config/info-renderers'
import { datasetPresentation, datasetShortDescriptions, datasetTitles } from '@/config/metadata-config'
import { facetConfig, fieldConfig } from '@/config/search-config'
import { treeSettings } from '@/config/server-config'
import { getValueByPath } from '@/lib/utils'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { PiBracketsCurlyBold, PiInfoFill } from 'react-icons/pi'
import sanitizeHtml from 'sanitize-html'
import GroupList from './GroupList'
import OriginalData from './original-data'
import ServerCadastreBreadcrumb from './server-cadastre-breadcrumb'
import IconButton from '@/components/ui/icon-button'

const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim()

const toText = (value: unknown): string | undefined => {
  if (typeof value === 'string') return normalizeText(value)
  if (Array.isArray(value)) {
    const joined = value.filter((v): v is string => typeof v === 'string').join(' ')
    return joined ? normalizeText(joined) : undefined
  }
  return undefined
}

const stripAllHtml = (html: string) => normalizeText(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }))

export async function generateMetadata({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const docData = await fetchDoc({ uuid })

  const headersList = await headers()
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  const baseUrl = host ? `${proto}://${host}` : 'https://stadnamn.no'

  const title = docData?._source?.label || docData?._source?.uuid || uuid
  const resolvedUuid = docData?._source?.uuid || uuid
  const canonicalUrl = `${baseUrl}/uuid/${resolvedUuid}`

  let rawDescription = toText(docData?._source?.description) ?? toText(docData?._source?.content?.text)
  if (!rawDescription && typeof docData?._source?.content?.html === 'string') {
    rawDescription = stripAllHtml(docData?._source?.content?.html)
  }
  const description = rawDescription && rawDescription.length > 0 ? rawDescription : undefined

  // Prefer a real preview image when the record links to a IIIF manifest.
  let ogImageUrl: string | undefined
  const firstManifestId = docData?._source?.images?.[0]?.manifest
  if (typeof firstManifestId === 'string' && firstManifestId.length > 0) {
    const manifestDoc: any = await fetchDoc({ uuid: firstManifestId, dataset: 'iiif_*' })
    const manifestDataset = manifestDoc?._index?.split('-')?.[2]?.split('_')?.[1]
    const firstImageUuid = manifestDoc?._source?.images?.[0]?.uuid

    if (manifestDataset && firstImageUuid) {
      ogImageUrl = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${String(
        manifestDataset,
      ).toUpperCase()}/${firstImageUuid}/full/max/0/default.jpg`
    }
  }

  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title,
      url: canonicalUrl,
      siteName: 'stadnamn.no',
      locale: 'no_NO',
      ...(description ? { description } : {}),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    twitter: {
      card: ogImageUrl ? 'summary_large_image' : 'summary',
      title,
      ...(description ? { description } : {}),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

export default async function LandingPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const docData = await fetchDoc({ uuid })
  const docDataset = docData._index.split('-')[2]

  if (!docData || !docData._source) {
    notFound()
  }



  if (docData.error) {
    return <ErrorMessage error={docData} message="Kunne ikke hente dokumentet" />
  }

  if (docData._source.uuid != uuid && docData._source.redirects.includes(uuid)) {
    redirect(`/uuid/${docData._source.uuid}#${uuid}`)
  }

  const resolvedUuid: string = docData?._source?.uuid || uuid

  const shouldShowCadastralSubdivisions =
    !!treeSettings[docDataset] && docData?._source?.sosi == 'gard'

  // `CadastralTable` fetches subunits itself; no need to prefetch children here.



  const multivalue = (value: string | string[]) => {
    return Array.isArray(value) ? value.join("/") : value
  }

  // Get the keys of the object to use as table headers


  // TODO: create shared component for uuid/ and view/doc/
  // TODO: create tabs for info, json, geojson and jsonld
  return (
    <div className="page-info lg:grid lg:grid-cols-[1fr_24rem] lg:gap-12">
      <div className="flex flex-col gap-6">
        {docData?._source?.within && docDataset && <ServerCadastreBreadcrumb source={docData?._source} docDataset={docDataset} subunitName={treeSettings[docDataset]?.parentName} />}
        <div>
          <div className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans pb-4"> {datasetTitles[docDataset]}</div>
          <h1>{docData?._source?.label || docData?._source.uuid}</h1>
          <div className="flex flex-wrap gap-6">

            {Array.isArray(docData?._source.wikiAdm) && docData?._source.wikiAdm?.length > 1 &&
              <>
                {[docData?._source.adm1, docData?._source.adm2].filter(item => typeof item == 'string').map((item, index) => <span key={index} className="inline whitespace-nowrap pr-1">{item}, </span>)}
                {[docData?._source.adm1, docData?._source.adm2, docData?._source.adm3].find(item => Array.isArray(item))?.map((item: any, index: number) => <Link key={index} href={'http://www.wikidata.org/entity/' + docData?._source.wikiAdm[index]}>{item}</Link>)}
              </>

              || docData?._source.wikiAdm && <span className="inline whitespace-nowrap"><Link href={'http://www.wikidata.org/entity/' + docData?._source.wikiAdm}>
                {docData?._source.adm3 && multivalue(docData?._source.adm3) + " – "}
                {docData?._source.adm2 && multivalue(docData?._source.adm2) + ", "}
                {multivalue(docData?._source.adm1)}</Link> </span>
              || docData?._source.adm1 && <span className="inline whitespace-nowrap">
                {docData?._source.adm3 && multivalue(docData?._source.adm3) + " – "}
                {docData?._source.adm2 && multivalue(docData?._source.adm2) + ", "}
                {multivalue(docData?._source.adm1)}
              </span>

            }


          </div>

        </div>
        {infoPageRenderers[docDataset] ? infoPageRenderers[docDataset](docData?._source) : null}


        {facetConfig[docDataset] && (docDataset != 'mu1950' || docData._source.sosi != 'gard') && <div className="flex flex-wrap gap-8">
          {facetConfig[docDataset]
            ?.filter(item => item.key && !['sosi', 'datasets', 'adm'].includes(item.key))
            .map((facet) => {
              const value = getValueByPath(docData._source, facet.key);
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              return (
                <div key={facet.key} className="flex flex-col !p-0">
                  <strong className="text-neutral-800">{facet.label}</strong>
                  {Array.isArray(value) ? (
                    <ul className="!list-none flex flex-wrap gap-x-2 !m-0 !p-0">
                      {value.map((item, idx) => (
                        <li className="!p-0" key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="!p-0">{value}</p>
                  )}
                </div>
              );
            })}
        </div>}

        {docData?._source.location && docData?._source.group?.id && <div>
          <CollapsibleHeading headingLevel="h2" title="Koordinatinformasjon">
            <CoordinateInfo source={docData?._source} />
          </CollapsibleHeading>
        </div>}







        {docData?._source.images?.length > 0 && <div><h2>Sedler</h2><div className="flex flex-wrap gap-4">{docData?._source.images?.map((image: { manifest: string, dataset: string }) => {
          return <div key={image.manifest}>
            <Link href={"/iiif/" + image.manifest} className="text-sm text-neutral-800 no-underline">
              <Thumbnail manifestId={image.manifest} dataset={image.dataset} />

              <div>{datasetTitles[image.dataset]}</div>
            </Link>
          </div>


        })}</div></div>}





        {docData?._source.rawData ?
          <div>
            <OriginalData rawData={docData?._source.rawData} />
          </div>
          : null}


        {shouldShowCadastralSubdivisions &&
          <div className="mt-4">
            <h2 className="">Underordna bruk</h2>
            <CadastralTable
              dataset={docDataset}
              uuid={resolvedUuid}
              list={true}
              flush={true}
              groupId={(docData as any)?._source?.group?.id}
              showGroupLink={false}
              showMarkers={false}
            />
          </div>
        }

        <CollapsibleHeading alwaysOpen={true} headingLevel="h2" title="Data">

          <div className="flex gap-4 flex-wrap my-2 mb-8 text-neutral-950">
            <Link href={"/uuid/" + docData._source.uuid + ".json"} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiBracketsCurlyBold aria-hidden="true" />
              JSON
            </Link>
            <Link href={"/uuid/" + docData._source.uuid + ".jsonld"} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiBracketsCurlyBold aria-hidden="true" />
              JSON-LD
            </Link>
            {docData._source.location && <Link href={"/uuid/" + docData._source.uuid + ".geojson"} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiBracketsCurlyBold aria-hidden="true" />
              GeoJSON
            </Link>}
          </div>




        </CollapsibleHeading>


      </div>



      {datasetPresentation[docDataset] && <div className="flex flex-col lg:h-fit gap-4 my-4 lg:my-0">
        <aside className="bg-neutral-50 shadow-md !text-neutral-950 p-4 rounded-md">

          <h2 className="!m-0 !p-0 font-serif !text-xl !font-normal flex items-center gap-2">{datasetTitles[docDataset]}<IconButton label="Infoside" href={"/info/datasets/" + docDataset.split('_')[0]}><PiInfoFill className="text-neutral-800 text-primary-700" aria-hidden="true" /></IconButton></h2>
          <div className="text-sm text-neutral-800">{datasetShortDescriptions[docDataset]}</div>
        </aside>



        <GroupList docData={docData} />





      </div>}



    </div>
  )



}