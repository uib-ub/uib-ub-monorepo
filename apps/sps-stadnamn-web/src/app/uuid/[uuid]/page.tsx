import { fetchChildren, fetchDoc } from '@/app/api/_utils/actions'
import ErrorMessage from '@/components/error-message'
import { datasetPresentation, datasetShortDescriptions, datasetTitles } from '@/config/metadata-config'
import { infoPageRenderers } from '@/config/info-renderers'
import OriginalData from './original-data'
import Link from 'next/link'
import { PiBracketsCurlyBold } from 'react-icons/pi'
import Thumbnail from '@/components/image-viewer/thumbnail'
import CollapsibleHeading from '@/components/doc/collapsible-heading'
import CoordinateInfo from '@/components/search/info/coordinate-info'
import { treeSettings } from '@/config/server-config'
import ServerCadastreBreadcrumb from './server-cadastre-breadcrumb'
import ServerSourcesList from './server-sources-list'
import { getValueByPath } from '@/lib/utils'
import { facetConfig } from '@/config/search-config'
import ServerParent from './server-parent'
import JsonLdTable from './json-ld-table'
import { defaultDoc2jsonld, doc2jsonld } from '@/config/rdf-config'
import { redirect, notFound } from 'next/navigation'
import Etymology from '@/components/search/info/etymology'
import CadastralSubdivisions from '@/components/children/cadastral-subdivisions'

