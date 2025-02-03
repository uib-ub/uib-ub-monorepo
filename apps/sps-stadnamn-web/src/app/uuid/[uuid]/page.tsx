
import { fetchDoc } from '@/app/api/_utils/actions'
import ErrorMessage from '@/components/error-message'
import { datasetTitles } from '@/config/metadata-config'
import { infoPageRenderers } from '@/config/info-renderers'
import OriginalData from './original-data'
import Link from 'next/link'
import { PiDatabaseFill, PiMagnifyingGlass, PiWarningFill } from 'react-icons/pi'
import CopyLink from '@/components/doc/copy-link'
import Thumbnail from '@/components/image-viewer/thumbnail'
import Sources from './sources'

export async function generateMetadata( { params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const doc = await fetchDoc({uuid})

    return {
        title: doc?._source.label,
        description: doc?._source.description
    }
}

export default async function LandingPage({ params }: { params: Promise<{ uuid: string }>}) {
    const { uuid } = await params
    const doc = await fetchDoc({uuid})


    if (doc.error) {
        return <ErrorMessage error={doc} message="Kunne ikke hente dokumentet"/>
      }

    const docDataset = doc._index.split('-')[2]

    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }

    // Get the keys of the object to use as table headers


    // TODO: create shared component for uuid/ and view/doc/
    // TODO: create tabs for info, json, geojson and jsonld
    return (
        <div className="page-info flex flex-col flex-grow space-y-6">
          <span>
            <h1>{doc._source.label}</h1>
            <div className="flex flex-wrap gap-4">

      {Array.isArray(doc._source.wikiAdm) && doc._source.wikiAdm?.length > 1 && 
        <>
        {[doc._source.adm1, doc._source.adm2].filter(item => typeof item == 'string').map((item, index) => <span key={index} className="inline whitespace-nowrap pr-1">{item}, </span>)}
        {[doc._source.adm1, doc._source.adm2, doc._source.adm3].find(item => Array.isArray(item))?.map((item: any, index: number) => <Link key={index} href={'http://www.wikidata.org/entity/' + doc._source.wikiAdm[index]}>{item}</Link>)}
        </>
      
        || doc._source.wikiAdm &&  <span className="inline whitespace-nowrap"><Link  href={'http://www.wikidata.org/entity/' + doc._source.wikiAdm}>
          {doc._source.adm3 && multivalue(doc._source.adm3) + " – "}
          {doc._source.adm2 && multivalue(doc._source.adm2) + ", "}
          {multivalue(doc._source.adm1)}</Link> </span>
        || doc._source.adm1 && <span className="inline whitespace-nowrap">
          {doc._source.adm3 && multivalue(doc._source.adm3) + " – "}
          {doc._source.adm2 && multivalue(doc._source.adm2) + ", "}
          {multivalue(doc._source.adm1)}
        </span>
      
      }
      { docDataset != 'nbas' && (doc._source.datasets?.length > 1 || doc._source.datasets?.[0] != 'nbas') ? 
          <CopyLink uuid={doc._source.uuid}/> 
          : <div className="flex gap-1 items-center w-full"><PiWarningFill className="inline text-primary-600 text-lg"/>Datasettet  er under utvikling. Denne siden kan derfor bli slettet</div> // NBAS uris aren't stable until we've fixed errors in the dataset
      }

      </div>
      
      </span>
            { docDataset != 'search' ?
            <div className='self-start'><Link className="btn btn-outline text-xl flex gap-2 no-underline" href={"/search?dataset=" + docDataset + "?doc=" + uuid}><PiDatabaseFill aria-hidden="true" className="text-2xl"/>{ datasetTitles[docDataset]}</Link></div>
            :
            <div className='self-start'><Link className="btn btn-outline text-xl flex gap-2 no-underline" href={"/search?doc=" + uuid}><PiMagnifyingGlass aria-hidden="true" className="text-2xl"/>Vis i stadnamnsøket</Link></div>
}
            { infoPageRenderers[docDataset]? infoPageRenderers[docDataset](doc._source) : null }

      
      {doc._source.images?.map((image: {manifest: string, dataset: string}) => {
        return <div key={image.manifest}>
        <h2>Sedler</h2>
        <Link href={"/iiif/" + image.manifest} className="text-sm text-neutral-800 no-underline">
        <Thumbnail manifestId={image.manifest} dataset={docDataset}/>
              
        <div>{datasetTitles[image.dataset]}</div>
        </Link>
        </div>

        
      })}
        { doc._source.rawData ?
        <div>
        <OriginalData rawData={doc._source.rawData}/>
        </div>
      : null}
      
      { docDataset == 'search' &&
        <div>
        <h2>Kjelder</h2>
        <Sources uuids={doc._source.children}/>
        </div>

        



      }
    </div>
    )



}