export async function generateMetadata( { params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const docData = await fetchDoc({uuid})

    return {
        title: docData?._source?.label || docData?._source.uuid,
        ...(docData?._source?.description && {
            description: docData._source.description
        })
    }
}

export default async function LandingPage({ params }: { params: Promise<{ uuid: string }>}) {
    const { uuid } = await params
    const docData = await fetchDoc({uuid})
    const docDataset = docData._index.split('-')[2]
    
    if (!docData || !docData._source) {
        notFound()
    }
    
    const [response] = await fetchChildren(
        docData._source.children 
            ? { uuids: docData._source.children, mode: 'table' }
            : { within: docData._source.uuid, dataset: docDataset, mode: 'table' }
    )
    const children = response?.hits?.hits || []

    if (docData.error) {
        return <ErrorMessage error={docData} message="Kunne ikke hente dokumentet"/>
    }

    if (docData._source.uuid != uuid && docData._source.redirects.includes(uuid)) {
        redirect(`/uuid/${docData._source.uuid}#${uuid}`)
    }

    

    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }

    // Get the keys of the object to use as table headers


    // TODO: create shared component for uuid/ and view/doc/
    // TODO: create tabs for info, json, geojson and jsonld
    return (
        <div className="page-info lg:grid lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div className="flex flex-col gap-6">
          {  docData?._source?.within && docDataset && <ServerCadastreBreadcrumb source={docData?._source} docDataset={docDataset} subunitName={treeSettings[docDataset]?.parentName}/>}
            <span>
              <h1>{docData?._source?.label || docData?._source.uuid}</h1>
              <div className="flex flex-wrap gap-6">

      {Array.isArray(docData?._source.wikiAdm) && docData?._source.wikiAdm?.length > 1 && 
        <>
        {[docData?._source.adm1, docData?._source.adm2].filter(item => typeof item == 'string').map((item, index) => <span key={index} className="inline whitespace-nowrap pr-1">{item}, </span>)}
        {[docData?._source.adm1, docData?._source.adm2, docData?._source.adm3].find(item => Array.isArray(item))?.map((item: any, index: number) => <Link key={index} href={'http://www.wikidata.org/entity/' + docData?._source.wikiAdm[index]}>{item}</Link>)}
        </>
      
        || docData?._source.wikiAdm &&  <span className="inline whitespace-nowrap"><Link  href={'http://www.wikidata.org/entity/' + docData?._source.wikiAdm}>
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
      {(docData?._source?.datasets?.includes('leks') || docData?._source?.datasets?.includes('rygh')) && 
      <div className="mt-4">
    <Etymology etymologyDataset={docData?._source?.datasets?.includes('leks') ? 'leks' : 'rygh'} uuids={[docData?._source.children]}/>
    </div>
    }
      
      </span>
            { infoPageRenderers[docDataset]? infoPageRenderers[docDataset](docData?._source) : null }


           {facetConfig[docDataset] && (docDataset != 'mu1950' || docData._source.sosi != 'gard') && <div className="flex flex-wrap gap-24">
        {facetConfig[docDataset]
          ?.filter(item => item.key && !['sosi', 'datasets'].includes(item.key))
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

          { docData?._source.location && <div>
          <CollapsibleHeading headingLevel="h2" title="Koordinatinformasjon">
            <CoordinateInfo source={docData?._source}/>
          </CollapsibleHeading>
        </div>}


        



      
      {docData?._source.images?.length > 0 && <div><h2>Sedler</h2><div className="flex flex-wrap gap-4">{docData?._source.images?.map((image: {manifest: string, dataset: string}) => {
        return <div key={image.manifest}>
        <Link href={"/iiif/" + image.manifest} className="text-sm text-neutral-800 no-underline">
        <Thumbnail manifestId={image.manifest} dataset={image.dataset}/>
              
        <div>{datasetTitles[image.dataset]}</div>
        </Link>
        </div>

        
      })}</div></div>}
        
      

    

      { docData?._source.rawData ?
        <div>
        <OriginalData rawData={docData?._source.rawData}/>
        </div>
      : null}

      
      {treeSettings[docDataset] && docData._source.sosi == 'gard' &&
      <div className="mt-4"> 
      <h2 className="">Underordna bruk</h2>
      <CadastralSubdivisions dataset={docDataset} doc={uuid} childrenData={children} landingPage={true}/>
      </div>
      }

<CollapsibleHeading alwaysOpen={false} headingLevel="h2" title="Data">

<div className="flex gap-4 flex-wrap my-2 mb-8 text-neutral-950">
  <Link href={"/uuid/" + docData._source.uuid + ".json"} className="flex whitespace-nowrap items-center gap-1 no-underline">
        <PiBracketsCurlyBold aria-hidden="true"/>
        JSON
  </Link>
  <Link href={"/uuid/" + docData._source.uuid + ".jsonld"} className="flex whitespace-nowrap items-center gap-1 no-underline">
        <PiBracketsCurlyBold aria-hidden="true"/>
        JSON-LD
  </Link>
  {docData._source.location && <Link href={"/uuid/" + docData._source.uuid + ".geojson"} className="flex whitespace-nowrap items-center gap-1 no-underline">
        <PiBracketsCurlyBold aria-hidden="true"/>
        GeoJSON
  </Link>}
  </div>




{<JsonLdTable jsonLd={doc2jsonld[docDataset as keyof typeof doc2jsonld] ? 
    doc2jsonld[docDataset as keyof typeof doc2jsonld](docData._source, children) : 
    defaultDoc2jsonld(docData._source, children)}/>}
</CollapsibleHeading>


    </div>

    
    
     {datasetPresentation[docDataset] && <div className="flex flex-col lg:h-fit gap-4 my-4 lg:my-0">
    <aside className="bg-neutral-50 shadow-md !text-neutral-950 px-4 pb-4 pt-0 rounded-md">
      <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0">Datasett</h2>
      <h3 className="!m-0 !p-0 font-serif !text-xl !font-normal">{datasetTitles[docDataset]}</h3>
      <div className="text-sm text-neutral-800">{datasetShortDescriptions[docDataset]}</div>

      <div className="flex gap-2 mt-4 w-full">
        <Link href={"/search?dataset=" + docDataset + "&doc=" + uuid} className="btn btn-outline">Eiga søkevisning</Link>
        <Link href={"/info/datasets/" + docDataset } className="btn btn-outline">Les meir</Link>
      </div>
    </aside>
     {docDataset != 'search' && <ServerParent uuid={uuid}/>}
     { docDataset == 'search' && children.length > 0 && 
      <aside className="bg-neutral-50 shadow-md !text-neutral-950 px-4 pb-4 pt-0 rounded-md">
        <h2 className="!text-neutral-800 !uppercase !font-semibold !tracking-wider !text-sm !font-sans !m-0">Kjelder</h2>
        <ServerSourcesList childrenData={children}/>
      </aside>
     }
     


     
    </div>}

    

  </div>
    )



}